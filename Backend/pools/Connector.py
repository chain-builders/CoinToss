
from web3 import Web3
import json
import os
from django.conf import settings


ALCHEMY_URL = os.getenv("ALCHEMY_URL/INFURA_URL")

class BlockchainConnector:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(ALCHEMY_URL))
        self.load_contracts()
        
    def load_contracts(self):

        with open(os.path.join(os.getenv("CONTRACT_ABI_PATH"), "StakingContract.json")) as f:
            stake_contract_json = json.load(f)
        
        self.staking_contract = self.w3.eth.contract(
            address=settings.STAKING_CONTRACT_ADDRESS,
            abi=stake_contract_json['abi']
        )


def create_pool(self, entry_fee, max_participants):

    account = self.w3.eth.account.from_key(settings.CONTRACT_OWNER_PRIVATE_KEY)
    
    txn = self.staking_contract.functions.createPool(
        entry_fee,
        max_participants
    ).build_transaction({
        'from': account.address,
        'nonce': self.w3.eth.get_transaction_count(account.address),
        'gas': 200000,  
        'gasPrice': self.w3.eth.gas_price,
    })
    

    signed_txn = self.w3.eth.account.sign_transaction(txn, settings.CONTRACT_OWNER_PRIVATE_KEY)
    
    tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    

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
