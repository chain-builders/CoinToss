import asyncio
import os
import json
import logging
import argparse
from web3 import WebSocketProvider, AsyncWeb3
from dotenv import load_dotenv

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s'
)

logger = logging.getLogger(__name__)

load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

class SocketManager:
    def __init__(self):
        # Environment variables
        self.alchemy_ws_url = os.getenv("ALCHEMY_WS_URL")
        self.contract_address = os.getenv('STAKING_CONTRACT_ADDRESS')
        self.contract_abi_path = os.getenv('CONTRACT_ABI_PATH')
        self.private_key = os.getenv('CONTRACT_OWNER_PRIVATE_KEY')

        # Web3 instances
        self.ws_w3 = None
        self.contract = None

    def validate_env_vars(self):
        """Validate required environment variables"""
        missing_vars = []
        if not self.alchemy_ws_url:
            missing_vars.append("ALCHEMY_WS_URL")
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

    async def connect_socket(self, transaction_manager):
        """
        Listen to contract events using WebSocket provider
        """
        try:
            self.validate_env_vars()
            # Create WebSocket connection
            print(self.alchemy_ws_url)
            w3 = AsyncWeb3(WebSocketProvider(self.alchemy_ws_url))
            
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
            pool_created_signature_hash = w3.keccak(
                text="PoolCreated(uint256,uint256,uint256)"
            ).hex()
            round_completed_signature_hash = w3.keccak(
                text="RoundCompleted(uint256,uint256,uint8)"
            ).hex()
            pool_completed_signature_hash = w3.keccak(
                text="PoolCompleted(uint256,uint256)"
            ).hex()
            # Subscribe to logs
            subscription = await w3.eth.subscribe("logs", {
                "address": w3.to_checksum_address(self.contract_address),
                "topics": [pool_created_signature_hash, round_completed_signature_hash ,pool_completed_signature_hash]
            })
            logger.info(f"Subscribed with ID: {subscription}")

            # Listen to events
            async for log in w3.eth.get_logs({"address": self.contract_address}):
                try:
                    # Decode log event
                    if log['topics'][0].hex() == pool_created_signature_hash:
                        decoded_log = contract.events.PoolCreated().process_log(log)
                        event_name = "PoolCreated"
                    elif log['topics'][0].hex() == round_completed_signature_hash:
                        decoded_log = contract.events.RoundCompleted().process_log(log)
                        event_name = "RoundCompleted"
                    elif log['topics'][0].hex() == pool_completed_signature_hash:
                        decoded_log = contract.events.PoolCompleted().process_log(log)
                        event_name = "PoolCompleted"
                    else:
                        continue
                    
                    # Extract event details
                    event_args = decoded_log['args']
                    logger.info(f"{event_name} : {event_args}")
                    
                    # Additional processing
                    if event_name == "PoolCreated":
                        pool_id = event_args.get('poolId')
                        entry_fee = event_args.get('entryFee')
                        max_participants = event_args.get('maxParticipants')                        
                        logger.info(f"Pool Details - ID: {pool_id}, Entry Fee: {entry_fee}, Max Participants: {max_participants}")
                        # set timer for round completed call
                        await asyncio.sleep(280)
                        transaction_manager.process_round_results(pool_id, 1)

                    elif event_name == "RoundCompleted":
                        pool_id = event_args.get('poolId')
                        round = event_args.get('round')
                        winning_selection = event_args.get('winningSelection')
                        logger.info(f"{pool_id} {round} {winning_selection}")
                        # set timer for round completed call
                        await asyncio.sleep(280)
                        transaction_manager.process_round_results(pool_id, round)

                    elif event_name == "PoolCompleted":
                        pool_id = event_args.get('poolId')
                        prize_pool = event_args.get('prizePool')
                        logger.info(f"{pool_id} {prize_pool}")
                        # create new pool
                        transaction_manager.create_pool(5, 10)

                
                except Exception as log_error:
                    logger.error(f"Error processing log: {log_error}")

        except Exception as e:
            logger.error(f"Event listening error: {e}")