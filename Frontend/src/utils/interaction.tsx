<<<<<<< HEAD
import {alchemyKey,contractAddress} from "../../config";
import contractABI from "./contract/CoinToss.sol/CoinToss.json"
import { useAccount, useSigner } from "wagmi"; // Assuming wagmi for wallet connection
import { ethers } from "ethers";


// const provider = new ethers.AlchemyProvider("sepolia", alchemyKey);

// export const MinorityGameContract = new ethers.Contract(contractAddress as string, contractABI.abi, provider);
const {address}=useAccount()
const { data: signer } = useSigner();


const provider = new ethers.JsonRpcProvider("https://rpc.test.btcs.network");

const signer = provider.getSigner();

const getContract = () => {
    if (!signer) {
      console.error("No signer available. Connect your wallet.");
      return null;
    }
    
    return new ethers.Contract(contractAddress, contractABI.abi, signer);
  };



=======
// import { ethers } from "ethers";
// import { alchemyKey, contractAddress } from "../../config";
>>>>>>> 12f0e670d7cb3ab8906d2cc63aa7df03b5430db7

// const provider = new ethers.AlchemyProvider("sepolia", alchemyKey);

// export const MinorityGameContract = new ethers.Contract(
//   contractAddress as string,
//   contractABI,
//   provider
// );
