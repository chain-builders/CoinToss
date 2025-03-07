# TheOnePercent - Frontend

## Introduction
This repository contains the frontend code for the project, built with **React (Vite) and TypeScript**. The frontend interacts with smart contracts using **ethers.js** and **wagmi**, providing a seamless user experience with **RainbowKit** for wallet connection.

## Tech Stack
The frontend utilizes the following technologies and libraries:

- **React (Vite + TypeScript)** - Fast development environment with TypeScript support.
- **wagmi + ethers.js** - For interacting with Ethereum smart contracts.
- **RainbowKit** - A smooth wallet connection experience.
- **Tailwind CSS** - Utility-first CSS framework for styling.
- **Framer Motion** - For animations and smooth UI interactions.
- **Lucide React** - A modern SVG icon library.
- **React Toastify** - For toast notifications.
- **dotenv** - For managing environment variables securely.

## Project Structure

```
Frontend/
│── node_modules/         # Dependencies (managed via package.json)
│── public/               # Static assets
│── src/                  # Main source code directory
│   ├── assets/           # Images, fonts, and other static assets
│   ├── components/       # Reusable UI components
│   ├── context/          # Global state management (React Context API)
│   │   ├── contextApi.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── usePlayerRounds.ts
│   │   ├── usePoolCount.ts
│   │   ├── usePoolInfo.ts
│   ├── page/             # Page components (React Router views)
│   │   ├── HeroPage.tsx  # Landing page
│   │   ├── Play.tsx      # Main game interface
│   │   ├── Pools.tsx     # View available game pools
│   ├── utils/            # Helper functions and utilities
│   │   ├── contract/     # Blockchain-related helper functions
│   │   │   ├── convertion.tsx  # Conversion utilities (e.g., token conversion)
│   │   │   ├── interaction.tsx # Contract interaction functions
│   │   │   ├── interfaces.tsx  # TypeScript interfaces for contract interactions
│   │   │   ├── utilFunction.tsx # General utility functions
│   ├── App.tsx           # Root component
│   ├── index.css         # Global styles
│   ├── main.tsx          # React entry point
│   ├── Root.tsx          # Main routing structure
│   ├── router.tsx        # React Router configuration
│── .env                  # Environment variables (ignored in Git)
│── .gitignore            # Git ignore file
│── config.ts             # General configuration file
│── eslint.config.js      # ESLint settings
│── index.html            # HTML template for Vite
│── package.json          # Project dependencies and scripts
│── postcss.config.js     # PostCSS configuration for Tailwind CSS
│── README.md             # This file
```

## Installation and Setup

### 1. Clone the repository
```sh
git clone https://github.com/your-repo/TheOnePercent.git
cd TheOnePercent/frontend
```

### 2. Install dependencies
```sh
npm install
```

### 3. Setup environment variables
Create a `.env` file in the root directory and add the necessary keys:
```env
VITE_APP_INFURA_ID=your_infura_project_id
VITE_APP_WALLET_CONNECT_ID=your_walletconnect_project_id
VITE_APP_CONTRACT_ADDRESS=your_contract_address
```

### 4. Run the development server
```sh
npm run dev
```
This will start the Vite development server at `http://localhost:5173/`.

## Features
- Connect wallet using **RainbowKit**.
- Play blockchain-based games with real-time interactions.
- View and interact with available gaming pools.
- Smooth animations and transitions using **Framer Motion**.
- Responsive UI with **Tailwind CSS**.
- Real-time blockchain data fetching via **wagmi** and **ethers.js**.

# Coin Toss Game - Frontend Integration

This repository also contains the integration of a Coin Toss game with an Ethereum smart contract using Wagmi, a React Hooks library for interacting with Ethereum-based applications. The integration consists of two main functionalities:

1. **Claiming Prizes**: Allows users to claim their winnings if they are eligible.
2. **Playing the Game**: Enables users to participate in a Coin Toss game by selecting their choice and submitting it to the smart contract.

---

## 1. Claiming Prizes

The `ClaimPrizeButton` component allows users to claim their winnings if they have won a game round and have not yet claimed their prize.

### Key Functionalities
- Reads the player's status from the smart contract.
- Checks if the user is a winner and has not yet claimed their prize.
- Calls the smart contract function `claimPrize` to claim the winnings.
- Waits for transaction confirmation before updating the UI.

### Code Overview

```typescript
import { useState } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useAccount,
} from "wagmi";
import CoinTossABI from "../../utils/contract/CoinToss.json";
import { CORE_CONTRACT_ADDRESS } from "../../utils/contract/contract";
```

### How It Works
1. The component checks if the user is eligible to claim a prize by calling `getPlayerStatus`.
2. If the user is eligible, a claim button is displayed.
3. When the user clicks the claim button, a transaction is sent to the blockchain.
4. The UI updates based on the transaction status.

---

## 2. Playing the Game

The `PlayGame` component handles user participation in the Coin Toss game.

### Key Functionalities
- Displays available game pools.
- Allows users to select a game pool and make a choice (Heads or Tails).
- Submits the choice to the smart contract.
- Manages UI updates based on transaction status.
- Simulates the game process and updates the player's status.

### Code Overview

```typescript
import { useState, useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import CoinTossABI from "../utils/contract/CoinToss.json";
import { CORE_CONTRACT_ADDRESS } from "../utils/contract/contract";
```

### How It Works
1. The user selects a game pool and makes a choice.
2. The component submits the choice to the smart contract via `makeSelection`.
3. The transaction status is monitored to confirm whether the choice was successfully recorded.
4. The game progresses through rounds, eliminating losing players until winners are determined.

---

## Smart Contract Functions Used

- `getPlayerStatus(poolId, address)`: Retrieves the player's current status.
- `claimPrize(poolId)`: Allows eligible players to claim their prize.
- `makeSelection(poolId, choice)`: Submits the player's choice for the Coin Toss game.

---

## Notes
- Ensure you have a connected Ethereum wallet before using the application.
- The application interacts with a deployed smart contract, so any transactions will require gas fees.
- The game logic is managed both on-chain (through the contract) and off-chain (UI state updates).

For any issues or contributions, please create a pull request or open an issue in the repository.

## Contribution
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m "Add feature"`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.



