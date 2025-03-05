import { motion } from "framer-motion";
import {
  Import,
  Trophy,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useState, useEffect} from "react";
import { CORE_CONTRACT_ADDRESS } from "../utils/contract/contract";
import { PoolInterface } from "../utils/Interfaces";
import ABI from "../utils/contract/CoinToss.json"
import {useAccount,useBalance,useWriteContract, useWaitForTransactionReceipt,useReadContract,} from "wagmi";

const RenderMyPoolsTab = () => {
  const [selectedPool, setSelectedPool] = useState<PoolInterface[]>([]);
  const [showGameView, setShowGameView] = useState(false);
  const navigate=useNavigate()

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

  
  const { data: myPools } = useReadContract({
    address: CORE_CONTRACT_ADDRESS,
    abi: ABI.abi,
    functionName: "getUserPools",
    args: [],
  });

  useEffect(() => {
          if (myPools) {
            
            if (!Array.isArray(myPools)) {
              throw new Error("Invalid pool data format");
            }
  
            const transformedPools: PoolInterface[] = myPools.map((pool, index) => ({
              id: Number(pool.poolId),
              entryFee: BigInt(pool.entryFee),
              maxParticipants: Number(pool.maxParticipants),
              currentParticipants: Number(pool.currentParticipants),
              prizePool: Number(pool.prizePool),
              currentRound: Number(pool.currentRound),
              poolStatus: Number(pool.poolStatus),
              maxWinners: Number(pool.maxWinners),
              currentActiveParticipants: Number(pool.currentActiveParticipants),
            }));
  
            setSelectedPool(transformedPools);
          }
        }, [myPools]);


  const handlePlay=()=>{
    
    navigate("/playgame")
     
  }

  return selectedPool.map((pools) => (
    <div className="grid md:grid-cols-2">
      <motion.div
        className="border border-yellow-900 bg-gradient-to-r from-gray-900 to-yellow-900 bg-opacity-20 rounded-lg p-4 mb-6 relative overflow-hidden"
        key={pools.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold flex items-center text-yellow-400">
              <Trophy size={18} className="mr-2" /> {pools.name}
            </h3>
            <p className="text-gray-400 text-sm">
              Almost full! Join now before it starts
            </p>
          </div>
          <div
            className={`text-sm font-medium ${getStatusColor(pools.poolStatus)}`}
          >
            {pools.poolStatus ==1 ? "Filling" : "Starting Soon"}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Stake</p>
            <p className="font-medium text-white">{pools.entryFee}</p>
          </div>
          <div>
            <p className="text-gray-400">Players</p>
            <p className="font-medium text-white">{pools.currentParticipants}</p>
          </div>
          {/* <div>
            <p className="text-gray-400">Time Left</p>
            <p className="font-medium text-white">{pools.timeLeft}</p>
          </div> */}
          <div>
            <p className="text-gray-400">Pool Prize</p>
            <p className="font-medium text-white">{pools.prizePool}</p>
          </div>
        </div>

        

        <button
          className="mt-4 bg-gradient-to-r from-yellow-600 to-red-600 text-black font-bold py-2 px-4 rounded-lg w-full transition-colors"
            onClick={() => handlePlay()}
        >
          Play
        </button>
      </motion.div>
    </div>
  ));
};

export default RenderMyPoolsTab;
