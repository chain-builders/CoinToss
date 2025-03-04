const HeroPage = () => {
  return (
    <>
      {/* <section className="relative h-[35rem] flex items-center overflow-hidden">
      
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black"></div>
          <div className="absolute inset-0 opacity-20">
           
            <div className="absolute inset-0 bg-grid-pattern animate-grid"></div>
          </div>
         
          <div className="absolute inset-0 opacity-30 bg-gradient-to-tr from-purple-900 via-black to-pink-900"></div>
        </div>

       
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-1">
          <div className="absolute top-20 left-10 w-16 h-16 rounded-lg bg-pink-500 opacity-20 animate-float"></div>
          <div className="absolute bottom-40 right-20 w-24 h-24 rounded-full bg-purple-500 opacity-10 animate-float-delay"></div>
          <div className="absolute top-1/2 right-1/4 w-12 h-12 rounded-lg bg-blue-500 opacity-20 animate-pulse"></div>
        </div>

       
        <div className="container mx-auto z-10 flex flex-col md:flex-row items-center justify-between px-6">
         
          <div className="md:w-5/12 space-y-6 text-center md:text-left">
            <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              Flip The Odds
            </h2>

            <p className="text-xl text-purple-100">
              A web3 game where the{" "}
              <span className="font-bold text-pink-400">minority wins</span>.
              Choose wisely, stand apart.
            </p>

           
            <div className="mt-2 inline-block">
              <div className="px-4 py-2 rounded-lg border border-purple-500 bg-black bg-opacity-50 text-lg">
                <span className="text-purple-100">
                  The <span className="text-pink-400 font-bold">fewer</span>{" "}
                  players who choose your option, the{" "}
                  <span className="text-pink-400 font-bold">more</span> you win
                </span>
              </div>
            </div>

            <div className="pt-4">
              <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-lg font-medium text-lg hover:shadow-glow transition-all duration-300">
                Play Now
              </button>
            </div>
          </div>

         
          <div className="mt-12 md:mt-0 md:w-6/12">
            <div className="relative">
            
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 opacity-20 blur-xl animate-pulse-slow"></div>

            
              <div className="relative bg-black bg-opacity-60 p-6 rounded-xl border border-purple-900">
               
                <div className="flex items-center justify-center py-8">
                  <div className="relative">
                    
                    <div className="absolute -left-6 top-4 w-20 h-20 rounded-full bg-pink-500 flex items-center justify-center z-20 animate-float-small">
                      <span className="text-white font-bold">30%</span>
                    </div>

                   
                    <div className="w-40 h-40 rounded-full bg-purple-800 bg-opacity-50 border-2 border-purple-600 flex items-center justify-center animate-pulse-slow">
                      <span className="text-white text-opacity-70 font-bold">
                        70%
                      </span>
                    </div>

                    
                    <div className="absolute -right-4 -bottom-4 bg-black px-3 py-1 rounded-full border border-pink-500 animate-bounce-small">
                      <span className="text-pink-400 font-bold text-sm">
                        WINNER!
                      </span>
                    </div>
                  </div>
                </div>

              
                <div className="mt-4 text-center">
                  <div className="inline-block text-sm px-4 py-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse">
                    <span className="text-white font-bold">+200 TOKENS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

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
              A high-stakes game where{" "}
              <span className="font-bold text-red-500">
                going against the crowd
              </span>{" "}
              earns you more point.
            </p>

            {/* Game Mechanic with Casino-Style Callout */}
            <div className="mt-4 inline-block">
              <div className="px-5 py-3 rounded-lg border border-yellow-600 bg-black bg-opacity-80 shadow-glow-gold">
                <span className="text-gray-200 text-lg">
                  When everyone zigs,{" "}
                  <span className="text-yellow-500 font-bold">you zag</span> and{" "}
                  <span className="text-red-500 font-bold">win big</span>
                </span>
              </div>
            </div>

            {/* Win Metrics - Creating FOMO */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="bg-black bg-opacity-70 px-4 py-2 rounded-lg border border-gray-800">
                <div className="text-2xl font-bold text-yellow-500 animate-pulse-slow">
                  $48,291
                </div>
                <div className="text-xs text-gray-400">LAST JACKPOT</div>
              </div>
              <div className="bg-black bg-opacity-70 px-4 py-2 rounded-lg border border-gray-800">
                <div className="text-2xl font-bold text-yellow-500">3:42</div>
                <div className="text-xs text-gray-400">NEXT ROUND</div>
              </div>
            </div>

            <div className="pt-6">
              <button className="bg-gradient-to-r from-yellow-600 to-red-600 text-white px-8 py-3 rounded-lg font-medium text-lg hover:shadow-glow-gold transition-all duration-300 transform hover:scale-105">
                PLAY NOW
              </button>
            </div>
          </div>

          {/* Right Column - Casino-Style Game Visualization */}
          <div className="mt-12 md:mt-0 md:w-6/12">
            <div className="relative">
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
                        <span className="text-white font-bold text-xl">Tail</span>
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
                        <span className="text-white font-bold text-xl">Head</span>
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
    </>
  );
};
export default HeroPage;
