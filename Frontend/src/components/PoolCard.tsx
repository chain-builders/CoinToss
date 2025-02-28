import React from "react";

interface PoolCardProps {
  name: string;
  stake: string;
  players: string;
  timeLeft: string;
  status: string;
  //   maxPlayers: number;
}

const PoolCard: React.FC<PoolCardProps> = ({
  name,
  stake,
  players,
  timeLeft,
  status,
  //   maxPlayers,
}) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center flex-col">
      <div className="flex items-center justify-between w-full mb-6">
        <h3 className="text-md font-bold">{name}</h3>
        <span className="text-yellow-400 text-sm font-semibold">{status}</span>
      </div>
      <div className="flex justify-between w-full items-center">
        <div className="flex lg:text-base md:text-sm text-xs justify-between w-full font-bold">
          <p className=" text-gray-400 flex flex-col">
            Stake:{" "}
            <span className="text-white">
              {stake} <span className="text-[#f68d11]">CORE</span>
            </span>
          </p>
          <p className=" text-gray-400 flex flex-col">
            Players:
            <span  className="text-white">
              {players}
              {/* /{maxPlayers} */}
            </span>
          </p>
          <p className=" text-gray-400 flex flex-col">
            Time Left: <span  className="text-white">{timeLeft}</span>
          </p>
        </div>
        <div>
          <button
            className="bg-blue-500 text-white px-2 py-1 lg:ml-20 md:ml-10 ml-3 lg:px-4 lg:py-2 lg:text-base text-xs rounded-lg cursor-pointer  transition-all duration-150 ease-in-out transform 
                 hover:scale-105 active:scale-95 active:opacity-80"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  ); 
};

export default PoolCard;
