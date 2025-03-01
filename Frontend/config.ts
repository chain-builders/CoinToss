export const alchemyKey = process.env.ALCHEMY_API_KEY;

export const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

if (!alchemyKey || !contractAddress) {
  throw new Error(
    "Missing required environment variables. Check your .env file."
  );
}
