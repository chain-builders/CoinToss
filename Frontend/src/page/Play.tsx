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

const PlayGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pool = location.state.pools;
  const { address } = useAccount();

  const [isTimerActive, setIsTimerActive] = useState(true);
  const [selectedChoice, setSelectedChoice] = useState<PlayerChoice | null>(
    null
  );
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState(40);
  const [isEliminated, setIsEliminated] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCoinFlipping, setIsCoinFlipping] = useState(false);
  const [coinRotation, setCoinRotation] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    isSuccess: false,
    message: "",
    subMessage: "",
  });

  const [lastCompletedRound, setLastCompletedRound] = useState(0);
  const [isWaitingForOthers, setIsWaitingForOthers] = useState(false);
  const [showClaimInterface, setShowClaimInterface] = useState(false);

  type PlayerStatus = [boolean, boolean, boolean, boolean];

  // Fetch player status

  const [isWinner, setIsWinner] = useState(false);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);

  const {
    data: playerStatus,
    refetch: refetchPlayerStatus,
    isLoading: isStatusLoading,
  } = useReadContract<PlayerStatus, string, [bigint, `0x${string}`]>({
    address: CORE_CONTRACT_ADDRESS as `0x${string}`,

    // @ts-ignore
    abi: CoinTossABI.abi,
    functionName: "getPlayerStatus",
    args: [BigInt(pool.id), address],
  });

  console.log(playerStatus);

  // @ts-ignore
  const isParticipant = playerStatus ? playerStatus[0] : false;

  // @ts-ignore
  const isEliminatedStatus = playerStatus ? playerStatus[1] : false;

  // @ts-ignore
  const isWinnerStatus = playerStatus ? playerStatus[2] : false;

  // @ts-ignore
  const hasClaimed = playerStatus ? playerStatus[3] : false;

  // Send transaction
  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  // Wait for transaction confirmation
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const coinFlipInterval = useRef<NodeJS.Timeout | null>(null);

  //___________________ Handle timer logic________________________________
  useEffect(() => {
    if (isTimerActive && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !isWaitingForOthers) {
      setIsTimerActive(false);

      if (isWritePending || isConfirming) {
        showNotification(
          true,
          "Processing...",
          "Your choice has been submitted and is being processed"
        );
      } else if (writeError || receiptError) {
        showNotification(
          false,
          "Transaction Failed",
          "Your transaction failed to process. Try Again"
        );
        // setTimeout(() => {
        //   navigate("/explore");
        // }, 3000);
      } else if (isConfirmed) {
        setIsWaitingForOthers(true);
      }
    }
  }, [
    isTimerActive,
    timer,
    isWaitingForOthers,
    isWritePending,
    isConfirming,
    writeError,
    receiptError,
    isConfirmed,
  ]);

  useEffect(() => {
    // Check if we should redirect based on different conditions
    if (!pool) {
      navigate("/explore"); // No pool data, redirect
    } else if (hasClaimed) {
      navigate("/explore"); // Already claimed, redirect
    } else if (typeof pool.status === "number" && pool.status === 2) {
      // Pool is CLOSED (status 2)
      // Check if player is a winner before redirecting
      refetchPlayerStatus().then((result) => {
        // @ts-ignore
        if (!(result.data && result.data[2])) {
          // Not a winner, redirect
          navigate("/explore");
        }
        // If winner, let them stay to claim prize
      });
    } else if (
      (typeof pool.status === "number" && pool.status !== 2) ||
      (typeof pool.status === "string" && pool.status !== "ACTIVE")
    ) {
      // Pool is not active and not closed (other status), redirect
      navigate("/explore");
    }
    if (typeof pool?.status === "number" && pool.status === 2) {
      refetchPlayerStatus().then((result) => {
        // @ts-ignore
        if (result.data && result.data[2] && !result.data[3]) {
          // Is winner and hasn't claimed
          setShowClaimInterface(true);

          // @ts-ignore
        } else if (!(result.data && result.data[2])) {
          navigate("/explore");
        }
      });
    }
  }, [pool, hasClaimed, navigate, refetchPlayerStatus]);

  // Handle player elimination
  useEffect(() => {
    if (playerStatus) {
      // @ts-ignore
      const isPlayerEliminated = playerStatus[1];

      // @ts-ignore
      const isPlayerWinner = playerStatus[2];

      // @ts-ignore
      const hasPlayerClaimed = playerStatus[3];

      // Update elimination status
      if (isPlayerEliminated && !isEliminated) {
        setIsEliminated(true);
        setIsTimerActive(false);
        showNotification(
          false,
          "Eliminated",
          "You have been eliminated from the pool."
        );
        setTimeout(() => {
          navigate("/explore");
        }, 3000);
      }

      // Update winner status
      if (isPlayerWinner && !isWinner) {
        setIsWinner(true);
        setShowWinnerPopup(true);
      }

      // Handle claimed status
      if (hasPlayerClaimed && isPlayerWinner) {
        navigate("/explore");
      }

      // Handle pool status changes
      if (pool?.status === 2 && isPlayerWinner && !showWinnerPopup) {
        setShowWinnerPopup(true);
      }
    }
  }, [playerStatus, isEliminated, isWinner, showWinnerPopup, pool, navigate]);

  // Handle player winning the game
  useEffect(() => {
    if (isWinnerStatus && pool?.status === 2) {
      setIsWinner(true);
      setShowWinnerPopup(true);
    }
  }, [isWinnerStatus, pool]);

  // Add a polling mechanism to ensure we get updates even if events fail
  useEffect(() => {
    if (isWaitingForOthers) {
      const interval = setInterval(() => {
        refetchPlayerStatus();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isWaitingForOthers, refetchPlayerStatus]);

  // Handle player choice submission
  const handleMakeChoice = async (selected: PlayerChoice) => {
    if (!isTimerActive || timer <= 2 || isEliminated || hasSubmitted) return;

    setSelectedChoice(selected);
    setHasSubmitted(true);
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
      writeContract({
        address: CORE_CONTRACT_ADDRESS as `0x${string}`,
        abi: CoinTossABI.abi,
        functionName: "makeSelection",
        args: [BigInt(pool.id), selected],
      });
    } catch (err: any) {
      const errorMessage = err.message || "Transaction failed";
      showNotification(false, "Transaction Error", errorMessage);
      setIsSubmitting(false);
      stopCoinAnimation();
    }
  };

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      setIsSubmitting(false);
      setSelectedChoice(null);
      showNotification(true, "Success!", "Your selection has been recorded!");
      setIsWaitingForOthers(true);
      setIsTimerActive(false);
      setTimer(0);
    }

    if (writeError || receiptError) {
      setIsSubmitting(false);
      showNotification(
        false,
        "Transaction Failed",
        "Your transaction failed to process."
      );
    }
  }, [isConfirmed, writeError, receiptError]);

  // Handle RoundCompleted event

  useWatchContractEvent({
    address: CORE_CONTRACT_ADDRESS as `0x${string}`,
    abi: CoinTossABI.abi,
    eventName: "RoundCompleted",
    onLogs: (logs) => {
      console.log("RoundCompleted logs received:", logs);

      for (const log of logs) {
        try {
          console.log("Processing log:", log);

          // Extract event arguments, handling both named and positional formats
          // @ts-ignore
          const args = log.args || {};

          // Get poolId - try both named and indexed access
          const eventPoolId =
            "poolId" in args
              ? Number(args.poolId)
              : "0" in args
              ? Number(args[0])
              : undefined;

          // Get round number
          const roundNumber =
            "round" in args
              ? Number(args.round)
              : "1" in args
              ? Number(args[1])
              : undefined;

          // Get winning selection
          const winningSelection =
            "winningSelection" in args
              ? Number(args.winningSelection)
              : "2" in args
              ? Number(args[2])
              : undefined;

          console.log("Extracted data:", {
            eventPoolId,
            roundNumber,
            winningSelection,
          });

          // Skip if we couldn't extract necessary data
          if (
            eventPoolId === undefined ||
            roundNumber === undefined ||
            winningSelection === undefined
          ) {
            console.error("Could not extract complete data from event", log);
            continue;
          }

          // Check if this is a new round completion (avoid processing the same round multiple times)
          if (eventPoolId === pool.id && roundNumber > lastCompletedRound) {
            console.log("New round completion detected for current pool!");
            setLastCompletedRound(roundNumber);

            // Stop animations immediately
            stopCoinAnimation();

            // Update UI state to indicate processing
            setIsWaitingForOthers(false);

            // Determine if user survived based on their choice
            const userChoice = selectedChoice;
            const userSurvived = userChoice === winningSelection;

            console.log("Round result:", {
              userChoice,
              winningSelection,
              userSurvived,
            });

            // Update eliminated status immediately
            if (!userSurvived) {
              setIsEliminated(true);
            }

            // Force refresh player status from contract
            refetchPlayerStatus().then(() => {
              console.log("Player status refreshed after round completion");
            });

            // Show appropriate notification
            showNotification(
              userSurvived,
              `Round ${roundNumber} Completed!`,
              userSurvived
                ? "You advanced to the next round!"
                : "You were eliminated!"
            );

            // Handle game state updates
            if (userSurvived) {
              // Set timeout to allow notification to be seen
              setTimeout(() => {
                setRound(roundNumber + 1);
                setTimer(20);
                setIsTimerActive(true);
                setHasSubmitted(false);
                setSelectedChoice(null);
              }, 3000);
            }
          }
        } catch (error) {
          console.error("Error processing event log:", error);
          console.error(
            "Error details:",
            error instanceof Error ? error.message : String(error)
          );
        }
      }
    },
  });

  // Handle PoolCompleted event
  useWatchContractEvent({
    address: CORE_CONTRACT_ADDRESS as `0x${string}`,
    abi: CoinTossABI.abi,
    eventName: "PoolCompleted",
    onLogs: (logs) => {
      console.log("PoolCompleted logs received:", logs);

      for (const log of logs) {
        try {
          // @ts-ignore
          const args = log.args || {};
          const eventPoolId =
            "poolId" in args
              ? Number(args.poolId)
              : "0" in args
              ? Number(args[0])
              : undefined;

          if (eventPoolId === pool.id) {
            console.log("Pool completed!");

            // Immediately check if the user is a winner
            refetchPlayerStatus().then((result) => {
              // @ts-ignore
              if (result.data && result.data[2]) {
                // index 2 is isWinner
                setIsWinner(true);
                setShowWinnerPopup(true);
                // Do NOT redirect winners - they need to claim their prize

                // Update game state to reflect completion
                setIsTimerActive(false);
                setTimer(0);
                setIsWaitingForOthers(false);

                // Show a notification that the game is complete and they won
                showNotification(
                  true,
                  "You Won!",
                  "The pool has ended and you are a winner!"
                );
              } else {
                // User didn't win - redirect after notification
                showNotification(
                  false,
                  "Game Over",
                  "The pool has ended. Better luck next time!"
                );
                setTimeout(() => {
                  navigate("/explore");
                }, 5000);
              }
            });
          }
        } catch (error) {
          console.error("Error processing PoolCompleted event:", error);
          console.error(
            "Error details:",
            error instanceof Error ? error.message : String(error)
          );

          // Show a generic notification in case of error
          showNotification(
            false,
            "Error",
            "An error occurred while processing the game result"
          );
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
  const showNotification = (
    isSuccess: boolean,
    message: string,
    subMessage: string
  ) => {
    setNotification({ isVisible: true, isSuccess, message, subMessage });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, isVisible: false }));
      if (!isSuccess) {
        navigate("/explore");
      }
    }, 3000);
  };

  // Handle player winning the game
  useEffect(() => {
    if (isWinnerStatus) {
      setIsWinner(true);
      setShowWinnerPopup(true);
    }
  }, [isWinnerStatus]);

  // Handle token claim
  const handleClaimPrize = async () => {
    try {
      setIsSubmitting(true);
      writeContract({
        address: CORE_CONTRACT_ADDRESS as `0x${string}`,
        abi: CoinTossABI.abi,
        functionName: "claimPrize",
        args: [BigInt(pool.id)],
      });
      showNotification(true, "Success!", "Your prize has been claimed!");
      setShowWinnerPopup(false);
      navigate("/explore");
    } catch (err: any) {
      const errorMessage = err.message || "Transaction failed";
      showNotification(false, "Transaction Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showClaimInterface) {
    return (
      <div className="h-screen bg-gray-950 flex flex-col items-center justify-center">
        <div className="p-8 rounded-xl border-4 border-green-500 bg-green-900 bg-opacity-90 text-center max-w-md">
          <div className="text-6xl mb-4 text-green-400">🏆</div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Congratulations Winner!
          </h2>
          <p className="text-xl text-green-300">
            This pool has ended and you are a winner! Claim your prize now.
          </p>
          <button
            onClick={handleClaimPrize}
            disabled={isSubmitting}
            className="mt-6 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all"
          >
            {isSubmitting ? "Claiming..." : "Claim Prize"}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="h-screen bg-gray-950 flex flex-col items-center justify-center">
      {/* Top Game Status Bar */}
      <div className="w-full max-w-4xl px-2">
        <div className="flex justify-between items-center bg-black bg-opacity-70 px-6 py-3 rounded-lg border border-gray-800 mb-8">
          <div className="flex items-center">
            <div className="bg-yellow-600 w-10 h-10 rounded-full flex items-center justify-center border border-yellow-500 mr-3">
              <span className="text-white font-bold">{round}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-gray-400 text-xs">ROUND</div>
              <div className="text-2xl font-bold text-yellow-500">{round}</div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-gray-400">REMAINING PLAYERS</div>
            <div className="text-2xl font-bold text-yellow-500">
              {pool.currentParticipants}
            </div>
          </div>

          <div className="text-right">
            <div className="flex flex-row items-center">
              <span className="text-xs hidden md:flex flex-row mr-2 text-gray-400">
                POTENTIAL
              </span>
              <span className="text-xs text-gray-400"> REWARD</span>
            </div>

            <div className="text-2xl font-bold text-yellow-500 animate-pulse-slow">
              +120 <span className="text-xs">Points</span>
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
              style={{ width: `${(timer / 20) * 100}%` }}
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

      {isWaitingForOthers && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
          <div className="text-yellow-500 text-lg font-bold">
            Waiting for other players to make their selections...
          </div>
        </div>
      )}

      {/* Winner Pop-up */}
      {showWinnerPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
          <div className="p-8 rounded-xl border-4 border-green-500 bg-green-900 bg-opacity-90 text-center max-w-md transform scale-in-center">
            <div className="text-6xl mb-4 text-green-400">🏆</div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Congratulations!
            </h2>
            <p className="text-xl text-green-300">
              You are the winner of this pool! Claim your prize now.
            </p>
            <button
              onClick={handleClaimPrize}
              disabled={isSubmitting}
              className="mt-6 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all"
            >
              {isSubmitting ? "Claiming..." : "Claim Prize"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayGame;
