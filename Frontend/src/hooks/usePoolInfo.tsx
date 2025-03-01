import ABI from "../utils/contract/CoinToss.sol/CoinToss.json";

import { useReadContract } from "wagmi";

export enum PoolStatus {
  OPENED = 0,
  ACTIVE = 1,
  CLOSED = 2,
}

export type PoolInfo = {
  entryFee: bigint;
  maxParticipants: bigint;
  currentParticipants: bigint;
  prizePool: bigint;
  currentRound: bigint;
  status: PoolStatus;
};

export function usePoolInfo(poolId: number) {
  return useReadContract({
    address: "0xd57F1C354E9A2eEC4a4DDCEb49e86b59F0169730",
    abi: ABI.abi,
    functionName: "getPoolInfo",
    args: [BigInt(poolId)],
  });
}
