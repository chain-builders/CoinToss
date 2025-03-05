from web3 import Web3
from web3.middleware import geth_poa_middleware

# Example Web3 connection
w3 = Web3(Web3.HTTPProvider("https://eth-sepolia.g.alchemy.com/v2/YOUR-ALCHEMY-KEY"))

# Inject middleware for PoA chains
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

print("Connected:", w3.is_connected())
