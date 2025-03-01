import  { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import RenderGameView from '../components/MyPools';

interface PoolsProps{
    id:number,
    name:string,
    stake:string,
    players:string,
    timeLeft:string,
    status:string,
    isOwner?:boolean,
    round?:number
}


const MinorityGame = () => {
  const [activeTab, setActiveTab] = useState('explore');
  const [showGameView, setShowGameView] = useState(false);
  const [selectedPool, setSelectedPool] = useState<PoolsProps | null>(null);
  

  
  const myPools = [
    { id: 5, name: "Friends Circle", stake: "50 CORE", players: "5/8", timeLeft: "25:14", status: "filling", isOwner: true },
    { id: 6, name: "Weekend Warriors", stake: "100 CORE", players: "8/8", timeLeft: "LIVE", status: "active", round: 2 }
  ];
  
  const handlePoolSelect = (pool:PoolsProps) => {
    setSelectedPool(pool);
  };
  
 
  
  
  
  const getStatusColor = (status:string) => {
    switch(status) {
      case 'filling': return 'text-yellow-500';
      case 'starting': return 'text-green-500';
      case 'active': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };
  
 
  
  const renderMyPoolsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">My Active Pools</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myPools.map(pool => (
          <div 
            key={pool.id} 
            className={`border border-gray-800 rounded-lg p-4 bg-gray-900 hover:bg-gray-800 cursor-pointer transition-all ${pool.status === 'active' ? 'border-blue-500' : ''}`}
            onClick={() => {
              handlePoolSelect(pool);
              if (pool.status === 'active') setShowGameView(true);
            }}
          >
            <div className="flex justify-between">
              <h3 className="font-bold flex items-center">
                {pool.name}
                {pool.isOwner && <span className="ml-2 text-xs bg-gray-700 px-2 py-1 rounded">Owner</span>}
              </h3>
              <span className={`text-sm font-medium ${getStatusColor(pool.status)}`}>
                {pool.status === 'active' ? 'Live: Round ' + pool.round : pool.status}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-gray-400">Stake</p>
                <p className="font-medium">{pool.stake}</p>
              </div>
              <div>
                <p className="text-gray-400">Players</p>
                <p className="font-medium">{pool.players}</p>
              </div>
              <div>
                <p className="text-gray-400">{pool.status === 'active' ? 'Status' : 'Time Left'}</p>
                <p className="font-medium">{pool.timeLeft}</p>
              </div>
            </div>
            
            {pool.status === 'active' && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md flex items-center justify-center">
                  Continue Game <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
  
 
  
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 w-full">
   
      {!showGameView ? (
        <>
          <div className="mb-8 border-b border-gray-800">
            <div className="flex space-x-6">
              <button 
                className={`pb-4 px-1 ${activeTab === 'explore' ? 'text-white border-b-2 border-purple-500 font-medium' : 'text-gray-400'}`}
                onClick={() => setActiveTab('explore')}
              >
                Explore Pools
              </button>
              <button 
                className={`pb-4 px-1 ${activeTab === 'my-pools' ? 'text-white border-b-2 border-purple-500 font-medium' : 'text-gray-400'}`}
                onClick={() => setActiveTab('my-pools')}
              >
                My Pools
              </button>
            </div>
          </div>
          
          {activeTab === 'explore' ? <h2>Explore pools</h2> : renderMyPoolsTab()}
        </>
      ) : (
        RenderGameView()
      )}
    </div>
  );
};

export default MinorityGame;