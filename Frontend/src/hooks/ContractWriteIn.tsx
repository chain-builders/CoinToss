import { useState, useEffect,useCallback } from "react";
import { useWriteContract,useWaitForTransactionReceipt } from "wagmi";
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
const useGameTimer = (initialTime: number, onTimerEnd: () => void) => {
  const [timer, setTimer] = useState(initialTime);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      onTimerEnd();
    }
  }, [timer, onTimerEnd]);

  return { timer };
};

// Custom Hook: Contract Interactions
export const useContractInteraction = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const makeSelection = useCallback(
    (poolId: bigint, choice: PlayerChoice) => {
      writeContract({
        address: CORE_CONTRACT_ADDRESS as `0x${string}`,
        abi: CoinTossABI.abi,
        functionName: "makeSelection",
        args: [poolId, choice],
      });
    },
    [writeContract]
  );

  const claimPrize = useCallback(
    (poolId: bigint) => {
      writeContract({
        address: CORE_CONTRACT_ADDRESS as `0x${string}`,
        abi: CoinTossABI.abi,
        functionName: "claimPrize",
        args: [poolId],
      });
    },
    [writeContract]
  );

  return { makeSelection, claimPrize, isPending, isConfirming, isConfirmed, error };
};
