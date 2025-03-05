import { useState, useEffect, useRef } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useReadContract,
} from "wagmi";
import { useNavigate, useLocation } from "react-router-dom";
import CoinTossABI from "../utils/contract/CoinToss.json";
import { CORE_CONTRACT_ADDRESS } from "../utils/contract/contract";


enum PlayerChoice {
  NONE = 0,
  HEADS = 1,
  TAILS = 2,
}

const PlayGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pool = location.state.pools;

  const [isTimerActive, setIsTimerActive] = useState(true);
  const [selectedChoice, setSelectedChoice] = useState<PlayerChoice | null>(null);
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState(20);
  const [isCoinFlipping, setIsCoinFlipping] = useState(false);
  const [coinRotation, setCoinRotation] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    isSuccess: false,
    message: "",
    subMessage: "",
  });

  const { address } = useAccount();
  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  // -----------------------------------------Handle player choice selection------------------------------------------------------
  const handleMakeChoice = (selected: PlayerChoice) => {
    if (!isTimerActive || timer <= 3) return;
    setSelectedChoice(selected);
    startCoinAnimation();
    handleSubmit(selected);
  };

  // __________________________________________Handle submission to the smart contract___________________________________________________

  const handleSubmit = async (selected: PlayerChoice) => {
    if (!selected || selected === PlayerChoice.NONE) {
      showNotification(false, "Error", "Please select HEADS or TAILS");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await writeContract({
        address: CORE_CONTRACT_ADDRESS as `0x${string}`,
        abi: CoinTossABI.abi,
        functionName: "makeSelection",
        args: [BigInt(pool.id), selected],
      });
    } catch (err: any) {
      const errorMessage = err.message || "Transaction failed";
      showNotification(false, "Transaction Error", errorMessage);
      setIsSubmitting(false);
    }
  };

  // -----------------------------------------Handle transaction success or error----------------------------------------
  useEffect(() => {
    if (isConfirmed) {
      setIsSubmitting(false);
      setSelectedChoice(null);
      showNotification(true, "Success!", "Your selection has been recorded!");
    }

    if (writeError) {
      setIsSubmitting(false);
    }

    if (receiptError) {
      setIsSubmitting(false);
    }
  }, [isConfirmed, writeError, receiptError]);

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
``
  };

  // ---------------------------------------Start coin flipping animation------------------------------------------------------
  const startCoinAnimation = () => {
    setIsCoinFlipping(true);
    const interval = setInterval(() => {
      setCoinRotation((prev) => (prev + 36) % 360);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setIsCoinFlipping(false);
      setCoinRotation(0);
    }, 2000); // Stop animation after 2 seconds
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

      return () => clearInterval(interval);
    } else if (timer === 0) {
      setIsTimerActive(false);
      showNotification(false, "Time's up!", "You didn't make a choice in time.");
    }
  }, [isTimerActive, timer]);

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
                {round} of {pool.rounds}
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-gray-400">REMAINING PLAYERS</div>
            <div className="text-2xl font-bold text-yellow-500">
              {pool.remainingPlayers}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-400">POTENTIAL REWARD</div>
            <div className="text-2xl font-bold text-yellow-500 animate-pulse-slow">
              +{Math.floor(pool.remainingPlayers * 0.8)}{" "}
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
              opacity: coinRotation % 180 < 90 ? "1" : "0.2",
            }}
          >
            {coinRotation % 180 < 90 ? "🪙" : "💰"}
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
            disabled={!isTimerActive || isCoinFlipping || isSubmitting}
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
            disabled={!isTimerActive || isCoinFlipping || isSubmitting}
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
                timer < 5
                  ? "text-red-500 animate-pulse"
                  : timer < 10
                  ? "text-orange-500"
                  : "text-yellow-500"
              }`}
            >
              {formatTime(timer)}
            </div>
          </div>

          <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                timer < 5
                  ? "bg-gradient-to-r from-red-700 to-red-500 animate-pulse"
                  : timer < 10
                  ? "bg-gradient-to-r from-orange-700 to-orange-500"
                  : "bg-gradient-to-r from-yellow-700 to-yellow-500"
              }`}
              style={{ width: `${(timer / 10) * 100}%` }}
            ></div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-400">
              <span className="text-yellow-500 font-bold">Tip:</span> The
              minority option wins!
            </div>
          </div>
        </div>
      </div>

      {/* Notification for round results */}
      {notification.isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
          <div
            className={`p-8 rounded-xl border-4 ${
              notification.isSuccess
                ? "border-green-500 bg-green-900"
                : "border-red-500 bg-red-900"
            } bg-opacity-90 text-center max-w-md transform scale-in-center`}
          >
            <div
              className={`text-6xl mb-4 ${
                notification.isSuccess ? "text-green-400" : "text-red-400"
              }`}
            >
              {notification.isSuccess ? "🏆" : "❌"}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {notification.message}
            </h2>
            <p
              className={`text-xl ${
                notification.isSuccess ? "text-green-300" : "text-red-300"
              }`}
            >
              {notification.subMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayGame;