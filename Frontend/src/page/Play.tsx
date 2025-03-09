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
  const [coinRotation, setCoinRotation] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const pool = location.state.pools;
  const { address } = useAccount();
  const [gameState, setGameState] = useState({
    isTimerActive: true,
    selectedChoice: null as PlayerChoice | null,
    round: 1,
    hasSubmitted: false,
    isCoinFlipping: false,
    isSubmitting: false,
    isWaitingForOthers: false,
    showClaimInterface: false,
    showWinnerPopup: false,
  });

  const [timer, setTimer] = useState(20);
  const [notification, setNotification] = useState({
    isVisible: false,
    isSuccess: false,
    message: "",
    subMessage: "",
  });
  const [lastCompletedRound, setLastCompletedRound] = useState(0);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);


  type PlayerStatus = [boolean, boolean, boolean, boolean];


  // _____________________________Fetch Player Status____________________________________

  const {
    data: playerStatus,
    refetch: refetchPlayerStatus,
    isLoading: isStatusLoading,
  } = useReadContract<PlayerStatus, string, [bigint, `0x${string}`]>({
    address: CORE_CONTRACT_ADDRESS as `0x${string}`,
    abi: CoinTossABI.abi,
    functionName: "getPlayerStatus",
    args: [BigInt(pool.id), address],
  });

  
  //___________________________Sending Transaction____________________________________
  
    const {
      writeContract,
      data: hash,
      isPending: txPending,
      error
    } = useWriteContract();
  
    //__________________________ Wait for transaction confirmation________________________________________
  
    const {
      isLoading: isConfirming,
      isSuccess: isConfirmed,
      error: receiptError,
    } = useWaitForTransactionReceipt({ hash });
  
  

  

  console.log(playerStatus);
  console.log(pool)

//___________________________Player Status Destructuring____________________________________

  const isParticipant = playerStatus ? playerStatus[0] : false;
  const isEliminated= playerStatus ? playerStatus[1] : false;
  const isAWinner = playerStatus ? playerStatus[2] : false;
  const hasClaimed = playerStatus ? playerStatus[3] : false;


  const coinFlipInterval = useRef<NodeJS.Timeout | null>(null);

  //___________________ Handle timer logic________________________________

  useEffect(() => {
    if (gameState.isTimerActive && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 2000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setGameState((prev) => ({ ...prev, isTimerActive: false }));
      if (isConfirming) {
        showNotification(
          true,
          "Processing...",
          "Your choice has been submitted and is being processed"
        );
      } else if (receiptError) {
        showNotification(
          false,
          "Transaction Failed",
          "Your transaction failed to process. Try Again"
        );
      } else if (isConfirmed) {
        showNotification(
          true,
          "Success!",
          "Your selection has been recorded!"
        );
        setGameState((prev) => ({ ...prev, isWaitingForOthers: true }));
      }
    }
  }, [
    gameState.isTimerActive,
    timer,
    isConfirming,
    isConfirmed,
    receiptError
  ]);

  //__________________________ Redirect Conditions________________________________
  useEffect(() => {
    if (!pool) {
      navigate("/explore");
      return;
    }
    if (hasClaimed) {
      navigate("/explore");
      return;
    }
    const poolStatus = pool.status;
    if (poolStatus === 2) {
      refetchPlayerStatus().then((result) => {
        if (result.data) {
          const [ isWinner, hasClaimed] = result.data;
          if (isWinner && !hasClaimed) {
            setShowClaimInterface(true);
          } else {
            
            navigate("/explore");
          }
        } else {
          navigate("/explore");
        }
      });
    }
    //  else {
    //   navigate("/explore");
    // }
  }, [pool, hasClaimed, navigate, refetchPlayerStatus]);




  //____________________________ Handle player elimination_____________________________________________

  useEffect(() => {
    if (playerStatus) {
     
      // Update elimination status
      if (isParticipant && isEliminated) {
        setGameState((prev) => ({ ...prev, isEliminated: true, isTimerActive: false }));
        showNotification(
          false,
          "Eliminated",
          "You have been eliminated from the pool."
        );
        setTimeout(() => {
          navigate("/explore");
        }, 4000);
      }

      // Update winner status

      if (isParticipant && isAWinner) {
        setIsWinner(true);
        setShowWinnerPopup(true);
      }

      
      if (isEliminated && gameState.hasSubmitted && isAWinner) {
        navigate("/explore");
      }

      // Handle pool status changes
      if (pool?.status === 2 && isParticipant && !showWinnerPopup) {
        setShowWinnerPopup(true);
      }
    }
  }, [playerStatus,showWinnerPopup, pool, navigate]);


  //____________________________ Handle player winning the game_______________________________________
  useEffect(() => {
    if (isAWinner && pool?.status === 2) {
      setIsWinner(true);
      setShowWinnerPopup(true);
    }
  }, [isAWinner, pool]);

  // Add a polling mechanism to ensure we get updates even if events fail
  useEffect(() => {
    if (gameState.isWaitingForOthers) {
      const interval = setInterval(() => {
        refetchPlayerStatus();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [gameState.isWaitingForOthers, refetchPlayerStatus]);

  // Handle player choice submission

  const handleMakeChoice = async (selected: PlayerChoice) => {
    if ( timer <= 2 || isEliminated || gameState.hasSubmitted) return;

    setGameState((prev) => ({ ...prev, selectedChoice: selected, hasSubmitted: true, isCoinFlipping: true }));
    startCoinAnimation()
    await handleSubmit(selected);
  };


  // ____________submitting the choice_____________________


  const handleSubmit = async (selected: PlayerChoice) => {
    if (!selected) {
      showNotification(false, "Error", "Please select HEADS or TAILS");
      return;
    }
    try {
      setGameState((prev) => ({ ...prev, isSubmitting: true }));
       writeContract({
        address: CORE_CONTRACT_ADDRESS as `0x${string}`,
        abi: CoinTossABI.abi,
        functionName: "makeSelection",
        args: [BigInt(pool.id), selected],
      });
    } catch (err: any) {
      const errorMessage = err.message || "Transaction failed";
      showNotification(false, "Transaction Error!!!", errorMessage);
      setGameState((prev) => ({
        ...prev,
        isSubmitting: false,
        hasSubmitted: false, 
        selectedChoice: null, 
      }));
      stopCoinAnimation();
    }
  };


  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      setGameState((prev) => ({
        ...prev,
        isSubmitting: false,
        isWaitingForOthers: true,
      }));
      showNotification(true, "Success!", "Your selection has been recorded!");
    }
  
    if (receiptError) {
      setGameState((prev) => ({
        ...prev,
        isSubmitting: false,
        hasSubmitted: false, 
        selectedChoice: null, 
      }));
      showNotification(false, "Transaction Failed", "Your transaction failed to process!!.");
    }
  }, [isConfirmed, receiptError]);
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
       
          const args = log.args || {};
         
          const eventPoolId =
            "poolId" in args
              ? Number(args.poolId)
              : "0" in args
              ? Number(args[0])
              : undefined;
          
          const roundNumber ="round" in args ? Number(args.round) : "1" in args ? Number(args[1]) : undefined;
          //Get winning selection
          const winningSelection ="winningSelection" in args? Number(args.winningSelection) : "2" in args ? Number(args[2]): undefined;
          // Skip if we couldn't extract necessary data
          if (eventPoolId === undefined ||roundNumber === undefined ||winningSelection === undefined
          ) {
            continue;
          }
          
          if (eventPoolId === pool.id && roundNumber > lastCompletedRound) {
            console.log("New round completion detected for current pool!");
            setLastCompletedRound(roundNumber);
            // Stop animations immediately
            stopCoinAnimation();
            // Update UI state to indicate processing
            setGameState((prev) => ({ ...prev, isWaitingForOthers: false }));
            // Determine if user survived based on their choice
            const userChoice = gameState.selectedChoice;
            const userSurvived = userChoice === winningSelection;
            // Update eliminated status immediately
            if (!userSurvived) {
              setGameState((prev) => ({ ...prev, isEliminated: true }));
            }
            // Force refresh player status from contract
            refetchPlayerStatus().then(() => {
              console.log("Player status refreshed after round completion");
            });
            
            showNotification(userSurvived,
              `Round ${roundNumber} Completed!`,
              userSurvived
                ? "You advanced to the next round!"
                : "You were eliminated!"
            );
            // Handle game state updates
            if (userSurvived) {
              setTimeout(() => {
                setTimer(20);
                setGameState((prev) => ({ ...prev, isTimerActive: true,  hasSubmitted: false,selectedChoice: null,round: roundNumber + 1}));
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
            // Immediately check if the user is a winner
            refetchPlayerStatus().then((result) => {
              if (result.data && result.data[2]) {
                // index 2 is isWinner
                setShowWinnerPopup(true);
                // Do NOT redirect winners - they need to claim their prize

                // Update game state to reflect completion
                setGameState((prev) => ({ ...prev, isTimerActive: false,isWaitingForOthers: false}));
                setTimer(0);
              
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
    setGameState((prev) => ({ ...prev, isCoinFlipping: true }));
    coinFlipInterval.current = setInterval(() => {
      setCoinRotation((prev) => (prev + 36) % 360);
    }, 100);
  };

  const stopCoinAnimation = () => {
    if (coinFlipInterval.current) {
      clearInterval(coinFlipInterval.current);
      coinFlipInterval.current = null;
    }
    setGameState((prev) => ({
      ...prev,
      isCoinFlipping: false,
      selectedChoice: null, 
    }));
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
    }, 5000);
  };

  // Handle player winning the game
  useEffect(() => {
    if (isAWinner) {
      setIsWinner(true);
      setShowWinnerPopup(true);
    }
  }, [isAWinner]);


    // Handle token claim
    const handleClaimPrize = async () => {
      try {
        setGameState((prev) => ({ ...prev, isSubmitting: true }));
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
        setGameState((prev) => ({ ...prev, isSubmitting: false }));
      }
    };


  return (
    <div className="h-screen bg-gray-950 flex flex-col items-center justify-center">
      {/* Top Game Status Bar */}
      <div className="w-full max-w-4xl px-2">
        <div className="flex justify-between items-center bg-black bg-opacity-70 px-6 py-3 rounded-lg border border-gray-800 mb-8">
          <div className="flex items-center">
            <div className="bg-yellow-600 w-10 h-10 rounded-full flex items-center justify-center border border-yellow-500 mr-3">
              <span className="text-white font-bold">{gameState.round}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-gray-400 text-xs">ROUND</div>
              <div className="text-2xl font-bold text-yellow-500">{gameState.round}</div>
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
      {gameState.isCoinFlipping && (
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
          {gameState.selectedChoice === PlayerChoice.HEADS && (
            <div className="absolute -inset-3 bg-yellow-500 opacity-20 blur-xl rounded-full animate-pulse"></div>
          )}
          <button
            onClick={() => handleMakeChoice(PlayerChoice.HEADS)}
            className={`w-36 h-36 text-white rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
              gameState.selectedChoice === PlayerChoice.HEADS
                ? "border-4 border-yellow-500 bg-gradient-to-br from-yellow-900 to-yellow-950 shadow-glow-gold"
                : "border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-yellow-600"
            }`}
            disabled={!gameState.isTimerActive || gameState.isCoinFlipping || gameState.isSubmitting}
          >
            <div className="text-center p-2">
              <div className="text-4xl mb-3">🪙</div>
              <div className="text-xl font-bold">HEADS</div>
              {gameState.selectedChoice === PlayerChoice.HEADS && (
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
          {gameState.selectedChoice === PlayerChoice.TAILS && (
            <div className="absolute -inset-3 bg-yellow-500 opacity-20 blur-xl rounded-full animate-pulse"></div>
          )}
          <button
            onClick={() => handleMakeChoice(PlayerChoice.TAILS)}
            className={`w-36 h-36 rounded-full flex items-center text-white justify-center transition-all transform hover:scale-105 ${
              gameState.selectedChoice === PlayerChoice.TAILS
                ? "border-4 border-yellow-500 bg-gradient-to-br from-yellow-900 to-yellow-950 shadow-glow-gold"
                : "border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-yellow-600"
            }`}
            disabled={!gameState.isTimerActive || gameState.isCoinFlipping || gameState.isSubmitting}
          >
            <div className="text-center p-2">
              <div className="text-4xl mb-3">💰</div>
              <div className="text-xl font-bold">TAILS</div>
              {gameState.selectedChoice === PlayerChoice.TAILS && (
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

      {gameState.isWaitingForOthers && (
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
              disabled={gameState.isSubmitting}
              className="mt-6 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all"
            >
              {gameState.isSubmitting ? "Claiming..." : "Claim Prize"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayGame;
