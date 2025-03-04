import { useState, useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import CoinTossABI from "../utils/contract/CoinToss.json";
import { CORE_CONTRACT_ADDRESS } from "../utils/contract/contract";

// ... (other interfaces and types)

const PlayGame = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("explore");
  const [selectedPool, setSelectedPool] = useState<any>(null);
  const [showGameView, setShowGameView] = useState(false);
  const [gameStage, setGameStage] = useState("choice");
  const [isTimerActive, setIsTimerActive] = useState(true); // Timer starts immediately
  const [choice, setChoice] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState(10);
  const [winners, setWinners] = useState<GamePlayer[]>([]);
  const [playerHistory, setPlayerHistory] = useState<PlayerHistoryEntry[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalPlayers: 16,
    remainingPlayers: 16,
    rounds: 4,
    roundsCompleted: 0,
    winningChoice: null,
  });
  const [isCoinFlipping, setIsCoinFlipping] = useState(false);
  const [coinRotation, setCoinRotation] = useState(0);
  const [notification, setNotification] = useState<NotificationProps>({
    isVisible: false,
    isSuccess: false,
    message: "",
    subMessage: "",
  });
  const [gameOver, setGameOver] = useState(false);
  const coinFlipInterval = useRef<NodeJS.Timeout | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<PlayerChoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const { address } = useAccount();
  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } =
    useWaitForTransactionReceipt({ hash });

  // Handle player choice selection
  const handleMakeChoice = (selected: PlayerChoice) => {
    if (!isTimerActive || timer <= 3) return; // Prevent selection if timer is <= 3 seconds
    setSelectedChoice(selected);
    startCoinAnimation();
    handleSubmit(selected); // Trigger the contract call
  };

  // Handle submission to the smart contract
  const handleSubmit = async (selected: PlayerChoice) => {
    if (!selected || selected === PlayerChoice.NONE) {
      alert("Please select HEADS or TAILS");
      return;
    }

    try {
      setIsSubmitting(true);
      setHasAttemptedSelection(true); // Mark that the user has attempted a selection
      setIsTimerActive(false); // Pause the timer while the transaction is being processed

      writeContract({
        address: CORE_CONTRACT_ADDRESS as `0x${string}`,
        abi: CoinTossABI.abi,
        functionName: "makeSelection",
        args: [BigInt(selectedPool?.id || 0), selected],
      });
    } catch (err) {
      console.error("Error making selection:", err);
      setIsSubmitting(false);
      setIsTimerActive(true); // Resume the timer if the transaction fails
      setHasAttemptedSelection(false); // Allow the user to retry
    }
  };

  // Handle transaction success or error
  useEffect(() => {
    if (isConfirmed) {
      setIsSubmitting(false);
      setSelectedChoice(null);
      showNotification(true, "Success!", "Your selection has been recorded!");
      setIsTimerActive(true); // Resume the timer
      setHasAttemptedSelection(false); // Reset the attempt state
    }

    if (writeError || receiptError) {
      console.error("Error making selection:", writeError || receiptError);
      showNotification(false, "Error!", "Failed to make selection.");
      setIsSubmitting(false);
      setIsTimerActive(true); // Resume the timer
      setHasAttemptedSelection(false); // Allow the user to retry
    }
  }, [isConfirmed, writeError, receiptError]);

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Generate mock players with random choices
  const generateMockPlayers = (total: number, userChoice: string | null) => {
    const players: GamePlayer[] = [];
    for (let i = 1; i <= total; i++) {
      const playerChoice = Math.random() > 0.5 ? "heads" : "tails";
      players.push({
        id: i,
        address: `0x${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
        choice: i === 1 && userChoice ? userChoice : playerChoice,
        survived: false,
      });
    }
    return players;
  };

  // Handle round completion
  const handleRoundEnd = () => {
    stopCoinAnimation();

    if (!selectedChoice) {
      // If no choice was made, eliminate the player
      setGameStage("results");
      showNotification(false, "Eliminated!", "You didn't make a choice in time!");
      setTimeout(() => {
        setGameStage("gameOver");
        setGameOver(true);
      }, 3000);
      return;
    }

    const totalPlayers = gameStats.remainingPlayers;
    const players = generateMockPlayers(
      totalPlayers,
      selectedChoice === PlayerChoice.HEADS ? "heads" : "tails"
    );

    const headsCount = players.filter((p) => p.choice === "heads").length;
    const tailsCount = players.filter((p) => p.choice === "tails").length;

    const minorityChoice = headsCount <= tailsCount ? "heads" : "tails";

    const updatedPlayers = players.map((player) => ({
      ...player,
      survived: player.choice === minorityChoice,
    }));

    const survivors = updatedPlayers.filter((p) => p.survived);

    setGameStats((prev) => ({
      ...prev,
      remainingPlayers: survivors.length,
      roundsCompleted: prev.roundsCompleted + 1,
      winningChoice: minorityChoice,
    }));

    setPlayerHistory((prev) => [
      ...prev,
      {
        round,
        players: updatedPlayers,
        headsCount,
        tailsCount,
        minorityChoice,
        survivors: survivors.length,
      },
    ]);

    const userSurvived =
      (selectedChoice === PlayerChoice.HEADS && minorityChoice === "heads") ||
      (selectedChoice === PlayerChoice.TAILS && minorityChoice === "tails");

    setGameStage("results");

    // Show notification based on result
    if (userSurvived) {
      showNotification(true, "Success!", "You've advanced to the next round!");
    } else {
      showNotification(false, "Eliminated!", "Better luck next time!");
    }

    setTimeout(() => {
      if (survivors.length <= 1 || round >= gameStats.rounds || !userSurvived) {
        setWinners(survivors);
        setGameStage("gameOver");
        setGameOver(true);
      } else {
        setGameStage("roundSummary");
        setTimeout(() => {
          setRound(round + 1);
          setGameStage("choice");
          setSelectedChoice(null);
          setTimer(10); // Reset timer for the next round
          setIsTimerActive(true); // Restart the timer
        }, 2000);
      }
    }, 3000);
  };

  // Start coin flipping animation
  const startCoinAnimation = () => {
    setIsCoinFlipping(true);

    if (coinFlipInterval.current) clearInterval(coinFlipInterval.current);

    coinFlipInterval.current = setInterval(() => {
      setCoinRotation((prev) => (prev + 36) % 360);
    }, 100);
  };

  // Stop coin flipping animation
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
    setNotification({
      isVisible: true,
      isSuccess,
      message,
      subMessage,
    });

    setTimeout(() => {
      setNotification((prev) => ({ ...prev, isVisible: false }));
    }, 4000);
  };

  // Countdown logic
  useEffect(() => {
    if (isTimerActive && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      // Cleanup interval on unmount or when timer reaches 0
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setIsTimerActive(false); // Stop the timer when it reaches 0
      handleRoundEnd();
    }
  }, [isTimerActive, timer]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (coinFlipInterval.current) {
        clearInterval(coinFlipInterval.current);
      }
    };
  }, []);

  return (
    <div className="h-screen bg-gray-950 flex flex-col items-center justify-center">
      {/* Top Game Status Bar */}
      <div className="w-full max-w-4xl px-4">
        <div className="flex justify-between items-center bg-black bg-opacity-70 px-6 py-3 rounded-lg border border-gray-800 mb-8">
          <div className="flex items-center">
            <div className="bg-yellow-600 w-10 h-10 rounded-full flex items-center justify-center border border-yellow-500 mr-3">
              <span className="text-white font-bold">{round}</span>
            </div>
            <div>
              <div className="text-gray-400 text-xs">ROUND</div>
              <div className="text-white font-bold">
                {round} of {gameStats.rounds}
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-gray-400">REMAINING PLAYERS</div>
            <div className="text-2xl font-bold text-yellow-500">
              {gameStats.remainingPlayers}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-400">POTENTIAL REWARD</div>
            <div className="text-2xl font-bold text-yellow-500 animate-pulse-slow">
              +{Math.floor(gameStats.remainingPlayers * 0.8)}{" "}
              <span className="text-xs">Points</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">CHOOSE WISELY</h1>
        <p className="text-red-500 font-medium">
          Only the minority will survive
        </p>
      </div>

      {/* Coin Animation Area */}
      {isCoinFlipping && (
        <div className="absolute z-10 h-48 w-48 flex items-center justify-center">
          <div 
            className="w-32 h-32 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-4xl transform transition-all duration-100 border-4 border-yellow-300 shadow-lg"
            style={{ 
              transform: `rotateY(${coinRotation}deg)`,
              opacity: coinRotation % 180 < 90 ? '1' : '0.2'
            }}
          >
            {coinRotation % 180 < 90 ? '🪙' : '💰'}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 md:gap-12 justify-center items-center mb-10">
  
        <div className="relative">
         
          {selectedChoice === PlayerChoice.HEADS && (
            <div className="absolute -inset-3 bg-yellow-500 opacity-20 blur-xl rounded-full animate-pulse"></div>
          )}
          <button
            onClick={() => handleMakeChoice(PlayerChoice.HEADS)}
            className={`w-36 h-36 text-white rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
              selectedChoice === PlayerChoice.HEADS
                ? "border-4 border-yellow-500 bg-gradient-to-br from-yellow-900 to-yellow-950 shadow-glow-gold"
                : "border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-yellow-600"
            }`}
            disabled={!isTimerActive || isCoinFlipping || isSubmitting || timer <= 3}
          >
            <div className="text-center p-2">
              <div className="text-4xl mb-3">🪙</div>
              <div className="text-xl font-bold">HEADS</div>
              {selectedChoice === PlayerChoice.HEADS && (
                <div className="mt-2 text-yellow-500 text-sm font-bold animate-pulse">
                  SELECTED
                </div>
              )}
            </div>
          </button>

        </div>

        {/* VS Divider */}
        <div className="flex flex-col items-center">
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-red-500 to-transparent hidden md:block"></div>
          <div className="text-2xl font-bold text-red-500 my-2">VS</div>
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-red-500 to-transparent hidden md:block"></div>
        </div>

        {/* Tails Option */}
        <div className="relative">
          {selectedChoice === PlayerChoice.TAILS && (
            <div className="absolute -inset-3 bg-yellow-500 opacity-20 blur-xl rounded-full animate-pulse"></div>
          )}
          <button
            onClick={() => handleMakeChoice(PlayerChoice.TAILS)}
            className={`w-36 h-36 rounded-full flex items-center text-white justify-center transition-all transform hover:scale-105 ${
              selectedChoice === PlayerChoice.TAILS
                ? "border-4 border-yellow-500 bg-gradient-to-br from-yellow-900 to-yellow-950 shadow-glow-gold"
                : "border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-yellow-600"
            }`}
            disabled={!isTimerActive || isCoinFlipping || isSubmitting || timer <= 3}
          >
            <div className="text-center p-2">
              <div className="text-4xl mb-3">💰</div>
              <div className="text-xl font-bold">TAILS</div>
              {selectedChoice === PlayerChoice.TAILS && (
                <div className="mt-2 text-yellow-500 text-sm font-bold animate-pulse">
                  SELECTED
                </div>
              )}
            </div>
          </button>

        </div>
      </div>
     
      {/* Timer Section with Enhanced Drama */}
      <div className="max-w-xl w-full mx-auto px-4">
        <div className="bg-black bg-opacity-80 p-4 rounded-lg border border-gray-800">
          <div className="flex justify-between items-center mb-2">
            <div className="text-white font-bold text-xl">TIME REMAINING</div>
            <div
              className={`text-2xl font-bold ${
                timer < 5 ? "text-red-500 animate-pulse" : timer < 10 ? "text-orange-500" : "text-yellow-500"
              }`}
            >
              {formatTime(timer)}
            </div>
          </div>

          <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
            <div
              className={`h-full $