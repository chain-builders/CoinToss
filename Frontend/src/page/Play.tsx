import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { MakeSelection } from "../components/interaction/MakeSelectionButton";

interface GameStats {
  totalPlayers: number;
  remainingPlayers: number;
  rounds: number;
  roundsCompleted: number;
  winningChoice: string | null;
}

interface PlayerHistoryEntry {
  round: number;
  players: GamePlayer[];
  headsCount: number;
  tailsCount: number;
  minorityChoice: string;
  survivors: number;
}

interface GamePlayer {
  id: number;
  address: string;
  choice: string;
  survived: boolean;
}

interface NotificationProps {
  isVisible: boolean;
  isSuccess: boolean;
  message: string;
  subMessage: string;
}

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

  // Handle player choice selection
  const handleMakeChoice = (selected: string) => {
    if (!isTimerActive) return; // Prevent making a choice after the timer ends
    setChoice(selected);
    startCoinAnimation();
  };

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Generate mock players with random choices
  const generateMockPlayers = (total: number, userChoice: string | null) => {
    const players: GamePlayer[] = [];
    for (let i = 1; i <= total; i++) {
      const playerChoice = Math.random() > 0.5 ? "heads" : "tails";
      players.push({
        id: i,
        address: `0x${Math.random()
          .toString(16)
          .substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
        choice: i === 1 && userChoice ? userChoice : playerChoice,
        survived: false,
      });
    }
    return players;
  };

  // Handle round completion
  const handleRoundEnd = () => {
    stopCoinAnimation();

    if (!choice) {
      // If no choice was made, eliminate the player
      setGameStage("results");
      showNotification(
        false,
        "Eliminated!",
        "You didn't make a choice in time!"
      );
      setTimeout(() => {
        setGameStage("gameOver");
        setGameOver(true);
      }, 3000);
      return;
    }

    const totalPlayers = gameStats.remainingPlayers;
    const players = generateMockPlayers(totalPlayers, choice);

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

    const userSurvived = choice === minorityChoice;

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
          setChoice(null);
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
  const showNotification = (
    isSuccess: boolean,
    message: string,
    subMessage: string
  ) => {
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

  // Notification component
  const RoundNotification = () => {
    if (!notification.isVisible) return null;

    return (
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

          {notification.isSuccess && (
            <div className="mt-6 text-white">
              <div className="font-bold">
                Next round starting in 3 seconds...
              </div>
              <div className="w-full bg-gray-800 h-2 mt-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full animate-progress-bar"></div>
              </div>
            </div>
          )}

          {!notification.isSuccess && (
            <button
              className="mt-6 px-6 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold transition-colors"
              onClick={() =>
                setNotification((prev) => ({ ...prev, isVisible: false }))
              }
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  };

  // Game Over screen
  const GameOverScreen = () => {
    if (!gameOver) return null;

    const userWon = winners.length === 1 && winners[0].id === 1;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
        <div className="p-8 rounded-xl border-4 border-yellow-500 bg-gray-900 bg-opacity-95 text-center max-w-lg transform scale-in-center">
          <div className="text-6xl mb-4 text-yellow-500">
            {userWon ? "🏆" : "🎮"}
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            {userWon ? "CONGRATULATIONS!" : "GAME OVER"}
          </h2>
          <p className="text-xl text-gray-300 mb-6">
            {userWon
              ? `You've won the game with ${gameStats.remainingPlayers} players remaining!`
              : `You've been eliminated in round ${round} of ${gameStats.rounds}.`}
          </p>

          <div className="bg-black bg-opacity-50 p-4 rounded-lg text-left mb-6">
            <h3 className="text-lg font-bold text-yellow-500 mb-2">
              Game Summary
            </h3>
            <p className="text-gray-300">
              Starting Players: {gameStats.totalPlayers}
            </p>
            <p className="text-gray-300">
              Rounds Completed: {gameStats.roundsCompleted}
            </p>
            <p className="text-gray-300">
              Final Winning Choice: {gameStats.winningChoice}
            </p>
          </div>

          <button
            className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold transition-colors"
            onClick={() => {
              setGameOver(true);
              setRound(1);
              setGameStage("choice");
              setChoice(null);
              setGameStats({
                totalPlayers: 16,
                remainingPlayers: 16,
                rounds: 4,
                roundsCompleted: 0,
                winningChoice: null,
              });
              setPlayerHistory([]);
              setWinners([]);
              navigate("/explore");
            }}
          >
            Back to pools
          </button>
        </div>
      </div>
    );
  };

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
              opacity: coinRotation % 180 < 90 ? "1" : "0.2",
            }}
          >
            {coinRotation % 180 < 90 ? "🪙" : "💰"}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 md:gap-12 justify-center items-center mb-10">
        <div className="relative">
          {choice === "heads" && (
            <div className="absolute -inset-3 bg-yellow-500 opacity-20 blur-xl rounded-full animate-pulse"></div>
          )}
          <button
            onClick={() => handleMakeChoice("heads")}
            className={`w-36 h-36 text-white rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
              choice === "heads"
                ? "border-4 border-yellow-500 bg-gradient-to-br from-yellow-900 to-yellow-950 shadow-glow-gold"
                : "border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-yellow-600"
            }`}
            disabled={!isTimerActive || isCoinFlipping}
          >
            <div className="text-center p-2">
              <div className="text-4xl mb-3">🪙</div>
              <div className="text-xl font-bold">HEADS</div>
              {choice === "heads" && (
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
          {choice === "tails" && (
            <div className="absolute -inset-3 bg-yellow-500 opacity-20 blur-xl rounded-full animate-pulse"></div>
          )}
          <button
            onClick={() => handleMakeChoice("tails")}
            className={`w-36 h-36 rounded-full flex items-center text-white justify-center transition-all transform hover:scale-105 ${
              choice === "tails"
                ? "border-4 border-yellow-500 bg-gradient-to-br from-yellow-900 to-yellow-950 shadow-glow-gold"
                : "border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-yellow-600"
            }`}
            disabled={!isTimerActive || isCoinFlipping}
          >
            <div className="text-center p-2">
              <div className="text-4xl mb-3">💰</div>
              <div className="text-xl font-bold">TAILS</div>
              {choice === "tails" && (
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

      {/* Game Stats - Creates Social Proof */}
      <div className="w-full max-w-4xl px-4 mt-8">
        <div className="flex justify-between text-xs text-gray-500 px-2">
          <div>
            Last winner:{" "}
            <span className="text-yellow-500">
              {playerHistory.length > 0
                ? `${playerHistory[
                    playerHistory.length - 1
                  ].minorityChoice.toUpperCase()} (${
                    playerHistory[playerHistory.length - 1].minorityChoice ===
                    "heads"
                      ? Math.round(
                          (playerHistory[playerHistory.length - 1].headsCount /
                            (playerHistory[playerHistory.length - 1]
                              .headsCount +
                              playerHistory[playerHistory.length - 1]
                                .tailsCount)) *
                            100
                        )
                      : Math.round(
                          (playerHistory[playerHistory.length - 1].tailsCount /
                            (playerHistory[playerHistory.length - 1]
                              .headsCount +
                              playerHistory[playerHistory.length - 1]
                                .tailsCount)) *
                            100
                        )
                  }% chose)`
                : "HEADS (38% chose)"}
            </span>
          </div>
          <div>
            Biggest pot today:{" "}
            <span className="text-yellow-500">1,468 POINTS</span>
          </div>
        </div>
      </div>

      {/* Notification for round results */}
      <RoundNotification />

      {/* Game Over Screen */}
      <GameOverScreen />

      {/* Additional CSS for animations */}
      {/* <style jsx>{`
        @keyframes scale-in-center {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .scale-in-center {
          animation: scale-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        }
        
        @keyframes progress-bar {
          0% { width: 0; }
          100% { width: 100%; }
        }
        
        .animate-progress-bar {
          animation: progress-bar 3s linear forwards;
        }
        
        .shadow-glow-gold {
          box-shadow: 0 0 15px 5px rgba(234, 179, 8, 0.3);
        }
      `}</style> */}
    </div>
  );
};

export default PlayGame;
