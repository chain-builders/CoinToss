


const HeroPage = () => {
        return (
            <section className="relative h-[35rem] flex items-center">
            {/* Background Image and Gradient Overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src="/api/placeholder/1600/900"
                alt="Game Background"
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black to-purple-900 opacity-70"></div>
            </div>
          
            {/* Content Container */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 flex flex-col md:flex-row items-center">
              {/* Left Column (Text Content) */}
              <div className="md:w-1/2 mb-8 md:mb-0 text-center md:text-left">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
                  Shift the Balance in Your Favor
                </h2>
                <p className="text-lg sm:text-xl text-purple-200 mb-8">
                  The first web3 minority game where strategic thinking meets blockchain rewards. Make your choice, outwit the majority, and claim your tokens.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                  <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 sm:px-8 sm:py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all text-lg">
                    Play Now
                  </button>
                  <button className="bg-transparent border-2 border-purple-400 text-purple-200 px-6 py-3 sm:px-8 sm:py-3 rounded-lg font-medium hover:bg-purple-900 hover:text-white transition-all text-lg">
                    Learn More
                  </button>
                </div>
              </div>
          
              {/* Right Column (Placeholder for Graphic/Animation) */}
              <div className="md:w-1/2 flex justify-center mt-8 md:mt-0">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse opacity-20"></div>
                  {/* Add your graphic or animation here */}
                </div>
              </div>
            </div>
          </section>
        );
      };
export default HeroPage
