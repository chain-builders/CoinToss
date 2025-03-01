import { RouterProvider } from "react-router-dom";
import router from "./router";
import "./App.css";
import { http, createConfig } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

// import {
//   getDefaultConfig,
//   RainbowKitProvider,
// } from '@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { coreDao } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = createConfig({
  chains: [coreDao],
  transports: {
    [coreDao.id]: http(),
  },
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
