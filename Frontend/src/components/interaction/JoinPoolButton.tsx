import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import CoinTossABI from "../../utils/contract/CoinToss.json";
import { CORE_CONTRACT_ADDRESS } from "../../utils/contract/contract";

type JoinPoolButtonProps = {
  poolId: number;
  entryFee: string;
};

export function JoinPoolButton({ poolId, entryFee }: JoinPoolButtonProps) {
  const [joining, setJoining] = useState(false);

  // Contract write hook for joining a pool
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
      onSuccess() {
        setJoining(false);
      },
    });

  // Handle joining a pool
  const handleJoinPool = async () => {
    try {
      setJoining(true);

      writeContract({
        address: CORE_CONTRACT_ADDRESS as `0x${string}`,
        abi: CoinTossABI.abi,
        functionName: "joinPool",
        args: [BigInt(poolId)],
        value: parseEther(entryFee),
      });
    } catch (err) {
      console.error("Error joining pool:", err);
      setJoining(false);
    }
  };

  // Show error message if there was an error
  if (error) {
    console.error("Error joining pool:", error);
  }

  return (
    <button
      onClick={handleJoinPool}
      disabled={isWritePending || isConfirming || joining}
      className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
    >
      {isWritePending || isConfirming || joining
        ? "Joining..."
        : isConfirmed
        ? "Joined!"
        : `Join Pool (${entryFee} ETH)`}
    </button>
  );
}
