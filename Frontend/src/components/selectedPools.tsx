import { motion } from "framer-motion";
import { Trophy, Users, Coins, PlayCircle } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";
import { CORE_CONTRACT_ADDRESS } from "../utils/contract/contract";
import { PoolInterface } from "../utils/Interfaces";
import ABI from "../utils/contract/CoinToss.json";
import { formatFigures } from "../utils/convertion";
import {
  useAccount,
  useBalance,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";

const RenderMyPoolsTab = () => {
  const [selectedPool, setSelectedPool] = useState<PoolInterface[]>([]);
  const { address } = useAccount();
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "filling":
        return "text-yellow-500";
      case "starting":
        return "text-green-500";
      case "active":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const {
    data: userPools,
    isLoading,
    error,
  } = useReadContract({
    address: CORE_CONTRACT_ADDRESS,
    abi: ABI.abi,
    functionName: "getUserPools",
    args: [],
    account: address,
  });
  useEffect(() => {
    if (userPools) {
      if (!Array.isArray(userPools)) {
        throw new Error("Invalid pool data format");
      }

      const transformedPools: PoolInterface[] = userPools.map(
        (pool, index) => ({
          id: Number(pool.poolId),
          entryFee: BigInt(pool.entryFee),
          maxParticipants: Number(pool.maxParticipants),
          currentParticipants: Number(pool.currentParticipants),
          prizePool: Number(pool.prizePool),
          poolStatus: Number(pool.status),
        })
      );
      
      console.log(userPools)
     
      console.log(isLoading);
      setSelectedPool(transformedPools);
    }
  }, [userPools]);

  const handlePlay = (pools:PoolInterface) => {
    navigate("/playgame", {state:{pools}});
  };
  const getProgressPercentage = (pools) => {
    return Math.round(
      (pools.currentParticipants / pools.maxParticipants) * 100
    );
  };

  const setPoolNames = (poolId: number) => {
    const poolNames = [
      "Aqua Fortune Pool",
      "Crypto Waves",
      "DeFi Dive",
      "Ether Oasis",
      "Blockchain Rapids",
      "Moonshot Lagoon",
      "Whale's Haven",
      "Staking Sanctuary",
    ];
    return poolNames[poolId];
  };
  return selectedPool.map((pools) => (
    <div className="grid md:grid-cols-2">
      <motion.div
        className="border border-yellow-900 bg-gradient-to-r from-gray-900 to-yellow-900 bg-opacity-20 rounded-lg p-4 mb-6 relative overflow-hidden"
        key={pools.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <Trophy size={24} className="text-yellow-400" />
            <div>
              <h3 className="text-xl font-bold text-yellow-400">
                {setPoolNames(pools.id)}
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                Round {pools.currentRound}
              </p>
            </div>
          </div>
          <div
            className={`text-sm font-medium ${
              pools.currentParticipants === pools.maxParticipants ? "text-green-500" : "text-yellow-500"
            }`}
          >
            {pools.currentParticipants === pools.maxParticipants ? "Starting in 40 seconds" : "filling"}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-yellow-500 h-2 rounded-full"
            style={{ width: `${getProgressPercentage(pools)}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div className="flex items-center space-x-2">
            <Coins size={16} className="text-gray-400" />
            <div>
              <p className="text-gray-400 text-xs">Stake</p>
              <p className="font-medium text-white">
                {formatFigures(pools.entryFee)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Users size={16} className="text-gray-400" />
            <div>
              <p className="text-gray-400 text-xs">Players</p>
              <p className="font-medium text-white">
                {pools.currentParticipants}/{pools.maxParticipants}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Trophy size={16} className="text-gray-400" />
            <div>
              <p className="text-gray-400 text-xs">Pool Prize</p>
              <p className="font-medium text-white">
                {formatFigures(pools.prizePool)}
              </p>
            </div>
          </div>
        </div>

        <button
          className={`mt-4 bg-gradient-to-r from-yellow-600 to-red-600 text-black font-bold py-3 px-4 rounded-lg w-full transition-all duration-300 ease-in-out flex items-center justify-center space-x-2  active:scale-95 ${
            pools.currentParticipants !== pools.maxParticipants ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 active:scale-95"
          }`}
          onClick={() => handlePlay(pools)}
          disabled={pools.currentParticipants !== pools.maxParticipants}
        >
          <PlayCircle size={20} />
          <span>Play Now</span>
        </button>
      </motion.div>
    </div>
  ));
};

export default RenderMyPoolsTab;
