# TheOnePercent

TheOnePercent is an **on-chain elimination-based game** where players compete by selecting sides (heads or tails). The game is designed to be a **high-stakes battle of decision-making**, where the **majority is eliminated after every round** until only one or two players remain. The final winner(s) take home the prize pool, minus a percentage fee collected by the contract owner.

This game is designed to be **fair, transparent, and fully decentralized**, running on smart contracts deployed via **Foundry**. The frontend is built using **React with Vite and TypeScript**, ensuring a smooth and interactive experience.

---

## Game Logic
**I'll be using a pool of 10 players for all instances. If you see the word 'pool' it means a pool of 10 players** 
### **Joining a Pool**
- A player **joins a pool of 3 or multiple players** by staking a predefined amount set by the contract owner (only onwer can create main pools).
- Once a pool is full (**10 players have joined**), the game begins automatically.
- Users can also create private where they have control over the stake amount and pool size.

### **Rounds & Elimination**
- Each player chooses either **heads or tails**.
- The **majority group is eliminated** from the game after every round.
- The **minority group advances** to the next round.
- If there is a **tie** for a pool of 10 players (5 players choose heads and 5 choose tails), another round is played.
- A pool of 10 players can have **Maximum of 3 rounds per pool** (because the maximum possible split is 5-5 → 3-2 → 2-1).

### **Winning Conditions**
- If a single player remains **before 3 rounds** (e.g., 9 pick heads and 1 picks tails in Round 1), that player wins **the entire staked amount**.
- If **two players remain at the end of 3 rounds**, they **split the total staked amount** equally.
- The contract **deducts a percentage fee** from every closed pool (this fee goes to the contract owner).

### **Pool Creation**
- **Only the contract owner can create new pools**.
- Pools must be initialized with a **staking amount, a maximum player limit (10), and a fee percentage**.
- Players can **only join active pools** (not yet full or completed).

---

## **Tech Stack**
### **Smart Contract**
- **Solidity** (Developed using Foundry for testing and deployment)
- **OpenZeppelin Libraries** (for security, access control, and utility functions)
- **Custom Libraries** (Errors, Events)
- **Remappings** (to efficiently manage dependencies and imports)

### **Frontend**
- **Vite + React + TypeScript** (for performance and maintainability)
- **Node Modules** (Package management)
- **WAGMI & Ethers.js** (for interacting with the smart contract)
- **RainbowKit** (for wallet connection UI)
- **Framer Motion** (for animations and UI interactions)
- **Lucide React** (for icons and graphical elements)
- **Toastify** (for displaying notifications)
- **TailwindCSS** (for styling)
- **dotenv** (for managing environment variables)

---

## **Setup & Deployment**
### **Smart Contract (Foundry)**
```sh
forge install
forge build
forge test
forge script script/Deploy.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY>
```

### **Frontend Setup**
```sh
cd frontend
npm install
npm run dev
```

---

## **Interacting with the Contract**
### **Key Functions**
#### **Joining a Pool**
```solidity
function joinPool(uint256 poolId, bool choice) external payable;
```
- Players call this function to join an active pool.
- They **must stake the required amount** to participate.
- The **choice (true for heads, false for tails)** must be submitted.

#### **Creating a Pool (Owner Only)**
```solidity
function createPool(uint256 stakeAmount, uint256 feePercentage) external onlyOwner;
```
- The contract owner can **create a new game pool** with a specific staking amount.
- The fee percentage is set at **pool creation**.

#### **Fetching Active Pools**
```solidity
function getActivePools() external view returns (Pool[] memory);
```
- Fetches all **ongoing pools that are not full or completed**.

#### **Claiming Winnings**
```solidity
function claimWinnings(uint256 poolId) external;
```
- Winners call this function to **withdraw their share of the pool**.
- Ensures **funds are transferred securely** to the winner(s).

---

## **Security & Best Practices**
- **Reentrancy Protection:** Uses OpenZeppelin’s `ReentrancyGuard` to prevent attacks.
- **Access Control:** Only **the owner can create pools**.
- **Fair Randomization:** The game logic ensures fairness by **eliminating the majority group**, preventing exploits.
- **Gas Optimization:** Uses efficient data structures and batch processing to **reduce unnecessary computations**.
- **Automated Tests:** Comprehensive **unit tests using Foundry** to validate contract functionality.

---

## **Future Improvements**
- **NFT Rewards**: Implement NFT prizes for winners.
- **Leaderboard System**: Track player performance and earnings.
- **Referral System**: Reward users for inviting new players.
- **More Pool Sizes**: Expand beyond 10-player pools for diverse gameplay.

---
## Contract Address:
**0xA3c7dc41A46ca489FdeA4Ca4D43760d45e1D8070**

[View on Block Explorer](https://scan.test2.btcs.network/address/0xA3c7dc41A46ca489FdeA4Ca4D43760d45e1D8070)
---
## Demo Video

[(https://www.loom.com/share/e26754cf31d64aaca7ff7ceabd411bd7)]
---
## Pitch Deck

[(https://docs.google.com/presentation/d/1OPzRYOiFz6UGImva1qmiFbs8aGZGrnuZWR7LY--6FcY/edit#slide=id.p)]

## **Contributions**
We welcome community contributions! Feel free to **submit issues, pull requests, or suggestions** for improving TheOnePercent.



