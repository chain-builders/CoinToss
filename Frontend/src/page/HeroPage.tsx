import { useState, useEffect, useRef } from "react";
import Footer from "../components/Footer";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatTime } from "../utils/utilFunction";
const HeroPage = () => {
  const [time, setTimer] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(222);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 0) {
          return 223; // Restart the timer at 3:43
        }
        return prevTime - 1; // Decrement the timer by 1 second
      });
    }, 1000); // Update every second
  };

  useEffect(() => {
    startTimer();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <>
      <section className="relative md:h-[35rem] flex items-center overflow-hidden">
        {/* Rich Dark Background with Gold Accents */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black"></div>

          <div className="absolute inset-0 opacity-10 bg-pattern-dark"></div>

          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>

          <div className="absolute inset-0">
            <div className="golden-particles"></div>
          </div>
        </div>

        <div className="absolute inset-0 z-1 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-yellow-500 blur-3xl opacity-10 animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full bg-red-600 blur-3xl opacity-5 animate-pulse-slow"></div>
        </div>

        <div className="container mx-auto z-10 flex flex-col md:flex-row items-center justify-between px-6">
          {/* Left Column - Compelling Text Content */}
          <div className="md:w-5/12 space-y-6 text-center md:text-left">
            <h2 className="text-3xl md:text-6xl font-bold text-white mb-2 flex">
              <span className="block">Beat The</span>
              <span className="text-yellow-500 ml-2">Majority</span>
            </h2>

            <p className="text-xl text-gray-300">
              A strategy game where you win by choosing what most people don't.
              <span className="font-bold text-red-500">
                {" "}
                If 70% pick "Heads", the 30% who picked "Tails" win all the
                rewards
              </span>
              . The fewer people who make your choice, the bigger your prize.
            </p>

            {/* Win Metrics - Creating FOMO */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="bg-black bg-opacity-70 px-4 py-2 rounded-lg border border-gray-800">
                <div className="text-2xl font-bold text-yellow-500 animate-pulse-slow">
                  2,000 Core
                </div>
                <div className="text-xs text-gray-400">WON IN LAST POOL </div>
              </div>
              <div className="bg-black bg-opacity-70 px-4 py-2 rounded-lg border border-gray-800">
                <div className="text-2xl font-bold text-yellow-500">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-xs text-gray-400">NEXT POOL STARTS IN</div>
              </div>
            </div>

            <div className="pt-6 w-40 ">
              {/* <div className="bg-gradient-to-r  from-yellow-600 to-red-600 px-4 py-2 rounded-lg border border-yellow-600 shadow-sm hover:shadow-glow-gold transition-all duration-300"> */}
                <ConnectButton.Custom>
                  {({
                    account,
                    openAccountModal,
                    openConnectModal,
                    mounted,
                  }) => {
                    const connected = mounted && account;

                    return (
                      <div>
                        {connected ? (
                          <button
                            onClick={openAccountModal}
                            className="flex items-center"
                          >
                            <span className="text-white font-bold pl-[20px] bg-gradient-to-r  from-yellow-600 to-red-600 px-4 py-2 rounded-lg border border-yellow-600 shadow-sm hover:shadow-glow-gold transition-all duration-300">
                              {account.displayName}
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={openConnectModal}
                            className="flex items-center"
                          >
                            <span className="text-white font-bold pl-[15px] bg-gradient-to-r  from-yellow-600 to-red-600 px-4 py-2 rounded-lg border border-yellow-600 shadow-sm hover:shadow-glow-gold transition-all duration-300">
                              PLAY NOW
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              {/* </div> */}
            </div>
          </div>

          {/* Right Column - Casino-Style Game Visualization */}
          <div className="mt-12 md:mt-0 md:w-6/12 ">
            <div className="relative  ">
              {/* Luxury Glow Effect */}
              <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-500 opacity-20 blur-xl animate-pulse-slow"></div>

              {/* Game Visualization */}
              <div className="relative bg-gray-900 bg-opacity-95 p-6 rounded-xl border border-gray-800 shadow-xl">
                {/* VIP-Style Header */}
                <div className="text-center mb-4">
                  <span className="inline-block px-4 py-1 bg-black rounded-full border border-yellow-600 text-yellow-500 text-sm font-bold">
                    VIP MINORITY GAME
                  </span>
                </div>

                {/* Animated Game Concept */}
                <div className="flex items-center justify-center py-6 relative">
                  {/* Selection Choices */}
                  <div className="flex gap-6 items-center">
                    {/* Winning Choice (Minority) */}
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br  from-green-600 to-green-800 flex items-center justify-center border-2 border-green-400 shadow-glow-red z-20 animate-pulse">
                        <span className="text-white font-bold text-xl">
                          Tail
                        </span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-black border border-yellow-500 flex items-center justify-center z-30">
                        <span className="text-yellow-500 font-bold text-xs">
                          30%
                        </span>
                      </div>
                      {/* Winner Badge */}
                      <div className="absolute -right-4 -bottom-4 bg-black px-3 py-1 rounded-full border border-yellow-500 z-30 animate-bounce-small">
                        <span className="text-yellow-500 font-bold text-xs">
                          WINNER!
                        </span>
                      </div>
                    </div>

                    {/* Losing Choice (Majority) */}
                    <div className="relative opacity-60">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br  from-red-600 to-red-700 flex items-center justify-center border-2 border-gray-700">
                        <span className="text-white font-bold text-xl">
                          Head
                        </span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-black border border-gray-500 flex items-center justify-center">
                        <span className="text-gray-300 font-bold text-xs">
                          70%
                        </span>
                      </div>
                      <div className="absolute -right-4 -bottom-4 bg-black px-3 py-1 rounded-full border border-yellow-500 z-30 animate-bounce-small">
                        <span className="text-yellow-500 font-bold text-xs">
                          LOSERS!
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Token Rewards Animation - Casino Jackpot Style */}
                <div className="mt-6 text-center">
                  <div className="p-2 bg-black rounded-lg border border-yellow-600">
                    <div className="text-yellow-500 font-bold text-sm mb-1">
                      YOUR POTENTIAL WINNINGS
                    </div>
                    <div className="text-3xl font-bold text-yellow-500 animate-pulse">
                      +1,420 <span className="text-xs align-top">POINTS</span>
                    </div>
                  </div>
                </div>

                {/* Last Winners Ticker - Creates FOMO */}
                <div className="mt-6 bg-black bg-opacity-50 rounded-lg p-2 border-t border-b border-gray-800">
                  <div className="overflow-hidden whitespace-nowrap">
                    <div className="animate-ticker inline-block">
                      <span className="text-gray-400 text-xs">
                        Last Winners:{" "}
                      </span>
                      <span className="text-yellow-500 text-xs font-bold">
                        Player728 (2,400)
                      </span>
                      <span className="text-gray-500 text-xs mx-2">•</span>
                      <span className="text-yellow-500 text-xs font-bold">
                        VIPGamer (5,600)
                      </span>
                      <span className="text-gray-500 text-xs mx-2">•</span>
                      <span className="text-yellow-500 text-xs font-bold">
                        Crypto_King (3,200)
                      </span>
                      <span className="text-gray-500 text-xs mx-2">•</span>
                      <span className="text-yellow-500 text-xs font-bold">
                        Player728 (2,400)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};
export default HeroPage;
