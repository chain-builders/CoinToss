
from web3 import Web3
import json
import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))


INFURA_URL = os.getenv("INFURA_URL")
STAKING_CONTRACT_ADDRESS=os.getenv('STAKING_CONTRACT_ADDRESS')

class BlockchainConnector:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(INFURA_URL))
        self.load_contracts()
        
    def load_contracts(self):
        abi = os.getenv("CONTRACT_ABI_PATH")
        print("Contract abi:", abi)
        with open(os.getenv("CONTRACT_ABI_PATH")) as f:
            stake_contract_json = json.load(f)
        
        self.staking_contract = self.w3.eth.contract(
            address=STAKING_CONTRACT_ADDRESS,
            abi=stake_contract_json['abi']
        )


    def create_pool(self, entry_fee, max_participants):


        account = self.w3.eth.account.from_key(os.path.join(os.getenv('CONTRACT_OWNER_PRIVATE_KEY')))
        
        txn = self.staking_contract.functions.createPool(
            entry_fee,
            max_participants
        ).build_transaction({
            'from': account.address,
            'nonce': self.w3.eth.get_transaction_count(account.address),
            'gas': 200000,  
            'gasPrice': self.w3.eth.gas_price,
        })
        

        signed_txn = self.w3.eth.account.sign_transaction(txn, os.path.join(os.getenv("CONTRACT_OWNER_PRIVATE_KEY")))
        
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        

        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Check if transaction was successful
        if receipt['status'] == 1:
            pool_id = None
            for log in receipt['logs']:
                try:
                    decoded_log = self.staking_contract.events.PoolCreated().process_log(log)
                    pool_id = decoded_log['args']['poolId']
                    break
                except:
                    continue
                    
            return {
                'tx_hash': tx_hash.hex(),
                'pool_id': pool_id,
                'status': 'success'
            }
        else:
            return {
                'tx_hash': tx_hash.hex(),
                'status': 'failed'
            }
