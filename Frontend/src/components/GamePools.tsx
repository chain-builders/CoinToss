import React, { useState, useEffect, useContext } from "react";
import {useAccount,useBalance,useWriteContract, useWaitForTransactionReceipt,useReadContract,} from "wagmi";
import {Sparkles,Trophy} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ABI from "../utils/contract/CoinToss.json";
import { CORE_CONTRACT_ADDRESS } from "../utils/contract/contract";
import { formatFigures } from "../utils/convertion";
import { PoolInterface } from "../utils/Interfaces";
import { MyContext } from "../context/contextApi";
import SelectedPoolDetails from "./SelectedPoolDetails";

const PoolsInterface: React.FC = () => {

      const [pools, setPools] = useState<PoolInterface[]>([]);
      const [newPools, setNewPools] = useState<PoolInterface[]>([]);
      const [selectedPool, setSelectedPool] = useState<PoolInterface | null>(null);
      const [userBalance, setUserBalance] = useState<number>(1000);
      const [stakeAmount, setStakeAmount] = useState<number>(0);
      const [isStaking, setIsStaking] = useState<boolean>(false);
      const [showPulse, setShowPulse] = useState<{ [key: number]: boolean }>({});
      const [featuredPool, setFeaturedPool] = useState<PoolInterface | null>(null);
      const [showNotification, setShowNotification] = useState<boolean>(false);
      const [notificationMessage, setNotificationMessage] = useState<string>("");
      const [joining, setJoining] = useState(false);
      const {writeContract,data: hash,isPending: isWritePending,error,} = useWriteContract();
      const [isModalOpen, setIsModalOpen] = useState(false);
      const { address, isConnected } = useAccount();
      const {data: balanceData,isLoading,isError,} = useBalance({address: address,chainId: 1114,});

      const {recentWinners,setMyPools,}=useContext(MyContext)
      



      // all pools
      const { data: allPools } = useReadContract({
        address: CORE_CONTRACT_ADDRESS,
        abi: ABI.abi,
        functionName: "getAllPools",
        args: [],
      });

      useEffect(() => {
        if (allPools) {
          // Check if allPools is a valid array
          if (!Array.isArray(allPools)) {
            throw new Error("Invalid pool data format");
          }

          const transformedPools: PoolInterface[] = allPools.map((pool, index) => ({
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

          setNewPools(transformedPools);
        }
      }, [allPools]);


      // join pool function
      const { isLoading: isConfirming, isSuccess: isConfirmed, error:txError } =
        useWaitForTransactionReceipt({hash,});

      useEffect(() => {
        if(isConfirmed) {
          setJoining(false);
          setIsStaking(false)
          setIsModalOpen(false)
        }

        if(txError){
          setIsStaking(false)
          setIsModalOpen(false)
        }
      }, [isConfirmed,txError ]);

      const handleJoinPool = async (poolId: number, entryFee: BigInt) => {
        setIsStaking(true);
        try {
          writeContract({
            address: CORE_CONTRACT_ADDRESS as `0x${string}`,
            abi: ABI.abi,
            functionName: "joinPool",
            args: [BigInt(poolId)],
            value: entryFee,
            gas: BigInt(300000),
          });
          setJoining(true);
        } catch (err) {
          setIsStaking(true);
          setJoining(false);
        }
      }; // Function to handle pool selection


      const handlePoolSelect = (pool: PoolInterface) => {
        setSelectedPool(pool);
        setIsModalOpen(true);
        setStakeAmount(parseInt(pool.stake.replace("$", ""), 10));
      };

      const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPool(null); // Clear selected pool
        setIsStaking(false)
      };

      // Function to handle staking and entering a pool
      const handleStake = async () => {
        if (!selectedPool) return;
        
        try {
          
          const tx = await handleJoinPool(selectedPool.id, selectedPool.entryFee);
          await tx.wait();
          setUserBalance((prevBalance) => prevBalance - stakeAmount);

          
          
        } catch (error) {
          console.error("Transaction failed:", error);
          showPoolNotification("Transaction failed. Please try again.");
        } finally {
          // setIsStaking(false);
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

      // set pool names
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
              {newPools.map((pool) => (
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
                      <p className="font-medium">{formatFigures(pool.entryFee)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Players</p>

                      <p className="font-medium">
                        {pool.currentParticipants}/{pool.maxParticipants}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">PoolPrice</p>
                      <p className="font-medium">{formatFigures(pool.prizePool)}</p>
                    </div>
                  </div>

                  {/* Progress bar for pool filling status */}
                  <div className="mt-3">
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          pool.poolStatus === 1 ? "bg-yellow-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${pool.currentParticipants}%` }}
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
