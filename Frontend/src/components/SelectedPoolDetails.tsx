import {motion,  AnimatePresence } from "framer-motion";
import {useAccount,useBalance} from "wagmi";
import {formatFigures} from "../utils/convertion"
import {PoolInterface} from '../utils/Interfaces'

interface SelectedPoolDetailsProps {
  isModalOpen: boolean; 
  selectedPool: PoolInterface | null; 
  isStaking:boolean;
  closeModal:()=> void;
  handleStake:()=> void
}

const SelectedPoolDetails = ({isModalOpen,selectedPool,closeModal, isStaking, handleStake}:SelectedPoolDetailsProps) => {
  const { address,} = useAccount();
  const {data: balanceData,} = useBalance({address: address,chainId: 1114,});

  
  return (
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
            {/* Join {selectedPool.} */}
          </h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400">Required Stake</p>
              <p className="text-xl font-bold">
                {formatFigures(selectedPool.entryFee.toString())}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Your Balance</p>
              <p className="text-xl font-bold text-green-400">
                {balanceData?.formatted} {balanceData?.symbol}
              </p>
            </div>
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
              `Stake ${ formatFigures(selectedPool.entryFee.toString())} & Enter Pool`
            )}
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  )
}

export default SelectedPoolDetails

