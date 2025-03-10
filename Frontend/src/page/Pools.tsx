import { useState } from "react";

import RenderGameView from "../components/MyPools";
import PoolsInterface from "../components/GamePools";
import RenderMyPoolsTab from "../components/selectedPools";


const MinorityGame = () => {
  const [activeTab, setActiveTab] = useState("explore");
  const [showGameView] = useState(false);

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
