# TheOnePercent Smart Contracts

## Overview
TheOnePercent is a gaming smart contract designed to bring a unique experience to players, leveraging Solidity, OpenZeppelin, and Foundry for robust development and testing. This repository includes all necessary scripts for testing, deploying, interacting with, and creating pools within the contract.

## Features
- Built using **Solidity** and **OpenZeppelin** security best practices.
- Uses **Foundry** for development, testing, and scripting.
- Implements **custom errors and events** via the `lib` directory to optimize gas usage.
- Includes scripts for **deployment, interaction, and pool creation**.
- Utilizes **remappings** for cleaner and more efficient imports.

## License
All contracts in this project are licensed under `UNLICENSED`.

## Installation
Ensure you have **Foundry** installed. If not, install it with:
```sh
curl -L https://foundry.paradigm.xyz | bash
foundryup
```
Clone the repository and install dependencies:
```sh
git clone <repo-url>
cd TheOnePercent
forge install
```

## Running Tests
To execute the test suite, run:
```sh
forge test
```

## Deployment
Deploy the contract using Foundry scripts:
```sh
forge script script/Deploy.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
```

## Interaction
Interact with the contract using:
```sh
forge script script/Interact.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
```

## Creating a Pool
To create a new pool:
```sh
forge script script/CreatePool.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
```

# Main Smart Contract (CoinToss.sol)

## Overview
CoinToss.sol is the main smart contract for TheOnePercent. Users can join pools, participate in multiple rounds of coin toss selections, and compete for a prize pool. The contract manages player participation, enforces game rules, tracks winners, and distributes rewards based on game outcomes.

## Features
- **Pool Creation**: The contract owner can create pools with a defined entry fee and maximum number of participants.
- **Joining Pools**: Players can join pools by paying the required entry fee.
- **Game Rounds**: Players make a selection (HEADS or TAILS) each round.
- **Automatic Round Conclusion**: The contract determines winners based on majority selection, or a random choice in case of a tie.
- **Elimination System**: Players selecting the losing side are eliminated.
- **Final Winners**: The last standing players win the pool prize.
- **Points System**: Players earn points for joining, winning rounds, and winning the final prize.
- **Event Emissions**: The contract emits events for key actions like pool creation, player joining, round completion, and winners' announcements.

## Contract Components

### Enums
- `PlayerChoice`: Represents a player's choice in a round (`NONE`, `HEADS`, `TAILS`).
- `PoolStatus`: Represents the status of a pool (`OPENED`, `ACTIVE`, `CLOSED`).

### Structs
- `Player`: Stores player details including their choice, elimination status, and claim status.
- `Pool`: Stores pool details, player mappings, and round tracking information.
- `PoolInfo`: Provides an overview of a pool’s details.

### Key Variables
- `poolCount`: Tracks the total number of pools.
- `pools`: Mapping of pool ID to `Pool` struct.
- `userPools`: Tracks pools a player has joined.
- `playerPoints`: Tracks players' accumulated points.

## Functions

### Pool Management
- `createPool(uint _entryFee, uint _maxParticipants)`: Creates a new pool.
- `joinPool(uint _poolId)`: Allows a player to join a pool by paying the entry fee.
- `getPoolInfo(uint256 _poolId)`: Retrieves pool details.

### Game Play
- `makeSelection(uint _poolId, PlayerChoice _choice)`: Allows a player to make their round selection.
- `roundResult(uint _poolId, uint _round)`: Determines round winners and losers.
- `concludeRound(uint _poolId, uint _round)`: Allows the owner to conclude a round manually if necessary.

### Winner Tracking
- `getRoundWinners(uint _poolId, uint _round)`: Returns the winners of a specific round.
- `getRoundLosers(uint _poolId, uint _round)`: Returns the losers of a specific round.

## Access Control
- **Owner-only functions**: Pool creation and manual round conclusion require `onlyOwner`.
- **Modifiers**: `poolExists(_poolId)` ensures valid pool access.

## Events
- `PoolCreated(poolId, entryFee, maxParticipants)`: Emitted when a pool is created.
- `PlayerJoined(poolId, player)`: Emitted when a player joins a pool.
- `PoolActivated(poolId)`: Emitted when a pool reaches max participants and becomes active.
- `RoundCompleted(poolId, round, winningSelection)`: Emitted when a round is concluded.
- `RoundWinners(poolId, round, winners)`: Emitted with round winners.
- `RoundLosers(poolId, round, losers)`: Emitted with round losers.
- `PoolCompleted(poolId, prizePool)`: Emitted when a pool concludes and final winners are determined.

## Notes
- The contract utilizes Chainlink VRF for randomness in case of ties.
- Prize distribution and claiming mechanisms are not included in the provided contract snippet.

# CoinToss Smart Contract Test Suite

## Overview
This repository contains the test suite for the `CoinToss` smart contract, implemented using Foundry's Solidity testing framework. The tests verify the core functionalities of the contract, ensuring that pool creation, player participation, selection-making, and prize claiming work as expected.

## Prerequisites
- Install [Foundry](https://book.getfoundry.sh/getting-started/installation) to run the tests.
- Ensure that the `CoinToss.sol` contract is correctly placed in the `src` directory.

## Running Tests
To execute the tests, run the following command in your terminal:
```sh
forge test
```

## Test Cases

### 1. `test_CreatePool()`
**Description:** Verifies that a pool is created successfully with the correct parameters.

**Assertions:**
- Entry fee and maximum participants are set correctly.
- The initial pool state is `OPENED`.
- Prize pool and current participants are zero.
- Maximum winners are set to `2`.

### 2. `test_JoinPool()`
**Description:** Ensures that a player can join a pool by paying the entry fee.

**Assertions:**
- The number of participants increases after joining.
- The prize pool is updated correctly.

### 3. `test_MakeSelection()`
**Description:** Validates the selection-making process during the game.

**Assertions:**
- The pool status updates to `ACTIVE` when enough players join.
- Players can make selections.
- The correct winner is determined.
- The pool status updates to `CLOSED` after the round ends.

### 4. `test_ClaimPrize()`
**Description:** Ensures that a winner can claim their prize after winning the game.

**Assertions:**
- The winner's balance increases correctly.
- The prize pool is distributed properly.
- Players cannot claim the prize twice.

### 5. `testRevert_JoinClosedPool()`
**Description:** Ensures that players cannot join a pool that has already reached the participant limit.

**Expected Behavior:**
- Reverts with an appropriate error message when trying to join a closed pool.

# CoinToss Deployment Script

## Overview
This script deploys the `CoinToss` smart contract and initializes multiple betting pools with different entry fees and participant limits.

## Prerequisites
Ensure you have the following installed and configured before running the script:
- [Foundry](https://github.com/foundry-rs/foundry) (for `forge` and `cast` commands)
- A valid Ethereum private key set as an environment variable (`PRIVATE_KEY`)

## Deployment Steps
   ```sh
   forge script script/CoinTossScript.s.sol --rpc-url <your-rpc-url> --broadcast
   ```

## Script Functionality
- Retrieves the deployer's private key from the environment variables.
- Deploys the `CoinToss` smart contract.
- Creates multiple betting pools with predefined entry fees and participant limits.
- Logs contract deployment and pool creation details.

## Pool Configurations
| Pool ID | Entry Fee (ETH) | Max Participants |
|---------|---------------|------------------|
| 0       | 0.01          | 5                |
| 1       | 0.02          | 10               |
| 2       | 2             | 20               |
| 3       | 10            | 100              |
| 4       | 5             | 50               |
| 5       | 0.02          | 10               |
| 6       | 0.03          | 5                |

## Notes
- Ensure your Ethereum wallet has enough funds to cover deployment and transaction fees.
- Modify the script as needed to adjust pool parameters.
- Double-check that the private key is set securely and not exposed in public repositories.


# Coin Toss Interaction and Pool Creation Script

## Overview
This repository contains two Solidity scripts used to interact with the Coin Toss smart contract. The first script, `CoinTossInteraction.sol`, facilitates a simulated interaction where multiple players join a Coin Toss game pool, make selections, and claim their winnings. The second script, `DeployInteractionScript.sol`, is used to deploy and interact with an already deployed Coin Toss contract.

## Files
1. **CoinTossInteraction.sol**:
   - Deploys the `CoinToss` contract.
   - Creates a game pool with a predefined entry fee and max participants.
   - Simulates multiple players joining the pool and making selections.
   - Processes game rounds until winners are determined.
   - Allows winners to claim their prizes.

2. **DeployInteractionScript.sol**:
   - Connects to an already deployed `CoinToss` contract.
   - Creates a new game pool on the existing contract.

## Prerequisites
- Foundry (`forge`) installed
- A configured development environment

## Running the Scripts
### 1. Running `CoinTossInteraction.sol`
```sh
forge script script/CoinTossInteraction.sol --fork-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
```

### 2. Running `DeployInteractionScript.sol`
```sh
forge script script/DeployInteractionScript.sol --fork-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
```

## Key Features
- Simulates a game where players choose between HEADS or TAILS.
- Tracks active participants and game rounds.
- Ends the game when winners are determined.
- Allows players to claim their winnings.

## Notes
- Ensure that you replace `<RPC_URL>` and `<PRIVATE_KEY>` with your actual test network RPC and private key.
- The Coin Toss contract must be deployed before running `DeployInteractionScript.sol`.

# Remappings
To ensure proper dependency resolution, the following remappings are used in the Foundry project:
```
@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/
erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/
forge-std/=lib/forge-std/src/
halmos-cheatcodes/=lib/openzeppelin-contracts/lib/halmos-cheatcodes/src/
openzeppelin-contracts/=lib/openzeppelin-contracts/
```
### Explanation:
- `@openzeppelin/contracts/` → Maps to the local OpenZeppelin contracts library.
- `erc4626-tests/` → Provides ERC-4626 test utilities within OpenZeppelin.
- `forge-std/` → Includes the Foundry standard library for testing and scripting.
- `halmos-cheatcodes/` → Maps to cheat codes useful for fuzz testing and verification.
- `openzeppelin-contracts/` → Ensures all OpenZeppelin contracts are properly resolved.

## Author
The One Percent Team

































