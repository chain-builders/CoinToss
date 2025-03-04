import { useState, useEffect } from "react";

import RenderGameView from "../components/MyPools";
import PoolsInterface from "../components/GamePools";
import RenderMyPoolsTab from "../components/selectedPools";
import { useReadContract } from "wagmi";
import contractABI from "./../utils/contract/CoinToss.json";

const MinorityGame = () => {
  const [activeTab, setActiveTab] = useState("explore");
  const [showGameView, setShowGameView] = useState(false);

  console.log(contractABI);

  const {
    data: poolInfo,
    isError,
    isLoading,
    error,
  } = useReadContract({
    address: "0x6D66Ea6D0D857BC629d038D0098E1f0d9eD313E9", // 0xC1787fcf4feBb9C9cE680294aF53F5AD709Ad23d.
    abi: contractABI.abi,
    functionName: "getPoolInfo",
    args: [1],
  });

  console.log(poolInfo, isLoading);

  useEffect(() => {
    if (poolInfo) {
      console.log("Fetched pool:", poolInfo);
    } else {
      console.log(error);
    }
  }, [poolInfo, isError, error]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 w-full">
      {!showGameView ? (
        <>
          <div className="mb-8 border-b border-gray-800">
            <div className="flex space-x-6">
              <button
                className={`pb-4 px-1 ${
                  activeTab === "explore"
                    ? "text-white border-b-2 border-purple-500 font-medium"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("explore")}
              >
                Explore Pools
              </button>
              <button
                className={`pb-4 px-1 ${
                  activeTab === "my-pools"
                    ? "text-white border-b-2 border-purple-500 font-medium"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("my-pools")}
              >
                My Pools
              </button>
            </div>
          </div>

          {activeTab === "explore" ? <PoolsInterface /> : <RenderMyPoolsTab />}
        </>
      ) : (
        RenderGameView()
      )}
    </div>
  );
};

export default MinorityGame;
