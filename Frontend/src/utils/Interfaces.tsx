// Define types for the pool object
import { ReactNode } from "react";
export  interface PoolInterface {
  id: number;
  entryFee: BigInt;
  maxParticipants: number;
  currentParticipants: number;
  prizePool: number;
  poolStatus: number;
}



// Define types for the recent winners
export interface RecentWinner {
    name: string;
    amount: string;
    time: string;
  }

export  interface MyContextProviderProps {
    children: ReactNode; // Correct type for the `children` prop
  } 


 export  interface MyContextType {
    myPools: Record<string, any>; // Replace `any` with a more specific type if needed
    setMyPools: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  }

export  interface GameStats {
    totalPlayers: number;
    remainingPlayers: number;
    rounds: number;
    roundsCompleted: number;
    winningChoice: string | null;
  }
  
export  interface PlayerHistoryEntry {
    round: number;
    players: GamePlayer[];
    headsCount: number;
    tailsCount: number;
    minorityChoice: string;
    survivors: number;
  }
  
export  interface GamePlayer {
    id: number;
    address: string;
    choice: string;
    survived: boolean;
  }
  
export  interface NotificationProps {
    isVisible: boolean;
    isSuccess: boolean;
    message: string;
    subMessage: string;
  }













  import { useState, useEffect, useRef } from "react";
  import { formatTime } from "../utils/utilFunction";
  import {
    useWriteContract,
    useWaitForTransactionReceipt,
    useWatchContractEvent,
    useReadContract,
    useAccount,
  } from "wagmi";
  import { useNavigate, useLocation } from "react-router-dom";
  import CoinTossABI from "../utils/contract/CoinToss.json";
  import { CORE_CONTRACT_ADDRESS } from "../utils/contract/contract";
  
  enum PlayerChoice {
    NONE = 0,
    HEADS = 1,
    TAILS = 2,
  }
  
  type PlayerStatus = [boolean, boolean, boolean, boolean]; // [isParticipant, isEliminated, isWinner, hasClaimed]
  
  const PlayGame = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const pool = location.state.pools;
    const { address } = useAccount();
  
    const [isTimerActive, setIsTimerActive] = useState(true);
    const [selectedChoice, setSelectedChoice] = useState<PlayerChoice | null>(null);
    const [round, setRound] = useState(1);
    const [timer, setTimer] = useState(20); // Timer starts immediately
    const [isCoinFlipping, setIsCoinFlipping] = useState(false);
    const [coinRotation, setCoinRotation] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false); // Prevent reselection
    const [notification, setNotification] = useState({
      isVisible: false,
      isSuccess: false,
      message: "",
      subMessage: "",
    });
    const [isWaitingForOthers, setIsWaitingForOthers] = useState(false);
    const [isEliminated, setIsEliminated] = useState(false); // Track elimination
    const [isWinner, setIsWinner] = useState(false); // Track if player is a winner
    const [showWinnerPopup, setShowWinnerPopup] = useState(false); // Show winner pop-up
    const [hasClaimed, setHasClaimed] = useState(false); // Track if prize has been claimed
    const coinFlipInterval = useRef<NodeJS.Timeout | null>(null);
    // Fetch player status
    const {
      data: playerStatus,
      refetch: refetchPlayerStatus,
      isError: isStatusError,
      isLoading: isStatusLoading,
    } = useReadContract({
      address: CORE_CONTRACT_ADDRESS,
      abi: CoinTossABI.abi,
      functionName: "getPlayerStatus",
      args: [BigInt(pool.id), address],
    });
  
    const isEliminatedStatus = playerStatus ? playerStatus[1] : false; // Check if player is eliminated
    const isWinnerStatus = playerStatus ? playerStatus[2] : false; // Check if player is a winner
    const hasClaimedStatus = playerStatus ? playerStatus[3] : false; // Check if prize has been claimed
  
    // Fetch pool status
    const {
      data: poolStatus,
      isLoading: isPoolStatusLoading,
    } = useReadContract({
      address: CORE_CONTRACT_ADDRESS,
      abi: CoinTossABI.abi,
      functionName: "getPoolInfo",
      args: [BigInt(pool.id)],
    });
  
    // Redirect if pool is not active or prize has been claimed
    useEffect(() => {
      if (poolStatus && (pool.s !== 2 || hasClaimedStatus)) {
        navigate("/explore"); // Redirect if pool is not active or prize has been claimed
      }
    }, [poolStatus, hasClaimedStatus]);
  
    // Handle player elimination
    useEffect(() => {
      if (isEliminatedStatus) {
        setIsEliminated(true);
        setIsTimerActive(false);
        showNotification(false, "Eliminated", "You have been eliminated from the pool.");
        setTimeout(() => {
          navigate("/explore");
        }, 3000);
      }
    }, [isEliminatedStatus]);
  
    // Handle player winning the game
    useEffect(() => {
      if (isWinnerStatus && poolStatus?.status === "CLOSED") {
        setIsWinner(true);
        setShowWinnerPopup(true); // Show winner pop-up
      }
    }, [isWinnerStatus, poolStatus]);
  
    // Handle player choice submission
    const handleMakeChoice = async (selected: PlayerChoice) => {
      if (!isTimerActive || timer <= 3 || isEliminated || hasSubmitted) return; // Prevent reselection
      setSelectedChoice(selected);
      setHasSubmitted(true); // Mark as submitted
      startCoinAnimation();
      await handleSubmit(selected);
    };
  
    const handleSubmit = async (selected: PlayerChoice) => {
      if (!selected) {
        showNotification(false, "Error", "Please select HEADS or TAILS");
        return;
      }
  
      try {
        setIsSubmitting(true);
        await writeContract({
          address: CORE_CONTRACT_ADDRESS,
          abi: CoinTossABI.abi,
          functionName: "makeSelection",
          args: [BigInt(pool.id), selected],
        });
      } catch (err: any) {
        const errorMessage = err.message || "Transaction failed";
        showNotification(false, "Transaction Error", errorMessage);
        setIsSubmitting(false);
        stopCoinAnimation(); // Stop animation on failure
      }
    };
  
    // Handle token claim
    const handleClaimPrize = async () => {
      try {
        setIsSubmitting(true);
        await writeContract({
          address: CORE_CONTRACT_ADDRESS,
          abi: CoinTossABI.abi,
          functionName: "claimPrize",
          args: [BigInt(pool.id)],
        });
        setHasClaimed(true); // Mark prize as claimed
        showNotification(true, "Success!", "Your prize has been claimed!");
        setShowWinnerPopup(false); // Close pop-up after claiming
      } catch (err: any) {
        const errorMessage = err.message || "Transaction failed";
        showNotification(false, "Transaction Error", errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    };
  
    // Handle RoundCompleted event
    useWatchContractEvent({
      address: CORE_CONTRACT_ADDRESS,
      abi: CoinTossABI.abi,
      eventName: "RoundCompleted",
      onLogs: (logs) => {
        for (const log of logs) {
          try {
            const poolId = BigInt(log.topics[1]);
            const roundNumber = BigInt(log.args?.roundNumber);
            const winningSelection = BigInt(log.args?.winningSelection);
  
            if (poolId === BigInt(pool.id)) {
              const userSurvived = selectedChoice === Number(winningSelection);
              if (userSurvived) {
                setRound(Number(roundNumber) + 1); // Move to the next round
                setTimer(20); // Reset timer
                setIsTimerActive(true);
                setHasSubmitted(false); // Allow selection in the next round
              } else {
                setIsEliminated(true); // Mark as eliminated
              }
            }
          } catch (error) {
            console.error("Error processing event log:", error);
          }
        }
      },
    });
  
    // Start/stop coin animation
    const startCoinAnimation = () => {
      setIsCoinFlipping(true);
      coinFlipInterval.current = setInterval(() => {
        setCoinRotation((prev) => (prev + 36) % 360);
      }, 100);
    };
  
    const stopCoinAnimation = () => {
      if (coinFlipInterval.current) {
        clearInterval(coinFlipInterval.current);
        coinFlipInterval.current = null;
      }
      setIsCoinFlipping(false);
      setCoinRotation(0);
    };
  
    // Show notification
    const showNotification = (isSuccess: boolean, message: string, subMessage: string) => {
      setNotification({ isVisible: true, isSuccess, message, subMessage });
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, isVisible: false }));
        if (!isSuccess) {
          navigate("/explore");
        }
      }, 3000);
    };