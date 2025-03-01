import { ethers } from "ethers";
import {alchemyKey,contractAddress} from "../../config";
import contractABI from "./contract-abi.json";



const provider = new ethers.AlchemyProvider("sepolia", alchemyKey);

export const MinorityGameContract = new ethers.Contract(contractAddress as string, contractABI, provider);






