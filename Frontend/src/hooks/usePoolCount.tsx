import ABI from "../utils/contract/CoinToss.sol/CoinToss.json";

import { useReadContract } from "wagmi";

export function usePoolCount() {
  return useReadContract({
    address: "0xd57F1C354E9A2eEC4a4DDCEb49e86b59F0169730",
    abi: ABI.abi,
    functionName: "poolCount",
  });
}
