import React, { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import {
  Sparkles,
  Trophy,
  Clock,
  Users,
  TrendingUp,
  Star,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatUnits } from "ethers";
import ABI from "../utils/contract/CoinToss.json";
import { CORE_CONTRACT_ADDRESS } from "../utils/contract/contract";

// Define types for the pool object
interface Pool {
  id: number;
  name: string;
  status: string;
  stake: string;
  players: string;
  timeLeft: string;
  playersCount: number;
  maxPlayers: number;
  percentFull: number;
  popularity: string;
  previousWinners: number;
  averageTime: string;
}

interface PoolInterface {
  id: number;
  entryFee: BigInt;
  maxParticipants: number;
  currentParticipants: number;
  prizePool: number;
  currentRound: number;
  poolStatus: number;
  maxWinners: number;
  currentActiveParticipants: number;
}

// Define types for the recent winners
interface RecentWinner {
  name: string;
  amount: string;
  time: string;
}

const PoolsInterface: React.FC = () => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [newPools, setNewPools] = useState<PoolInterface[]>([]);
  const [selectedPool, setSelectedPool] = useState<PoolInterface | null>(null);
  const [userBalance, setUserBalance] = useState<number>(1000);
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [showPulse, setShowPulse] = useState<{ [key: number]: boolean }>({});
  const [featuredPool, setFeaturedPool] = useState<Pool | null>(null);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>("");
  const [joining, setJoining] = useState(false);
  const [recentWinners, setRecentWinners] = useState<RecentWinner[]>([
    { name: "Player429", amount: "1,240", time: "2m ago" },
    { name: "CryptoKing", amount: "450", time: "5m ago" },
    { name: "LuckyStrike", amount: "2,100", time: "8m ago" },
  ]);

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
  } = useBalance({
    address: address,
    chainId: 1114,
  });

  // Live update pools periodically to create urgency
  useEffect(() => {
    const interval = setInterval(() => {
      setPools((currentPools) =>
        currentPools.map((pool) => {
          const [min, sec] = pool.timeLeft.split(":").map(Number);
          let newSec = sec - 5;
          let newMin = min;
          if (newSec < 0) {
            newSec = 55;
            newMin = min - 1;
          }
          if (newMin < 0) {
            newMin = 0;
            newSec = 0;
          }

          // Randomly update players sometimes
          const randomValue = Math.random();
          let newPlayersCount = pool.playersCount;

          if (randomValue > 0.7 && pool.playersCount < pool.maxPlayers) {
            newPlayersCount = Math.min(pool.playersCount + 1, pool.maxPlayers);
            // Add a visual pulse to this pool
            setShowPulse((prev) => ({ ...prev, [pool.id]: true }));
            setTimeout(
              () => setShowPulse((prev) => ({ ...prev, [pool.id]: false })),
              1000
            );
          }

          const percentFull = Math.round(
            (newPlayersCount / pool.maxPlayers) * 100
          );

          // Change status to "starting" when nearly full
          let newStatus = pool.status;
          if (percentFull > 85 && pool.status !== "starting") {
            newStatus = "starting";
            showPoolNotification(`${pool.name} is about to start! Join now!`);
          }

          return {
            ...pool,
            timeLeft: `${String(newMin).padStart(2, "0")}:${String(
              newSec
            ).padStart(2, "0")}`,
            playersCount: newPlayersCount,
            players: `${newPlayersCount}/${pool.maxPlayers}`,
            percentFull,
            status: newStatus,
          };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Reset almost-full pools occasionally to maintain scarcity pressure
  useEffect(() => {
    const resetInterval = setInterval(() => {
      const poolsToReset = pools.filter(
        (p) =>
          p.timeLeft === "00:00" ||
          (p.status === "starting" && p.percentFull === 100)
      );

      if (poolsToReset.length > 0) {
        setPools((currentPools) =>
          currentPools.map((pool) => {
            if (
              pool.timeLeft === "00:00" ||
              (pool.status === "starting" && pool.percentFull === 100)
            ) {
              // Create a "new" pool with slightly different parameters
              return {
                ...pool,
                players: "0/16",
                playersCount: 0,
                timeLeft: `${Math.floor(Math.random() * 10) + 2}:00`,
                status: "filling",
                percentFull: 0,
              };
            }
            return pool;
          })
        );
      }
    }, 15000);

    return () => clearInterval(resetInterval);
  }, [pools]);

  // join pool function

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (isConfirmed) {
      setJoining(false);
    }
  }, [isConfirmed]);

  const handleJoinPool = async (poolId: number, entryFee: BigInt) => {
    try {
      writeContract({
        address: CORE_CONTRACT_ADDRESS as `0x${string}`,
        abi: ABI.abi,
        functionName: "joinPool",
        args: [BigInt(poolId)],
        value: parseEther(entryFee.toString()),
      });
      setJoining(true);
    } catch (err) {
      console.error("Error joining pool:", err);
      setJoining(false);
    }
  };

  // Function to handle pool selection
  const handlePoolSelect = (pool: PoolInterface) => {
    setSelectedPool(pool);
    setIsModalOpen(true);
    setStakeAmount(parseInt(pool.stake.replace("$", ""), 10));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPool(null); // Clear selected pool
  };

  // Function to handle staking and entering a pool
  const handleStake = async () => {
    if (!selectedPool) return;

    try {
      setIsStaking(true);
      const tx = await handleJoinPool(selectedPool.id, selectedPool.entryFee);
      await tx.wait();

      setUserBalance((prevBalance) => prevBalance - stakeAmount);
      closeModal();
    } catch (error) {
      console.error("Transaction failed:", error);
      showPoolNotification("Transaction failed. Please try again.");
    } finally {
      setIsStaking(false);
    }
  };

  // Function to show notifications
  const showPoolNotification = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  // Function to determine status color
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

  // Function to determine popularity icon
  const getPopularityIcon = (popularity: string) => {
    switch (popularity) {
      case "hot":
        return <TrendingUp size={14} className="text-red-400" />;
      case "high":
        return <Star size={14} className="text-yellow-400" />;
      case "trending":
        return <TrendingUp size={14} className="text-green-400" />;
      default:
        return null;
    }
  };
  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Balance and stats bar */}
      <div className="flex justify-between items-center mb-6 bg-gray-800 p-3 rounded-lg">
        <div className="font-medium">
          Your Balance:{" "}
          <span className="text-green-400">
            {balanceData?.formatted} {balanceData?.symbol}
          </span>
        </div>
        <div className="flex space-x-4 text-sm">
          <div className="text-gray-400">
            Games Today: <span className="text-white">12</span>
          </div>
          <div className="text-gray-400">
            Winners Today: <span className="text-yellow-400">158</span>
          </div>
        </div>
      </div>

      {/* Featured "hot" pool - creates FOMO */}
      {featuredPool && (
        <motion.div
          className="border border-yellow-900 bg-gradient-to-r from-gray-900 to-yellow-900 bg-opacity-20 rounded-lg p-4 mb-6 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1">
            FILLING FAST
          </div>

          <div className="flex justify-between items-stol.name}art">
            <div>
              <h3 className="text-xl font-bold flex items-center text-yellow-400">
                <Trophy size={18} className="mr-2" /> {featuredPool.name}
              </h3>
              <p className="text-gray-400 text-sm">
                Almost full! Join now before it starts
              </p>
            </div>
            <div
              className={`text-sm font-medium ${getStatusColor(
                featuredPool.status
              )}`}
            >
              {featuredPool.status === "filling" ? "Filling" : "Starting Soon"}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Stake</p>
              <p className="font-medium text-white">{featuredPool.stake}</p>
            </div>
            <div>
              <p className="text-gray-400">Players</p>
              <p className="font-medium text-white">{featuredPool.players}</p>
            </div>
            <div>
              <p className="text-gray-400">Time Left</p>
              <p className="font-medium text-white">{featuredPool.timeLeft}</p>
            </div>
            <div>
              <p className="text-gray-400">Previous Winners</p>
              <p className="font-medium text-white">
                {featuredPool.previousWinners}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs text-gray-400 mb-1">Pool filling up</div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500"
                style={{ width: `${featuredPool.percentFull}%` }}
              />
            </div>
          </div>

          <button
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg w-full transition-colors"
            onClick={() => handlePoolSelect(featuredPool)}
          >
            Join This Pool
          </button>
        </motion.div>
      )}

      {/* Recent winners ticker - social proof */}
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
                <span className="text-green-400">{winner.amount}</span>
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
          {newPools.map((pool) => (
            <motion.div
              key={pool.id}
              className={`border border-gray-800 rounded-lg p-4 bg-gray-900 hover:bg-gray-800 cursor-pointer transition-all ${
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
                    <Sparkles size={16} className="ml-2 text-yellow-400" />
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
                <div>
                  <p className="text-gray-400">Stake</p>
                  <p className="font-medium">{pool.entryFee.toString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Players</p>
                  <p className="font-medium">{pool.players}</p>
                </div>
                <div>
                  <p className="text-gray-400">Time Left</p>
                  <p className="font-medium">{pool.timeLeft}</p>
                </div>
              </div>

              {/* Progress bar for pool filling status */}
              <div className="mt-3">
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      pool.poolStatus === 1 ? "bg-yellow-500" : "bg-blue-500"
                    }`}
                    // style={{ width: `${pool.percentFull}%` }}
                  />{" "}
                  <p className="text-gray-400">Stake</p>
                  <p className="font-medium"> 2</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Selected pool details and stake form */}
      <AnimatePresence>
        {isModalOpen && selectedPool && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal} // Close modal when clicking outside
          >
            <motion.div
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-md relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
            >
              {/* Close button */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                onClick={closeModal}
              >
                x
              </button>

              {/* Modal content */}
              <h3 className="text-xl font-bold mb-4">
                Join {selectedPool.name}
              </h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400">Required Stake</p>
                  <p className="text-xl font-bold">
                    {Number(selectedPool.entryFee)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Your Balance</p>
                  <p className="text-xl font-bold text-green-400">
                    {balanceData?.formatted} {balanceData?.symbol}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg mb-4 flex items-center">
                <AlertTriangle size={18} className="text-yellow-400 mr-2" />
                <p className="text-sm">
                  Only{" "}
                  {selectedPool.maxParticipants -
                    selectedPool.currentParticipants}{" "}
                  spots remaining! Game starts in {selectedPool.timeLeft}
                </p>
              </div>
              <button
                className={`w-full py-3 rounded-lg font-bold text-center ${
                  isStaking
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
                } transition-colors`}
                onClick={handleStake}
                disabled={isStaking}
              >
                {isStaking ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Stake ${selectedPool.entryFee} & Enter Pool`
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
