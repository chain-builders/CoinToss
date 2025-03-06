from web3 import Web3

# Connect to the Ethereum testnet (e.g., Ropsten)
infura_url = "https://ropsten.infura.io/v3/YOUR_INFURA_PROJECT_ID"
web3 = Web3(Web3.HTTPProvider(infura_url))

# Check if connected to the testnet
if not web3.isConnected():
    raise Exception("Failed to connect to the Ethereum testnet")

# Smart contract address and ABI
contract_address = "0xYourSmartContractAddress"
contract_abi = [
    # Add your contract ABI here
]

# Create contract instance
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

# Get the most recent block
latest_block = web3.eth.get_block('latest')

# Define the event you are looking for
event_signature_hash = web3.sha3(text="YourEventName(type1,type2,...)").hex()

# Filter logs for the specific event in the latest block
logs = web3.eth.get_logs({
    'fromBlock': latest_block['number'],
    'toBlock': latest_block['number'],
    'address': contract_address,
    'topics': [event_signature_hash]
})

# Process the logs
for log in logs:
    event = contract.events.YourEventName().processLog(log)
    print(event)

print("Script executed successfully.")