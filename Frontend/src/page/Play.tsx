import { useState } from "react";

interface GameStats{
    totalPlayers: number;
    remainingPlayers: number;
    rounds: number;
    roundsCompleted: number;
    winningChoice: string | null;
  };


interface PlayerHistoryEntry{
    round: number;
    players: string[]; 
    headsCount: number;
    tailsCount: number;
    minorityChoice: string; 
    survivors: number;
  };
const PlayGame = () => {

  const [activeTab, setActiveTab] = useState("explore");
  const [selectedPool, setSelectedPool] = useState(null);
  const [showGameView, setShowGameView] = useState(false);
  const [gameStage, setGameStage] = useState("choice");
  const [choice, setChoice] = useState(null);
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState(42);
  const [winners, setWinners] = useState([]);
  const [playerHistory, setPlayerHistory] = useState<PlayerHistoryEntry[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalPlayers: 16,
    remainingPlayers: 16,
    rounds: 4,
    roundsCompleted: 0,
    winningChoice: null,
  });

  const handleMakeChoice = (selected) => {
    setChoice(selected);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const generateMockPlayers = (total, choice) => {
    const players = [];
    for (let i = 1; i <= total; i++) {
      const playerChoice = Math.random() > 0.5 ? "heads" : "tails";
      players.push({
        id: i,
        address: `0x${Math.random()
          .toString(16)
          .substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
        choice: i === 1 ? choice : playerChoice,
        survived: false,
      });
    }
    return players;
  };

  const handleRoundEnd = () => {
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

    setTimeout(() => {
      if (survivors.length <= 1 || round >= gameStats.rounds) {
        setWinners(survivors);
        setGameStage("gameOver");
      } else {
        setGameStage("roundSummary");
      }
    }, 3000);
  };

  return (
    <div className="h-screen">
      <div className="text-center my-8 ">
        <div className="inline-block px-4 py-1 bg-purple-900 rounded-full text-purple-300 mb-2">
          Round {round} of {gameStats.rounds}
        </div>
        <h1 className="text-2xl font-bold text-white mt-2">Make Your Choice</h1>
        <p className="text-gray-400 mt-2">
          Choose wisely! The majority will be eliminated.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center items-center my-10">
        <button
          onClick={() => handleMakeChoice("heads")}
          className={`w-28 h-28 text-white rounded-full flex items-center justify-center border-8 transition-all ${
            choice === "heads"
              ? "border-green-500 bg-green-900 bg-opacity-20"
              : "border-gray-700 hover:border-gray-500 bg-gray-800"
          }`}
          disabled={choice !== null}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">🪙</div>
            <div className="text-base font-bold">HEADS</div>
            {choice === "heads" && (
              <div className="mt-2 text-green-400 text-xs">Selected!</div>
            )}
          </div>
        </button>

        <div className="text-2xl font-bold text-gray-500">OR</div>

        <button
          onClick={() => handleMakeChoice("tails")}
          className={`w-28 h-28 rounded-full flex items-center text-white justify-center border-8 transition-all ${
            choice === "tails"
              ? "border-green-500 bg-green-900 bg-opacity-20"
              : "border-gray-700 hover:border-gray-500 bg-gray-800"
          }`}
          disabled={choice !== null}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-base  font-bold">TAILS</div>
            {choice === "tails" && (
              <div className="mt-2 text-green-400">Selected!</div>
            )}
          </div>
        </button>
      </div>

      <div className="max-w-md mx-auto bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Time remaining:</span>
          <span
            className={`font-bold ${
              timer < 10 ? "text-red-400" : "text-yellow-400"
            }`}
          >
            {formatTime(timer)}
          </span>
        </div>

        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${timer < 10 ? "bg-red-500" : "bg-yellow-500"}`}
            style={{ width: `${(timer / 42) * 100}%` }}
          ></div>
        </div>

        <div className="mt-4 text-sm text-gray-400 text-center">
          <p>
            {gameStats.remainingPlayers} players in this round. Only the
            minority will advance!
          </p>
        </div>
      </div>

      {choice && (
        <div className="mt-6 text-center">
          <button
            onClick={handleRoundEnd}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full font-medium transition-all"
          >
            Confirm Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default PlayGame;
