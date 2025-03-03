import { motion } from "framer-motion";
import {
  Sparkles,
  Trophy,
  Clock,
  Users,
  TrendingUp,
  Star,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useState } from "react";

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
const RenderMyPoolsTab = () => {
  const [selectedPool, setSelectedPool] = useState<Pool[] | null>(null);
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

  const featuredPool: Pool[] = [
    {
      id: 1,
      name: "High Rollers",
      status: "filling",
      stake: "$100",
      players: "12/16",
      timeLeft: "03:42",
      playersCount: 12,
      maxPlayers: 16,
      percentFull: 75,
      popularity: "high",
      previousWinners: 142,
      averageTime: "4m",
    },
    {
      id: 2,
      name: "Quick Play",
      status: "starting",
      stake: "$25",
      players: "14/16",
      timeLeft: "01:15",
      playersCount: 14,
      maxPlayers: 16,
      percentFull: 87,
      popularity: "trending",
      previousWinners: 358,
      averageTime: "3m",
    },
  ];

  const handlePlay=()=>{
    
    navigate("/playgame")
     
  }

  return featuredPool.map((pools) => (
    <div className="grid grid-cols-2">
      <motion.div
        className="border border-yellow-900 bg-gradient-to-r from-gray-900 to-yellow-900 bg-opacity-20 rounded-lg p-4 mb-6 relative overflow-hidden"
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
            className={`text-sm font-medium ${getStatusColor(pools.status)}`}
          >
            {pools.status === "filling" ? "Filling" : "Starting Soon"}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Stake</p>
            <p className="font-medium text-white">{pools.stake}</p>
          </div>
          <div>
            <p className="text-gray-400">Players</p>
            <p className="font-medium text-white">{pools.players}</p>
          </div>
          <div>
            <p className="text-gray-400">Time Left</p>
            <p className="font-medium text-white">{pools.timeLeft}</p>
          </div>
          <div>
            <p className="text-gray-400">Previous Winners</p>
            <p className="font-medium text-white">{pools.previousWinners}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs text-gray-400 mb-1">Pool filling up</div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500"
              style={{ width: `${pools.percentFull}%` }}
            />
          </div>
        </div>

        <button
          className="mt-4 bg-green-500 hover:bg-green-800 text-black font-bold py-2 px-4 rounded-lg w-full transition-colors"
            onClick={() => handlePlay()}
        >
          Play
        </button>
      </motion.div>
    </div>
  ));
};

export default RenderMyPoolsTab;
