import { Coins } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && location.pathname !== "/explore") {
      navigate("/explore");
    } else {
      navigate("/");
    }
  }, [isConnected]);

  return (
    <div className="bg-gray-950">
      <header className="flex justify-between items-center w-full h-full px-5 py-6 text-white">
        <div className="flex items-center space-x-2">
          <div className="bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center">
            <Coins size={20} />
          </div>
          <h1 className="text-2xl font-bold text-white hidden md:flex">MinorityGame</h1>
        </div>

        <div className="flex items-center space-x-4">
          {isConnected && (
            <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center">
              <Coins size={16} className="text-yellow-400 mr-2" />
              <span className="font-medium">0.00 points</span>
            </div>
          )}

          <div className="bg-purple-900 bg-opacity-50 px-4 py-2 rounded-lg border border-purple-600">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openConnectModal,
                mounted,
              }) => {
                const connected = mounted && account;

                return (
                  <div>
                    {connected ? (
                      <button onClick={openAccountModal}>
                        {account.displayName} 
                      </button>
                    ) : (
                      <button onClick={openConnectModal}>Connect Wallet</button>
                    )}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
