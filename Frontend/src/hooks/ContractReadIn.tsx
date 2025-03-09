import { useState, useEffect,useCallback } from "react";
import { useReadContract } from "wagmi";
import CoinTossABI from "../utils/contract/CoinToss.json";
import { CORE_CONTRACT_ADDRESS } from "../utils/contract/contract";

export enum PlayerChoice {
  NONE = 0,
  HEADS = 1,
  TAILS = 2,
}

type PlayerRoundStatus = {
  hasParticipated: boolean;
  choice: PlayerChoice;
  isLoading: boolean;
  error: Error | null;
};

type PlayerStatus = [boolean, boolean, boolean, boolean];

// Custom Hook: Game Timer
// const useGameTimer = (initialTime: number, onTimerEnd: () => void) => {
//   const [timer, setTimer] = useState(initialTime);

//   useEffect(() => {
//     if (timer > 0) {
//       const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
//       return () => clearInterval(interval);
//     } else {
//       onTimerEnd();
//     }
//   }, [timer, onTimerEnd]);

//   return { timer };
// };

// Custom Hook: Contract Interactions
export const usePlayerStatus = (poolId: bigint, address: `0x${string}`) => {
    const {
      data: playerStatus,
      refetch: refetchPlayerStatus,
      isLoading: isStatusLoading,
    } = useReadContract<PlayerStatus, string, [bigint, `0x${string}`]>({
      address: CORE_CONTRACT_ADDRESS as `0x${string}`,
      abi: CoinTossABI.abi,
      functionName: "getPlayerStatus",
      args: [poolId, address],
    });
  
    return { playerStatus, refetchPlayerStatus, isStatusLoading };
  };
