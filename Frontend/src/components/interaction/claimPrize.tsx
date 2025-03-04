import { useState } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useAccount,
} from "wagmi";
import CoinTossABI from "../../utils/contract/CoinToss.json";
import { CORE_CONTRACT_ADDRESS } from "../../utils/contract/contract";

type ClaimPrizeButtonProps = {
  poolId: number;
  onClaimSuccess?: () => void;
};

export function ClaimPrizeButton({
  poolId,
  onClaimSuccess,
}: ClaimPrizeButtonProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const { address } = useAccount();

  // Check if user is a winner and hasn't claimed yet
  const { data: playerStatus } = useReadContract({
    address: CORE_CONTRACT_ADDRESS as `0x${string}`,
    abi: CoinTossABI.abi,
    functionName: "getPlayerStatus",
    args: [BigInt(poolId), address],
    query: {
      enabled: !!address,
    },
  });

  // Contract write hook for claiming prize
  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error,
  } = useWriteContract();

  // Wait for transaction to complete
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Determine if user can claim
  const canClaim = playerStatus
    ? (playerStatus as [boolean, boolean, boolean, boolean])[2] && // isWinner
      !(playerStatus as [boolean, boolean, boolean, boolean])[3] // !hasClaimed
    : false;

  // Handle claim
  const handleClaim = async () => {
    if (!canClaim) return;

    try {
      setIsClaiming(true);

      writeContract({
        address: CORE_CONTRACT_ADDRESS as `0x${string}`,
        abi: CoinTossABI.abi,
        functionName: "claimPrize",
        args: [BigInt(poolId)],
      });
    } catch (err) {
      console.error("Error claiming prize:", err);
      setIsClaiming(false);
    }
  };

  // Reset state after successful claim
  if (isConfirmed && isClaiming) {
    setIsClaiming(false);
    if (onClaimSuccess) {
      onClaimSuccess();
    }
  }

  if (error) {
    console.error("Error claiming prize:", error);
  }

  if (!canClaim) {
    return null;
  }

  return (
    <button
      onClick={handleClaim}
      disabled={isWritePending || isConfirming || isClaiming}
      className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
    >
      {isWritePending || isConfirming || isClaiming
        ? "Claiming Prize..."
        : isConfirmed
        ? "Prize Claimed!"
        : "Claim Prize"}
    </button>
  );
}
