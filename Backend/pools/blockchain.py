import os
import json
import logging
import time
from web3 import Web3
from dotenv import load_dotenv

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s'
)

logger = logging.getLogger(_name_)

load_dotenv(os.path.join(os.path.dirname(_file_), '../.env'))

class BlockchainManager:
    def _init_(self):
        self.alchemy_http_url = os.getenv("ALCHEMY_HTTP_URL")
        self.contract_address = os.getenv('CONTRACT_ADDRESS')
        self.contract_abi_path = os.getenv('CONTRACT_ABI_PATH')
        self.private_key = os.getenv('CONTRACT_OWNER_PRIVATE_KEY')

        self.http_w3 = None
        self.contract = None

    def validate_env_vars(self):
        missing_vars = []
        if not self.alchemy_http_url:
            missing_vars.append("ALCHEMY_HTTP_URL")
        if not self.contract_address:
            missing_vars.append("CONTRACT_ADDRESS")
        if not self.contract_abi_path:
            missing_vars.append("CONTRACT_ABI_PATH")
        if not self.private_key:
            missing_vars.append("CONTRACT_OWNER_PRIVATE_KEY")
        
        if missing_vars:
            raise ValueError(f"Missing environment variables: {', '.join(missing_vars)}")
        
    def load_contract_abi(self):
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
        self.validate_env_vars()
        self.http_w3 = Web3(Web3.HTTPProvider(self.alchemy_http_url))
        contract_abi = self.load_contract_abi()
        self.contract = self.http_w3.eth.contract(
            address=self.http_w3.to_checksum_address(self.contract_address),
            abi=contract_abi
        )
        print('Web3 connections initialized')
        print(self.contract)

    def check_logs(self):
        # Get event signature hash for PoolCreated event
        pool_activated_signature_hash = self.http_w3.keccak(
            text="PoolActivated(uint256)"
        ).hex()
        round_completed_signature_hash = self.http_w3.keccak(
            text="RoundCompleted(uint256,uint256,uint8)"
        ).hex()
        pool_completed_signature_hash = self.http_w3.keccak(
            text="PoolCompleted(uint256,uint256)"
        ).hex()

        latest_block = self.http_w3.eth.get_block('latest')
        logs = self.http_w3.eth.get_logs({
            'fromBlock': latest_block['number'],
            'toBlock': latest_block['number'],
            'address': self.contract_address,
            'topics': [pool_activated_signature_hash, round_completed_signature_hash, pool_completed_signature_hash]
        })

        for log in logs:
            if log['topics'][0].hex() == pool_activated_signature_hash:
                decoded_log = self.contract.events.PoolCreated().process_log(log)
                event_name = "PoolCreated"
            elif log['topics'][0].hex() == round_completed_signature_hash:
                decoded_log = self.contract.events.RoundCompleted().process_log(log)
                event_name = "RoundCompleted"
            elif log['topics'][0].hex() == pool_completed_signature_hash:
                decoded_log = self.contract.events.PoolCompleted().process_log(log)
                event_name = "PoolCompleted"
            else:
                continue


            # Extract event details
            event_args = decoded_log['args']
            logger.info(f"{event_name} : {event_args}")
            
            # Additional processing
            if event_name == "PoolCreated":
                pool_id = event_args['poolId']
                entry_fee = event_args['entryFee']
                max_participants = event_args['maxParticipants']                       
                logger.info(f"Pool Details - ID: {pool_id}, Entry Fee: {entry_fee}, Max Participants: {max_participants}")
                # set timer for round completed call
                time.sleep(280)
                self.process_round_results(pool_id, 1)

            elif event_name == "RoundCompleted":
                pool_id = event_args['poolId']
                round = event_args['round']
                winning_selection = event_args['winningSelection']
                logger.info(f"{pool_id} {round} {winning_selection}")
                # set timer for round completed call
                time.sleep(280)
                self.process_round_results(pool_id, round)

            elif event_name == "PoolCompleted":
                pool_id = event_args['poolId']
                prize_pool = event_args['prizePool']
                logger.info(f"{pool_id} {prize_pool}")
                # create new pool
                self.create_pool(5, 10)

    def process_round_results(self, pool_id, round):
        if not self.http_w3:
            self.initialize_web3_connections()

        account = self.http_w3.eth.account.from_key(self.private_key)
        txn = self.contract.functions.concludeRound(
            pool_id,
            round
        ).build_transaction({
            'from': account.address,
            'nonce': self.http_w3.eth.get_transaction_count(account.address),
            'gas': 200000,
            'gasPrice': self.http_w3.eth.gas_price,
        })
        signed_txn = self.http_w3.eth.account.sign_transaction(txn, self.private_key)
        tx_hash = self.http_w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        print(f"Transaction sent: {tx_hash.hex()}")
        return {'tx_hash': tx_hash.hex(), 'status': 'pending'}
    
    def create_pool(self, entry_fee, max_participants):
        if not self.http_w3:
            self.initialize_web3_connections()

        account = self.http_w3.eth.account.from_key(self.private_key)
        txn = self.contract.functions.createPool(
            entry_fee,
            max_participants
        ).build_transaction({
            'from': account.address,
            'nonce': self.http_w3.eth.get_transaction_count(account.address),
            'gas': 200000,
            'gasPrice': self.http_w3.eth.gas_price,
        })
        signed_txn = self.http_w3.eth.account.sign_transaction(txn, self.private_key)
        tx_hash = self.http_w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        print(f"Create Pool sent: {tx_hash.hex()}")
        return {'tx_hash': tx_hash.hex(), 'status': 'pending'}