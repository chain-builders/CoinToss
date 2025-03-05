// import dotenv from "dotenv";
// dotenv.config();
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";

export const alchemyKey ='aGBE2fyTzwbkZ87yzFAUS6EE'

export const contractAddress = "0x6D66Ea6D0D857BC629d038D0098E1f0d9eD313E9";

if (!alchemyKey || !contractAddress) {
  throw new Error(
    "Missing required environment variables. Check your .env file."
  );
}


const core = {
  id: 1114,
  name: "Core Testnet",
  network: "core-testnet",
  nativeCurrency: {
    name: "tCORE",
    symbol: "tCORE2",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.test2.btcs.network/"],
    },
    public: {
      http: ["https://rpc.test2.btcs.network/"],
    },

  },
  blockExplorers: {
    default: { name: "Core Explorer", url: "https://scan.test2.btcs.network/" },
  },
  testnet: true,
};

export const config = getDefaultConfig({
  appName: "CoinToss",
  projectId: "f6944e67672a59c2ac32f0ec4777dfd8",
  chains: [core],
});
