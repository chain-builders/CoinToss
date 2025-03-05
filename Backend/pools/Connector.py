import asyncio
import os
import json
import logging
import argparse
from web3 import Web3, AsyncWeb3
from dotenv import load_dotenv

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

class EthereumPoolManager:
    def __init__(self):
        # Environment variables
        self.alchemy_ws_url = os.getenv("ALCHEMY_WS_URL")
        self.alchemy_http_url = os.getenv("ALCHEMY_URL")
        self.contract_address = os.getenv('STAKING_CONTRACT_ADDRESS')
        self.contract_abi_path = os.getenv('CONTRACT_ABI_PATH')
        self.private_key = os.getenv('CONTRACT_OWNER_PRIVATE_KEY')

        # Web3 instances
        self.ws_w3 = None
        self.http_w3 = None
        self.contract = None

    def validate_env_vars(self):
        """Validate required environment variables"""
        missing_vars = []
        if not self.alchemy_ws_url:
            missing_vars.append("ALCHEMY_WS_URL")
        if not self.alchemy_http_url:
            missing_vars.append("ALCHEMY_URL")
        if not self.contract_address:
            missing_vars.append("STAKING_CONTRACT_ADDRESS")
        if not self.contract_abi_path:
            missing_vars.append("CONTRACT_ABI_PATH")
        if not self.private_key:
            missing_vars.append("CONTRACT_OWNER_PRIVATE_KEY")
        
        if missing_vars:
            raise ValueError(f"Missing environment variables: {', '.join(missing_vars)}")

    def load_contract_abi(self):
        """Load contract ABI from JSON file"""
        try:
            with open(self.contract_abi_path, 'r') as f:
                return json.load(f)['abi']
        except FileNotFoundError:
            logger.error(f"ABI file not found at {self.contract_abi_path}")
            raise
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON in ABI file at {self.contract_abi_path}")
            raise

    def initialize_web3_connections(self):
        """Initialize Web3 connections"""
        self.validate_env_vars()
        
        # HTTP connection for transactions
        self.http_w3 = Web3(Web3.HTTPProvider(self.alchemy_http_url))
        
        # Contract instance for HTTP
        contract_abi = self.load_contract_abi()
        self.contract = self.http_w3.eth.contract(
            address=self.http_w3.to_checksum_address(self.contract_address),
            abi=contract_abi
        )

    def create_pool(self, entry_fee, max_participants):
        """Sends a transaction to create a pool and returns transaction details."""
        if not self.http_w3:
            self.initialize_web3_connections()

        # Get the account from private key
        account = self.http_w3.eth.account.from_key(self.private_key)
        
        # Build transaction
        txn = self.contract.functions.createPool(
            entry_fee, 
            max_participants
        ).build_transaction({
            'from': account.address,
            'nonce': self.http_w3.eth.get_transaction_count(account.address),
            'gas': 200000,
            'gasPrice': self.http_w3.eth.gas_price,
        })

        # Sign and send transaction
        signed_txn = self.http_w3.eth.account.sign_transaction(txn, self.private_key)
        tx_hash = self.http_w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        
        print(f"Transaction sent: {tx_hash.hex()}")
        return {'tx_hash': tx_hash.hex(), 'status': 'pending'}

    async def listen_to_events(self):
        """
        Listen to contract events using WebSocket provider
        """
        try:
            # Print WebSocket URL for verification
            print(f"WebSocket URL: {self.alchemy_ws_url}")  
            # Create WebSocket connection
            w3 = AsyncWeb3(AsyncWeb3.WebSocketProvider(self.alchemy_ws_url))
            
            
            # Verify connection
            is_connected = await w3.is_connected()
            logger.info(f"Web3 Connection Status: {is_connected}")
            
            if not is_connected:
                logger.error("Failed to connect to Ethereum network")
                return

            # Load contract ABI
            contract_abi = self.load_contract_abi()
            
            # Create contract instance
            contract = w3.eth.contract(
                address=w3.to_checksum_address(self.contract_address),
                abi=contract_abi
            )

            # Get event signature hash for PoolCreated event
            event_signature_hash = w3.keccak(
                text="PoolCreated(uint256,uint256,uint256)"
            ).hex()

            # Subscribe to logs
            subscription = await w3.eth.subscribe("logs", {
                "address": w3.to_checksum_address(self.contract_address),
                "topics": [event_signature_hash]
            })
            logger.info(f"Subscribed with ID: {subscription}")

            # Listen to events
            async for log in w3.eth.get_logs({"address": self.contract_address}):
                try:
                    # Decode log event
                    decoded_log = contract.events.PoolCreated().process_log(log)
                    
                    # Extract event details
                    event_args = decoded_log['args']
                    logger.info(f"New Pool Created: {event_args}")
                    
                    # Additional processing
                    pool_id = event_args.get('poolId')
                    entry_fee = event_args.get('entryFee')
                    max_participants = event_args.get('maxParticipants')
                    
                    logger.info(f"Pool Details - ID: {pool_id}, Entry Fee: {entry_fee}, Max Participants: {max_participants}")
                
                except Exception as log_error:
                    logger.error(f"Error processing log: {log_error}")

        except Exception as e:
            logger.error(f"Event listening error: {e}")

def parse_arguments():
    """Parse command-line arguments for pool creation"""
    parser = argparse.ArgumentParser(description="Ethereum Pool Creation Script")
    parser.add_argument('--entry-fee', type=int, required=True, 
                        help="Entry fee for the pool (in wei)")
    parser.add_argument('--max-participants', type=int, required=True, 
                        help="Maximum number of participants in the pool")
    return parser.parse_args()

async def main():
    # Parse command-line arguments
    args = parse_arguments()
    alchemy_ws_url=os.getenv("ALCHEMY_WS_URL")

    # Create pool manager
    pool_manager = EthereumPoolManager()


    # Perform pool creation
    pool_manager.create_pool(args.entry_fee, args.max_participants)
    print(f"WebSocket URL: {alchemy_ws_url}") 

    # Listen to events
    await pool_manager.listen_to_events()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Pool creation and event listening stopped by user")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")