import { Coins } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useLocation, useNavigate } from "react-router-dom";


const Header = () => {
  const { address, isConnected } = useAccount();
  const location = useLocation();
  const navigate = useNavigate();
  const hasConnected = useRef(false);

  useEffect(() => {
    if (isConnected) {
      if (!hasConnected.current) {
        hasConnected.current = true;
        if (location.pathname === "/") {
          navigate("/explore");
        }
      }
    } else {
      hasConnected.current = false; // Reset ref when user disconnects
      if (location.pathname !== "/") {
        navigate("/");
      }
    }
  }, [isConnected, location.pathname, navigate]); 


  return (
    <div className="bg-gray-950 border-b border-gray-800 ">
      <header className="flex justify-between items-center w-full h-full px-5 py-4 text-white">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-yellow-600 to-red-600 w-10 h-10 rounded-full flex items-center justify-center border border-yellow-500 shadow-glow-gold">
            <Coins size={20} className="text-white" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold">
              <span className="text-red-600">Proba</span>
              <span className="text-yellow-500">War</span>
              {/* <span className="text-yellow-500">Percent</span> */}
            </h1>
            <div className="text-xs text-gray-400 -mt-1">BEAT THE MAJORITY</div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isConnected && (
            <div className="bg-black bg-opacity-70 px-4 py-2 rounded-lg flex items-center border border-gray-800">
              <Coins size={16} className="text-yellow-500 mr-2" />
              <span className="font-medium text-yellow-500">0.00</span>
              <span className="text-gray-400 ml-1 text-sm">POINTS</span>
            </div>
          )}

          <div className="bg-gradient-to-r from-yellow-600 to-red-600 px-4 py-2 rounded-lg border border-yellow-600 shadow-sm hover:shadow-glow-gold transition-all duration-300">
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
                      <button
                        onClick={openAccountModal}
                        className="flex items-center"
                      >
                        <span className="text-white font-medium">
                          {account.displayName}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={openConnectModal}
                        className="flex items-center"
                      >
                        <span className="text-white font-medium">
                          Connect Wallet
                        </span>
                      </button>
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
