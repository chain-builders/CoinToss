import { RouterProvider } from "react-router-dom";
import router from "./router";
import "./App.css";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const core = {
  id: 1114,
  name: "Core Testnet",
  network: "core-testnet",
  nativeCurrency: {
    name: "tCORE",
    symbol: "tCORE2",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.test2.btcs.network/"],
    },
    public: {
      http: ["https://rpc.test2.btcs.network/"],
    },

  },
  blockExplorers: {
    default: { name: "Core Explorer", url: "https://scan.test2.btcs.network/" },
  },
  testnet: true,
};

export const config = getDefaultConfig({
  appName: "CoinToss",
  projectId: "f6944e67672a59c2ac32f0ec4777dfd8",
  chains: [core],
});


function App() {
  const queryClient = new QueryClient();

  return (
    <div className="bg-gray-950">
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <RouterProvider router={router} />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
}

export default App;
