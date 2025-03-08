import { motion } from "framer-motion";
import { Trophy, Users, Coins, PlayCircle } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { CORE_CONTRACT_ADDRESS } from "../utils/contract/contract";
import ABI from "../utils/contract/CoinToss.json";
import { PoolInterface } from "../utils/Interfaces";
import { formatFigures } from "../utils/convertion";
import { useAccount, useWatchContractEvent, useReadContract } from "wagmi";
import { setPoolNames } from "../utils/utilFunction";

const RenderMyPoolsTab = () => {
  const [selectedPool, setSelectedPool] = useState<PoolInterface[]>([]);
  const { address } = useAccount();
  const navigate = useNavigate();

  const transformPoolData = useCallback((poolsData: any[]): PoolInterface[] => {
    if (!Array.isArray(poolsData)) {
      console.error("Invalid pool data format");
      return [];
    }

    return poolsData.map((pool) => ({
      id: Number(pool.poolId),
      entryFee: BigInt(pool.entryFee),
      maxParticipants: Number(pool.maxParticipants),
      currentParticipants: Number(pool.currentParticipants),
      prizePool: Number(pool.prizePool),
      poolStatus: Number(pool.status),
      currentRound: Number(pool.currentRound || 1),
    }));
  }, []);

  const { data: userPools } = useReadContract({
    address: CORE_CONTRACT_ADDRESS,
    abi: ABI.abi,
    functionName: "getUserPools",
    args: [],
    account: address,
  });

  useEffect(() => {
    if (userPools) {
      try {
        const transformedPools = transformPoolData(userPools);
        setSelectedPool(transformedPools);
      } catch (error) {
        console.error("Error processing pool data:", error);
      }
    }
  }, [userPools, transformPoolData]);

  useWatchContractEvent({
    address: CORE_CONTRACT_ADDRESS as `0x${string}`,
    abi: ABI.abi,
    eventName: "PlayerJoined",
    onLogs: (logs) => {
      fetchPools();
    },
  });

  const handlePlay = (pools: PoolInterface) => {
    if (pools.poolStatus !== 1 || pools.currentParticipants !== pools.maxParticipants) {
      return; 
    }
    navigate("/playgame", { state: { pools } });
  };

  const getProgressPercentage = (pools: PoolInterface) => {
    return Math.round(
      (pools.currentParticipants / pools.maxParticipants) * 100
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {selectedPool.map((pools) => (
          <motion.div
            className="border bg-gradient-to-r from-gray-900 to-yellow-900 bg-opacity-20 border-yellow-900  rounded-lg p-4 bg-gray-900 hover:bg-gray-800 cursor-pointer transition-all gap-3"
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
                  pools.poolStatus === 1 ? "text-green-500" : "text-yellow-500"
                }`}
              >
                {pools.poolStatus === 1 ? (
                  <p>Starting in 40 seconds</p>
                ) : pools.poolStatus === 2 ? (
                  <p>Closed</p>
                ) : null}
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
                    {formatFigures(pools.entryFee.toString())}
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
                    {formatFigures(pools.prizePool.toString())}
                  </p>
                </div>
              </div>
            </div>

            <button
              className={`mt-4 bg-gradient-to-r from-yellow-600 to-red-600 text-black font-bold py- px-4 rounded-lg w-full transition-all duration-300 ease-in-out flex items-center justify-center space-x-2  active:scale-95 ${
                pools.poolStatus == 2
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:opacity-90 active:scale-95"
              }`}
              onClick={() => handlePlay(pools)}
              disabled={
                pools.currentParticipants !== pools.maxParticipants ||
                pools.poolStatus === 2
              }
            >
              {pools.poolStatus == 1 && <PlayCircle size={20} />}
              {pools.poolStatus == 1 && <span>Play Now</span>}

              {pools.poolStatus == 2 && <span>Pool Closed</span>}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RenderMyPoolsTab;
