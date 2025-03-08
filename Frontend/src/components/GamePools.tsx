import React, { useState, useEffect, useContext } from "react";
import { formatEther } from "ethers";
import {
  useAccount,
  useBalance,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useReadContract,
} from "wagmi";
import { isAddress } from "viem";
import { MyContext } from "../context/contextApi";
import { Trophy, Users, Coins } from "lucide-react";
import { motion } from "framer-motion";
import ABI from "../utils/contract/CoinToss.json";
import { useNavigate } from "react-router-dom";
import { CORE_CONTRACT_ADDRESS } from "../utils/contract/contract";
import { formatFigures } from "../utils/convertion";
import { PoolInterface } from "../utils/Interfaces";

import SelectedPoolDetails from "./SelectedPoolDetails";
import toast from "react-hot-toast";
import { setPoolNames } from "../utils/utilFunction";
// import AboutToFull from "./AboutToFull";

const PoolsInterface: React.FC = () => {
  const [newPools, setNewPools] = useState<PoolInterface[]>([]);
  const [selectedPool, setSelectedPool] = useState<PoolInterface | null>(null);
  const [userBalance, setUserBalance] = useState<number>(1000);
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [showPulse, setShowPulse] = useState<{ [key: number]: boolean }>({});
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>("");
  const [joining, setJoining] = useState(false);
  const [joinedPools, setJoinedPools] = useState<number[]>([]);
  const [participants, setParticipants] = useState<`0x${string}`[]>([]);
  const [prizeAmountClaimed, setPrizeAmoutClaimed] = useState<number>(0);

  const {setPoints}=useContext(MyContext)

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error,
  } = useWriteContract();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const {
    data: balanceData,
    isLoading,
    isError,
  } = useBalance({ address: address, chainId: 1114 });

  const { recentWinners, setMyPools } = useContext(MyContext);
  const navigate = useNavigate();

  const contractAddress = CORE_CONTRACT_ADDRESS as `0x${string}`;

  useWatchContractEvent({
    address: contractAddress,
    abi: ABI.abi,
    eventName: "PlayerJoined",
    onLogs: (logs) => {
      logs.forEach((log) => {
        console.log("Received logs:", logs);
        if (!log.args) return;

        const poolId =
          typeof log.args.poolId === "bigint" ? log.args.poolId : undefined;
        const player =
          typeof log.args.playerThatJoined === "string"
            ? (log.args.playerThatJoined as `0x${string}`)
            : undefined;

        if (!poolId || !player) {
          console.error("Invalid event data structure:", log.args);
          return;
        }

        console.log("Player joined pool:", { poolId: Number(poolId), player });

        // Update UI
        setParticipants((prev) => [...prev, player]);

        toast.custom(
          <div className="flex items-center bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg shadow-lg">
            <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
              <span className="text-xl">👤</span>
            </div>
            <div>
              <h3 className="font-bold text-white">New Challenger!</h3>
              <p className="text-green-100">
                {`${player.substring(0, 6)}...${player.substring(38)}`} joined
                pool #{Number(poolId)}
              </p>
            </div>
          </div>,
          {
            duration: 4000,
            position: "top-right",
          }
        );

        // Show pulse animation on the pool card
        setShowPulse((prev) => ({
          ...prev,
          [Number(poolId)]: true,
        }));

        // Remove pulse after 2 seconds
        setTimeout(() => {
          setShowPulse((prev) => ({
            ...prev,
            [Number(poolId)]: false,
          }));
        }, 2000);

        // If this is the selected pool, update its current participants count
        if (selectedPool && Number(poolId) === selectedPool.id) {
          setNewPools((prevPools) =>
            prevPools.map((pool) =>
              pool.id === Number(poolId)
                ? { ...pool, currentParticipants: pool.currentParticipants + 1 }
                : pool
            )
          );
        }
      });
    },
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: ABI.abi,
    eventName: "PointsAwarded",
    onLogs: (logs) => {

      logs.forEach((log) => {
        if (!log.args || typeof log.args !== "object") {
          return;
        }
        // Extract and validate player address
        const player =
          typeof log.args.player === "string" ? log.args.player : undefined;
        if (!player || !isAddress(player)) {
          return;
        }

        // Extract and validate points
        const points =
          log.args.points !== undefined ? BigInt(log.args.points) : undefined;
        if (points === undefined || points < 0n) {
          return;
        }
        setPoints(Number(points))
        const actionType =
          log.args.reason !== undefined ? Number(log.args.reason) : undefined;
        if (actionType === undefined || ![1, 2, 3].includes(actionType)) {
          return;
        }
        // Map actionType to text and icon
        const actionDetails = {
          1: { text: "Joining Pool", icon: "🎮" },
          2: { text: "Round Win", icon: "🎯" },
          3: { text: "Final Win", icon: "🏆" },
        };

        const { text: actionText, icon } = actionDetails[actionType] || {
          text: "Unknown Action",
          icon: "🎮",
        };

        // Display toast notification
        toast.custom(
          <div className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg shadow-lg">
            <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
              <span className="text-xl">{icon}</span>
            </div>
            <div>
              <h3 className="font-bold text-white">Points Earned!</h3>
              <p className="text-blue-100">
                {`${player.substring(0, 6)}...${player.substring(
                  player.length - 4
                )}`}{" "}
                earned {points.toString()} points for {actionText}
              </p>
            </div>
          </div>,
          {
            duration: 4000,
            position: "top-right",
          }
        );
      });
    },
  });
  // all pools
  const { data: allPools } = useReadContract({
    address: CORE_CONTRACT_ADDRESS,
    abi: ABI.abi,
    functionName: "getAllPools",
    args: [],
  });

  useEffect(() => {
    if (allPools) {
      if (!Array.isArray(allPools)) {
        throw new Error("Invalid pool data format");
      }

      const transformedPools: PoolInterface[] = allPools.map((pool) => ({
        id: Number(pool.poolId),
        entryFee: BigInt(pool.entryFee),
        maxParticipants: Number(pool.maxParticipants),
        currentParticipants: Number(pool.currentParticipants),
        prizePool: Number(pool.prizePool),
        poolStatus: pool.status,
      }));
      setNewPools(transformedPools);
    }
  }, [allPools]);

  
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: txError,
  } = useWaitForTransactionReceipt({ hash });

  
  const { data: userJoinedPoolIds } = useReadContract({
    address: CORE_CONTRACT_ADDRESS,
    abi: ABI.abi,
    functionName: "getUserPools",
    args: [],
    account: address,
  });

  useEffect(() => {
    if (userJoinedPoolIds && Array.isArray(userJoinedPoolIds)) {
      const poolIds = userJoinedPoolIds.map((pool: any) =>
        typeof pool === "object" && pool !== null
          ? Number(pool.poolId)
          : Number(pool)
      );
      setJoinedPools(poolIds);
    }

    if (isConfirmed) {
      setJoining(false);
      setIsStaking(false);
      setIsModalOpen(false);
      navigate("/explore");
    }

    if (txError) {
      setIsStaking(false);
      setIsModalOpen(false);
    }
  }, [isConfirmed, txError, userJoinedPoolIds]);

  const handleJoinPool = async (poolId: number, entryFee: BigInt) => {
    const readableAmount = formatEther(entryFee.toString());

    toast.success(
      <div className="flex flex-col">
        <span className="text-lg font-bold">🎮 Game On!</span>
        <span>
          You are about to Enter Pool #{poolId} with {readableAmount} Core
        </span>
        <span className="text-sm mt-1">Get ready to flip!</span>
      </div>,
      {
        duration: 5000,
        icon: "🎲",
        style: {
          background: "linear-gradient(to right, #4F46E5, #7C3AED)",
          color: "white",
        },
      }
    );

    setIsStaking(true);
    try {
      writeContract({
        address: contractAddress,
        abi: ABI.abi,
        functionName: "joinPool",
        args: [BigInt(poolId)],
        value: entryFee,
        gas: BigInt(300000),
      });
      setJoining(true);
    } catch (err) {
      setIsStaking(false);
      setJoining(false);
    }
  };

  const handlePoolSelect = (pool: PoolInterface) => {
    setSelectedPool(pool);
    setIsModalOpen(true);
    const stakeText = pool.stake?.replace("$", "") || "0";
    setStakeAmount(parseInt(stakeText, 10) || 0);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPool(null); 
    setIsStaking(false);
  };
  const handleStake = async () => {
    if (!selectedPool) return;

    try {
      await handleJoinPool(selectedPool.id, selectedPool.entryFee);
      setUserBalance((prevBalance) => prevBalance - stakeAmount);
    } catch (error) {
      console.error("Transaction failed:", error);
      showPoolNotification("Transaction failed. Please try again.");
    }
  };

  // Function to show notifications
  const showPoolNotification = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "text-blue-400";
      case 2:
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getProgressPercentage = (pools: PoolInterface) => {
    return Math.round(
      (pools.currentParticipants / pools.maxParticipants) * 100
    );
  };
 

  const avalablePools= newPools.filter((pool) => pool.poolStatus === 0 && !joinedPools.includes(pool.id))
  

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 bg-gray-800 p-3 rounded-lg">
        <div className="font-medium">
          Your Balance:{" "}
          <span className="text-green-400">
            {balanceData?.formatted} {balanceData?.symbol}
          </span>
        </div>
        <div className="flex space-x-4 text-sm">
          <div className="text-gray-400">
            Games Today: <span className="text-white">{avalablePools.length}</span>
          </div>
          <div className="text-gray-400">
            Winners Today: <span className="text-yellow-400">158</span>
          </div>
        </div>
      </div>

      <div className="mb-6 bg-gray-800 p-3 rounded-lg overflow-hidden">
        <div className="text-sm font-medium mb-2 flex items-center">
          <Trophy size={16} className="text-yellow-400 mr-2" />
          Recent Winners
        </div>
        <div className="no-scrollbar overflow-x-auto pb-2 whitespace-nowrap">
          <motion.div
            className="flex space-x-4"
            animate={{ x: ["0%", "-100%"] }}
            transition={{
              duration: 20,
              ease: "linear",
              repeat: Infinity,
              repeatType: "loop",
            }}
          >
            {recentWinners.concat(recentWinners).map((winner, i) => (
              <div
                key={i}
                className="inline-block bg-gray-700 px-3 py-1 rounded-lg"
              >
                <span className="font-medium text-white">{winner.name}</span>
                <span className="mx-1 text-gray-400">won</span>

                <span className="text-[#facc15]">{winner.amount}</span>
                <span className="ml-1 text-xs text-gray-500">
                  {winner.time}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Pool selection grid */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-4">Available Pools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {avalablePools.map((pool) => (
              <motion.div
                key={pool.id}
                className={`border bg-gradient-to-r from-gray-900 to-yellow-900 bg-opacity-20 border-yellow-900  rounded-lg p-4 bg-gray-900 hover:bg-gray-800 cursor-pointer transition-all ${
                  selectedPool?.id === pool.id ? "ring-2 ring-purple-500" : ""
                } ${pool.poolStatus === 1 ? "border-yellow-600" : ""} ${
                  showPulse[pool.id] ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => handlePoolSelect(pool)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={
                  showPulse[pool.id]
                    ? {
                        boxShadow: [
                          "0 0 0 rgba(59, 130, 246, 0)",
                          "0 0 15px rgba(59, 130, 246, 0.7)",
                          "0 0 0 rgba(59, 130, 246, 0)",
                        ],
                      }
                    : {}
                }
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold flex items-center">
                    {setPoolNames(pool.id)}
                    {pool.poolStatus === 1 && (
                      <span className="ml-2 text-yellow-400">✨</span>
                    )}
                  </h3>
                  <span
                    className={`text-sm font-medium ${getStatusColor(
                      pool.poolStatus
                    )}`}
                  >
                    {pool.poolStatus === 1 ? "Filling" : "Starting Soon"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Coins size={16} className="text-gray-400" />
                    <div>
                      <p className="text-gray-400 text-xs">Stake</p>
                      <p className="font-medium text-white">
                        {formatFigures(pool.entryFee.toString())}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-gray-400" />
                    <div>
                      <p className="text-gray-400 text-xs">Players</p>
                      <p className="font-medium text-white">
                        {pool.currentParticipants}/{pool.maxParticipants}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy size={16} className="text-gray-400" />
                    <div>
                      <p className="text-gray-400 text-xs">Pool Prize</p>
                      <p className="font-medium text-white">
                        {formatFigures(pool.prizePool.toString())}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar for pool filling status */}
                <div className="mt-3">
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        pool.poolStatus === 1
                          ? "bg-yellow-500"
                          : "bg-yellow-500"
                      }`}
                      style={{ width: `${getProgressPercentage(pool)}%` }}
                    />{" "}
                    <p className="text-gray-400">Stake</p>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Selected pool details and stake form */}
      <SelectedPoolDetails
        isModalOpen={isModalOpen}
        selectedPool={selectedPool}
        isStaking={isStaking}
        closeModal={closeModal}
        handleStake={handleStake}
      />

      {/* Notification toast */}
      <motion.div
        className={`fixed bottom-4 right-4 bg-gray-800 border-l-4 border-yellow-500 text-white p-4 rounded shadow-lg max-w-sm ${
          showNotification ? "block" : "hidden"
        }`}
        initial={{ opacity: 0, y: 50, x: 0 }}
        animate={
          showNotification
            ? { opacity: 1, y: 0, x: 0 }
            : { opacity: 0, y: 50, x: 0 }
        }
        transition={{ duration: 0.3 }}
      >
        <p>{notificationMessage}</p>
      </motion.div>
    </div>
  );
};

export default PoolsInterface;
