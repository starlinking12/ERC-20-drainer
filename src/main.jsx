import React from "react";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { WagmiConfig } from "wagmi";
import { arbitrum, mainnet } from "viem/chains";
// 1. Get projectId

const chains = [mainnet, arbitrum];
const projectId = "2bf2541340dc39fea57ec973a360f93b";

// 2. Create wagmiConfig
const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });
// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains });

ReactDOM.createRoot(document.getElementById("root")).render(
  <WagmiConfig config={wagmiConfig}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </WagmiConfig>
);
