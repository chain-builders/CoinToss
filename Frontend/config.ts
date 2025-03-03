// import dotenv from "dotenv";
// dotenv.config();

export const alchemyKey ='aGBE2fyTzwbkZ87yzFAUS6EE'

export const contractAddress = "0x6D66Ea6D0D857BC629d038D0098E1f0d9eD313E9";


if (!alchemyKey || !contractAddress) {
    throw new Error("Missing required environment variables. Check your .env file.");
  }