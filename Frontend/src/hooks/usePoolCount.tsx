import { useWatchContractEvent } from 'wagmi';
import ABI from "../utils/contract/CoinToss.sol/CoinToss.json";

import { useReadContract } from "wagmi";

export function usePoolCount() {
  return useReadContract({
    address: "0xd57F1C354E9A2eEC4a4DDCEb49e86b59F0169730",
    abi: ABI.abi,
    functionName: "poolCount",
  });
}

export function useGetOpenPools() {
  return useReadContract({
    address: "0xd57F1C354E9A2eEC4a4DDCEb49e86b59F0169730",
    abi: ABI.abi,
    functionName: "getOpenPools",
  })
}

export function useGetPlayerJoinedPool() {
  return useReadContract({
    address: "0xd57F1C354E9A2eEC4a4DDCEb49e86b59F0169730",
    abi: ABI.abi,
    functionName: "getPlayerJoinedPool",
  })
}

useWatchContractEvent({
  address: '0xd57F1C354E9A2eEC4a4DDCEb49e86b59F0169730',
  abi: ABI.abi,
  eventName: 'RoundCompleted',
  onLogs(logs) {
    console.log('New logs!', logs)
  },
})

useWatchContractEvent({
  address: '0xd57F1C354E9A2eEC4a4DDCEb49e86b59F0169730',
  abi: ABI.abi,
  eventName: 'PoolCompleted',
  onLogs(logs) {
    console.log('New logs!', logs)
  },
})

useWatchContractEvent({
  address: '0xd57F1C354E9A2eEC4a4DDCEb49e86b59F0169730',
  abi: ABI.abi,
  eventName: 'RoundWinners',
  onLogs(logs) {
    console.log('New logs!', logs)
  },
})

useWatchContractEvent({
  address: '0xd57F1C354E9A2eEC4a4DDCEb49e86b59F0169730',
  abi: ABI.abi,
  eventName: 'RoundLosers',
  onLogs(logs) {
    console.log('New logs!', logs)
  },
})


// event RoundCompleted(uint poolId, uint round, CoinToss.PlayerChoice);
// event PoolCompleted(uint poolId, uint prizePool);
// event RoundWinners(uint poolId, uint round, address[] roundWinners);
// event RoundLosers(uint poolId, uint round, address[] roundWinners);