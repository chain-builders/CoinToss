import  { useState } from 'react';


const RenderGameView = () =>{
    const [choice, setChoice] = useState(null);
    const [round, setRound] = useState(1);
    const [showGameView, setShowGameView] = useState(false);


   



  const handleMakeChoice = (selected) => {
        setChoice(selected);
        setTimeout(() => {
         
          setChoice(null);
          setRound(prev => prev + 1);
        }, 2000);
    };



      


     return (
        <div className="mt-4">
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-1 bg-purple-900 rounded-full text-purple-300 mb-2">Round {round}</div>
            <h1 className="text-2xl font-bold">Make Your Choice</h1>
            <p className="text-gray-400 mt-1">Choose wisely! The majority will be eliminated.</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center my-10">
            <button 
              onClick={() => handleMakeChoice('heads')}
              className={`w-64 h-64 rounded-full flex items-center justify-center border-8 transition-all ${
                choice === 'heads' 
                  ? 'border-green-500 bg-green-900 bg-opacity-20' 
                  : 'border-gray-700 hover:border-gray-500 bg-gray-800'
              }`}
            >
              <div className="text-center">
                <div className="text-5xl mb-2">🪙</div>
                <div className="text-xl font-bold">HEADS</div>
                {choice === 'heads' && <div className="mt-2 text-green-400">Selected!</div>}
              </div>
            </button>
            
            <div className="text-2xl font-bold text-gray-500">OR</div>
            
            <button 
              onClick={() => handleMakeChoice('tails')}
              className={`w-64 h-64 rounded-full flex items-center justify-center border-8 transition-all ${
                choice === 'tails' 
                  ? 'border-green-500 bg-green-900 bg-opacity-20' 
                  : 'border-gray-700 hover:border-gray-500 bg-gray-800'
              }`}
            >
              <div className="text-center">
                <div className="text-5xl mb-2">💰</div>
                <div className="text-xl font-bold">TAILS</div>
                {choice === 'tails' && <div className="mt-2 text-green-400">Selected!</div>}
              </div>
            </button>
          </div>
          
          <div className="max-w-md mx-auto bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Time remaining:</span>
              <span className="font-bold text-yellow-400">00:42</span>
            </div>
            
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500" style={{ width: '42%' }}></div>
            </div>
            
            <div className="mt-4 text-sm text-gray-400 text-center">
              <p>16 players in this round. 8 will advance to the next round.</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button 
              className="text-gray-400 hover:text-white transition-colors"
              onClick={() => setShowGameView(false)}
            >
              Back to Pool Details
            </button>
          </div>
        </div>
      );
} 

export default RenderGameView;