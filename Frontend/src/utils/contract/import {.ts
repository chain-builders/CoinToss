import {
  type BaseError,
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";

const { isConnected } = useAccount();

  const { data: hash, error: poolError, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
  useWaitForTransactionReceipt({ hash });

const handleCreatePool = () => {
    writeContract({
      address: "0x6D66Ea6D0D857BC629d038D0098E1f0d9eD313E9",
      abi: contractABI.abi,
      functionName: "createPool",
      args: [1, 3],
    });

    if (isConfirming) {
      console.log("Sending...");
    }

    if (isConfirmed) {
      console.log("Sent...");
    }

    if (poolError) {
      console.log(poolError);
    }
};