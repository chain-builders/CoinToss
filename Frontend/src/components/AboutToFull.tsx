import { motion } from "framer-motion";
import { PoolInterface } from "../utils/Interfaces";
import { Trophy} from "lucide-react";
import { setPoolNames } from "../utils/utilFunction";

const AboutToFull = (featuredPool:PoolInterface[]) => {


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
  return (
    <div>
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
                <Trophy size={18} className="mr-2" /> {setPoolNames(featuredPool.id)}
              </h3>
              <p className="text-gray-400 text-sm">
                Almost full! Join now before it starts
              </p>
            </div>
            <div
              className={`text-sm font-medium ${getStatusColor(
                featuredPool
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
    </div>
  )
}

export default AboutToFull
