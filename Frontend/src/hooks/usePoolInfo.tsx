import { ethers } from "ethers";
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
    address: "0x6D66Ea6D0D857BC629d038D0098E1f0d9eD313E9",
    abi: ABI.abi,
    functionName: "getPoolInfo",
    args: [ethers.getBigInt(poolId)],
  });
}
