import { useState } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import CoinTossABI from "../../utils/contract/CoinToss.json";
import { CORE_CONTRACT_ADDRESS } from "../../utils/contract/contract";

enum PlayerChoice {
  NONE = 0,
  HEADS = 1,
  TAILS = 2,
}

type MakeSelectionProps = {
  poolId: number;
  onSelectionMade?: () => void;
};

export function MakeSelection({ poolId, onSelectionMade }: MakeSelectionProps) {
  const [selectedChoice, setSelectedChoice] = useState<PlayerChoice | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { address } = useAccount();

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Handle selection submission
  const handleSubmit = async () => {
    if (!selectedChoice || selectedChoice === PlayerChoice.NONE) {
      alert("Please select HEADS or TAILS");
      return;
    }

    try {
      setIsSubmitting(true);

      writeContract({
        address: CORE_CONTRACT_ADDRESS as `0x${string}`,
        abi: CoinTossABI.abi,
        functionName: "makeSelection",
        args: [BigInt(poolId), selectedChoice],
      });
    } catch (err) {
      console.error("Error making selection:", err);
      setIsSubmitting(false);
    }
  };

  // Reset component state after successful submission
  if (isConfirmed && isSubmitting) {
    setIsSubmitting(false);
    setSelectedChoice(null);
    if (onSelectionMade) {
      onSelectionMade();
    }
  }

  if (error) {
    console.error("Error making selection:", error);
  }

  // return (
  //   <div className="bg-white rounded-lg shadow p-6">
  //     <h3 className="text-xl font-semibold mb-4">Make Your Choice</h3>
  //     <p className="mb-4 text-gray-600">
  //       Choose HEADS or TAILS for Pool #{poolId}
  //     </p>

  //     <div className="grid grid-cols-2 gap-4 mb-6">
  //       <button
  //         onClick={() => setSelectedChoice(PlayerChoice.HEADS)}
  //         className={`p-4 border rounded-lg transition ${
  //           selectedChoice === PlayerChoice.HEADS
  //             ? "bg-blue-500 text-white border-blue-700"
  //             : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
  //         }`}
  //       >
  //         HEADS
  //       </button>

  //       <button
  //         onClick={() => setSelectedChoice(PlayerChoice.TAILS)}
  //         className={`p-4 border rounded-lg transition ${
  //           selectedChoice === PlayerChoice.TAILS
  //             ? "bg-blue-500 text-white border-blue-700"
  //             : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
  //         }`}
  //       >
  //         TAILS
  //       </button>
  //     </div>

  //     <button
  //       onClick={handleSubmit}
  //       disabled={
  //         !selectedChoice || isWritePending || isConfirming || isSubmitting
  //       }
  //       className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
  //     >
  //       {isWritePending || isConfirming || isSubmitting
  //         ? "Submitting..."
  //         : isConfirmed
  //         ? "Selection Made!"
  //         : "Submit Selection"}
  //     </button>

  //     {isConfirmed && (
  //       <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
  //         Your selection has been submitted successfully!
  //       </div>
  //     )}
  //   </div>
  // );
}
