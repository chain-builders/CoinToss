import React from "react";
import PoolCard from "./PoolCard";

interface Pool {
  name: string;
  stake: string;
  players: string;
  timeLeft: string;
  status: string;
}

const pools: Pool[] = [
  {
    name: "High Rollers",
    stake: "500",
    players: "14/16",
    timeLeft: "10:24",
    status: "Filling",
  },
];

const AvailablePools: React.FC = () => {
  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg w-full lg:max-w-7xl lg:mx-32 md:mx-16 mx-5">
      <h2 className="text-lg font-semibold mb-4">Available Pools</h2>
      {pools.map((pool, index) => (
        <PoolCard key={index} {...pool} />
      ))}
    </div>
  );
};

export default AvailablePools;
