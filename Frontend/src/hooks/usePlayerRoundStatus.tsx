import { useState, useEffect } from "react";
import { useReadContract, useAccount } from "wagmi";
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

export function usePlayerRoundStatus(
  poolId: number,
  round: number
): PlayerRoundStatus {
  const { address } = useAccount();
  const [status, setStatus] = useState<PlayerRoundStatus>({
    hasParticipated: false,
    choice: PlayerChoice.NONE,
    isLoading: true,
    error: null,
  });

  const {
    data: roundParticipation,
    isError,
    error,
    isLoading: isLoadingParticipation,
  } = useReadContract({
    address: CORE_CONTRACT_ADDRESS as `0x${string}`,
    abi: CoinTossABI.abi,
    functionName: "roundParticipation",
    args: [BigInt(poolId), BigInt(round), address],
    query: {
      enabled: !!address && round > 0,
    },
  });

  const { data: roundSelection, isLoading: isLoadingSelection } =
    useReadContract({
      address: CORE_CONTRACT_ADDRESS as `0x${string}`,
      abi: CoinTossABI.abi,
      functionName: "roundSelection",
      args: [BigInt(poolId), BigInt(round), address],
      query: {
        enabled: !!address && round > 0 && !!roundParticipation,
      },
    });

  useEffect(() => {
    setStatus((prev) => ({
      ...prev,
      hasParticipated: !!roundParticipation,
      choice: roundSelection
        ? (Number(roundSelection) as PlayerChoice)
        : PlayerChoice.NONE,
      isLoading: isLoadingParticipation || isLoadingSelection,
      error: isError ? error : null,
    }));
  }, [
    roundParticipation,
    roundSelection,
    isLoadingParticipation,
    isLoadingSelection,
    isError,
    error,
  ]);

  return status;
}
