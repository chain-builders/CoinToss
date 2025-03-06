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

load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

class TransactionManager:
    def __init__(self):
        self.alchemy_http_url = os.getenv("ALCHEMY_URL")
        self.contract_address = os.getenv('STAKING_CONTRACT_ADDRESS')
        self.contract_abi_path = os.getenv('CONTRACT_ABI_PATH')
        self.private_key = os.getenv('CONTRACT_OWNER_PRIVATE_KEY')

        self.http_w3 = None
        self.contract = None

    def validate_env_vars(self):
        missing_vars = []
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

    def perform_transaction(self, method_name, *args):
        if not self.http_w3:
            self.initialize_web3_connections()

    def get_logs(self, event_name):
        if not self.http_w3:
            self.initialize_web3_connections()

        '''logs = self.http_w3.eth.get_logs({
            'fromBlock': 0,
            'address': self.contract.address
        })'''
        print('Getting logs', event_name)
        if event_name == 'PoolActivated':
            print('Getting PoolActivated logs')
            logs = self.contract.events.PoolActivated().get_logs(from_block=0)
            print('Logs:', logs)
            for log in logs:
                print(log)
                decoded_log = self.contract.events.PoolActivated().process_log(log)
                event_args = decoded_log['args']
                print(event_args)
                #await asyncio.sleep(280)
                self.process_round_results(event_args.get('poolId'), 1)
        elif event_name == 'RoundConcluded':
            logs = self.contract.events.RoundConcluded().get_logs(from_block=self.http_w3.eth.block_number)
            for log in logs:
                print(log)
                decoded_log = self.contract.events.RoundConcluded().process_log(log)
                event_args = decoded_log['args']
                print(event_args)
                #await asyncio.sleep(280)
                self.process_round_results(event_args.get('poolId'), event_args.get('round'))
        elif event_name == 'PoolCompleted':
            logs = self.contract.events.PoolCompleted().get_logs(from_block=self.http_w3.eth.block_number)
            for log in logs:
                print(log)
                decoded_log = self.contract.events.PoolCompleted().process_log(log)
                event_args = decoded_log['args']
                print(event_args)
                self.create_pool(5, 10)
        return logs

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
        print(f"Transaction sent: {tx_hash.hex()}")
        return {'tx_hash': tx_hash.hex(), 'status': 'pending'}

    def join_pool(self, pool_id):
        if not self.http_w3:
            self.initialize_web3_connections()
        
        account = self.http_w3.eth.account.from_key(self.private_key)
        txn = self.contract.functions.joinPool(
            pool_id
        ).build_transaction({
            'from': account.address,
            'nonce': self.http_w3.eth.get_transaction_count(account.address),
            'gas': 200000,
            'gasPrice': self.http_w3.eth.gas_price,
            'value': 5
        })
        signed_txn = self.http_w3.eth.account.sign_transaction(txn, self.private_key)
        tx_hash = self.http_w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        print(f"Transaction sent: {tx_hash.hex()}")
        return {'tx_hash': tx_hash.hex(), 'status': 'pending' }
    
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