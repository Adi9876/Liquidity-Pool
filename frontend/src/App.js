import React, { useState } from 'react';
import { ethers } from 'ethers';
import TOKEN_A_ABI from './contracts/abis/contracts/Token1.sol/TokenA.json';
import TOKEN_B_ABI from './contracts/abis/contracts/Token2.sol/TokenB.json';
import POOL_ABI from './contracts/abis/contracts/LiquidityPool.sol/LiquidityPool.json';

const DEX = () => {
  // Replace with your deployed contract addresses
  // const TOKEN_A_ADDRESS = "0xfB89742e9E9118522513fddBf14ed4f898da7729";
  // const TOKEN_B_ADDRESS = "0x6bB3E43740132e412BA44B8Dd1cffDBcA828f023";
  // const POOL_ADDRESS = "0xD2a13Cbd43D6f98A69a7347Ff9cd37dF23E83De1";


  // new 
  const TOKEN_A_ADDRESS = "0x18cD212adab70c6473de5e33Cb828C623489255F";
  const TOKEN_B_ADDRESS = "0x468A99af760cCF59307b5dC45Ab0f93eeE66DD8c";
  const POOL_ADDRESS = "0x231DA6A5bA86DDdeA2c6CC903c52927Fe2E7af7D";


  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  
  const [tokenAAmount, setTokenAAmount] = useState('');
  const [tokenBAmount, setTokenBAmount] = useState('');
  const [sharesAmount, setSharesAmount] = useState('');
  const [swapAmount, setSwapAmount] = useState('');
  const [activeTab, setActiveTab] = useState('liquidity');
  
  const [balances, setBalances] = useState({
    tokenA: 'Loading..',
    tokenB: 'Loading..',
    shares: 'Loading..'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSwapLoading, setIsSwapLoading] = useState(false);
  const [swapDirection, setSwapDirection] = useState('');

  // Connect wallet
  const connectWallet = async () => {
    try {
      console.log("Attempting to connect wallet...");
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        
        setProvider(provider);
        setSigner(signer);
        setAccount(accounts[0]);
        
        // Load initial balances
        await refreshBalances(accounts[0], provider);
        console.log("Wallet connected successfully:", accounts[0]);

        const tokenA = new ethers.Contract(TOKEN_A_ADDRESS, TOKEN_A_ABI.abi, provider);
    const decimals = await tokenA.decimals();
    console.log("Token Decimals:", decimals);
    
    const balance = await tokenA.balanceOf(accounts[0]);
    console.log("Raw Balance:", balance.toString());
    console.log("Formatted Balance:", ethers.formatEther(balance));


      } else {
        console.log("MetaMask not detected");
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      alert("Failed to connect wallet");
    }
  };

  // Refresh balances
  const refreshBalances = async (userAccount, provider) => {
    try {
      console.log("Refreshing balances for account:", userAccount);
      const tokenA = new ethers.Contract(TOKEN_A_ADDRESS, TOKEN_A_ABI.abi, provider);
      const tokenB = new ethers.Contract(TOKEN_B_ADDRESS, TOKEN_B_ABI.abi, provider);
      const pool = new ethers.Contract(POOL_ADDRESS, POOL_ABI.abi, provider);

      const [tokenABal, tokenBBal, sharesBal] = await Promise.all([
        tokenA.balanceOf(userAccount),
        tokenB.balanceOf(userAccount),
        pool.shares(userAccount)
      ]);

      // const tokenABal = await tokenA.balanceOf(userAccount);
      // console.log(`Token A: ${tokenABal}`)
      // const tokenBBal = await tokenB.balanceOf(userAccount);
      // console.log(`Token B: ${tokenBBal} `)
      // const sharesBal = await pool.shares(userAccount);

      console.log(`Pool : ${pool}`);

      setBalances({
        tokenA: ethers.formatEther(tokenABal),
        tokenB: ethers.formatEther(tokenBBal),
        shares: ethers.formatEther(sharesBal)
      });
      console.log("Updated balances:", {
        tokenA: ethers.formatEther(tokenABal),
        tokenB: ethers.formatEther(tokenBBal),
        shares: ethers.formatEther(sharesBal)
      });
    } catch (error) {
      console.error("Balance refresh error:", error);
    }
  };

  // Add liquidity
  // const addLiquidity = async () => {
  //   try {
  //     if (!signer) return;
      
  //     const tokenA = new ethers.Contract(TOKEN_A_ADDRESS, TOKEN_A_ABI.abi, signer);
  //     const tokenB = new ethers.Contract(TOKEN_B_ADDRESS, TOKEN_B_ABI.abi, signer);
  //     const pool = new ethers.Contract(POOL_ADDRESS, POOL_ABI.abi, signer);

  //     const amountA = ethers.parseEther(tokenAAmount);
  //     const amountB = ethers.parseEther(tokenBAmount);

  //     // Approve tokens
  //     await tokenA.approve(POOL_ADDRESS, amountA);
  //     await tokenB.approve(POOL_ADDRESS, amountB);

  //     // Add liquidity
  //     const tx = await pool.addLiquidity(amountA, amountB);
  //     await tx.wait();

  //     // Refresh balances
  //     await refreshBalances(account, provider);
      
  //     // Reset inputs
  //     setTokenAAmount('');
  //     setTokenBAmount('');
  //   } catch (error) {
  //     console.error("Error adding liquidity:", error);
  //     alert("Failed to add liquidity");
  //   }
  // };
  const addLiquidity = async () => {
    try {
      if (!signer) {
        alert("Please connect your wallet first");
        return;
      }
  
      if (!tokenAAmount || !tokenBAmount) {
        alert("Please enter both token amounts");
        return;
      }
  
      const tokenA = new ethers.Contract(TOKEN_A_ADDRESS, TOKEN_A_ABI.abi, signer);
      console.log("Token A contract created",tokenA);
      const tokenB = new ethers.Contract(TOKEN_B_ADDRESS, TOKEN_B_ABI.abi, signer);
      console.log("Token B contract created",tokenB);
      const pool = new ethers.Contract(POOL_ADDRESS, POOL_ABI.abi, signer);
      console.log("Pool contract created",pool);
  
      setIsLoading(true);
  
      const amountA = ethers.parseEther(tokenAAmount);
      const amountB = ethers.parseEther(tokenBAmount);
  
      console.log("Amount A to add:", amountA.toString());
      console.log("Amount B to add:", amountB.toString());

      // Check balances first
      const balanceA = await tokenA.balanceOf(await signer.getAddress());
      console.log("Balance A:", balanceA);
      const balanceB = await tokenB.balanceOf(await signer.getAddress());
      console.log("Balance B:", balanceB);
  
      if (balanceA < amountA) {
        alert("Insufficient balance for Token A");
        setIsLoading(false);
        return;
      }
  
      if (balanceB < amountB) {
        alert("Insufficient balance for Token B");
        setIsLoading(false);
        return;
      }
  
      // Check allowances
      const allowanceA = await tokenA.allowance(await signer.getAddress(), POOL_ADDRESS);
      console.log("Allowance for Token A:", allowanceA.toString());
      if (allowanceA < amountA) {
        console.log("Approving Token A...");
        alert("Approving Token A since it is less than the amount to be added...");
        const approveTxA = await tokenA.approve(POOL_ADDRESS, amountA);
        console.log("Approve Tx A:", approveTxA.hash);
        await approveTxA.wait();
        console.log("Token A approval confirmed.");
      }
  
      const allowanceB = await tokenB.allowance(await signer.getAddress(), POOL_ADDRESS);
      console.log("Allowance for Token B:", allowanceB.toString());
      if (allowanceB < amountB) {
        console.log("Approving Token B...");
        alert("Approving Token B since it is less than the amount to be added...");
        const approveTxB = await tokenB.approve(POOL_ADDRESS, amountB);
        console.log("Approve Tx B:", approveTxB.hash);
        await approveTxB.wait();
        console.log("Token B approval confirmed.");
      }
  
      // Add liquidity
      console.log("Calling addLiquidity...");
      const tx = await pool.addLiquidity(amountA, amountB);
      console.log("addLiquidity Tx:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);
  
      if (receipt.status === 1) {
        alert("Liquidity added successfully!");
      } else {
        throw new Error("Transaction failed");
      }
  
      // Refresh balances
      await refreshBalances(await signer.getAddress(), provider);
      setTokenAAmount('');
      setTokenBAmount('');
    } catch (error) {
      console.error("Error adding liquidity:", error);
  
      if (error.code === 'ACTION_REJECTED') {
        alert("Transaction rejected by user.");
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        alert("Insufficient ETH for gas.");
      } else if (error?.data?.message) {
        alert(`Error: ${error.data.message}`);
      } else {
        alert("Failed to add liquidity.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Remove liquidity
  const removeLiquidity = async () => {
    try {
      setIsLoading(true)
      console.log("Removing liquidity, shares amount:", sharesAmount);
      if (!signer) return;
      
      const pool = new ethers.Contract(POOL_ADDRESS, POOL_ABI.abi, signer);
      
      const shares = ethers.parseEther(sharesAmount);
      console.log("Initiating removeLiquidity transaction...");
      const tx = await pool.removeLiquidity(shares);
      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("Remove liquidity transaction confirmed");

      setIsLoading(false);
      // Refresh balances
      await refreshBalances(account, provider);
      
      // Reset input
      setSharesAmount('');
    } catch (error) {
      console.error("Remove liquidity error:", error);
      alert("Failed to remove liquidity");
    }
  };

  // Swap tokens
  const swap = async (tokenIn) => {
    try {
      setIsSwapLoading(true);
      setSwapDirection(tokenIn);
      console.log(`Initiating swap, tokenIn: ${tokenIn}, amount: ${swapAmount}`);
      
      if (!signer) {
        alert("Please connect your wallet first");
        return;
      }

      if (!swapAmount || swapAmount <= 0) {
        alert("Please enter a valid amount");
        return;
      }
      
      const tokenContract = new ethers.Contract(
        tokenIn === 'A' ? TOKEN_A_ADDRESS : TOKEN_B_ADDRESS,
        tokenIn === 'A' ? TOKEN_A_ABI.abi : TOKEN_B_ABI.abi,
        signer
      );
      const pool = new ethers.Contract(POOL_ADDRESS, POOL_ABI.abi, signer);

      const amount = ethers.parseEther(swapAmount);

      // Check balance before swap
      const balance = await tokenContract.balanceOf(await signer.getAddress());
      if (balance < amount) {
        alert("Insufficient balance for swap");
        return;
      }

      console.log("Approving tokens for swap...");
      const approveTx = await tokenContract.approve(POOL_ADDRESS, amount);
      await approveTx.wait();
      console.log("Token approval confirmed");
      
      console.log("Executing swap transaction...");
      const tx = await pool.swap(
        tokenIn === 'A' ? TOKEN_A_ADDRESS : TOKEN_B_ADDRESS,
        amount
      );
      console.log("Swap transaction hash:", tx.hash);
      await tx.wait();
      console.log("Swap transaction confirmed");

      // Refresh balances
      await refreshBalances(account, provider);
      
      // Reset input
      setSwapAmount('');
      alert("Swap completed successfully!");
    } catch (error) {
      console.error("Swap error:", error);
      if (error.code === 'ACTION_REJECTED') {
        alert("Transaction rejected by user");
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        alert("Insufficient funds for gas");
      } else {
        alert(`Failed to swap tokens: ${error.message}`);
      }
    } finally {
      setIsSwapLoading(false);
      setSwapDirection('');
    }
  };

  return (
   <div className="container mx-auto p-4 max-w-3xl">
  <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg shadow-md p-6 mb-6">
    <h2 className="text-2xl font-bold mb-4 text-gray-800">Liquidity Pool</h2>
    {!account ? (
      <button
        onClick={connectWallet}
        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold shadow hover:from-blue-600 hover:to-purple-600"
      >
        Connect Wallet
      </button>
    ) : (
      <div className="text-gray-700 text-sm font-medium">
        Connected: <span className="text-blue-600">{account}</span>
      </div>
    )}
  </div>

  {account && (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Your Balances</h2>
        <div className="space-y-3 text-gray-700">
          <div className="flex justify-between">
            <span>Token A:</span>
            <span>{balances.tokenA}</span>
          </div>
          <div className="flex justify-between">
            <span>Token B:</span>
            <span>{balances.tokenB}</span>
          </div>
          <div className="flex justify-between">
            <span>Pool Shares:</span>
            <span>{balances.shares}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex border-b mb-6">
          <button
            className={`flex-1 text-center py-3 text-lg font-semibold ${
              activeTab === 'liquidity'
                ? 'text-blue-600 border-b-4 border-blue-500'
                : 'text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('liquidity')}
          >
            Liquidity
          </button>
          <button
            className={`flex-1 text-center py-3 text-lg font-semibold ${
              activeTab === 'swap'
                ? 'text-blue-600 border-b-4 border-blue-500'
                : 'text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('swap')}
          >
            Swap
          </button>
        </div>

        {activeTab === 'liquidity' ? (
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-gray-800 text-lg mb-4">Add Liquidity</h3>
              <div className="space-y-4">
                <input
                  type="number"
                  placeholder="Token A Amount"
                  value={tokenAAmount}
                  onChange={(e) => setTokenAAmount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Token B Amount"
                  value={tokenBAmount}
                  onChange={(e) => setTokenBAmount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  onClick={addLiquidity}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg font-semibold shadow hover:from-green-600 hover:to-teal-600"
                  disabled={isLoading || !signer}
                >
                  {isLoading ? 'Processing...' : 'Add Liquidity'}
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 text-lg mb-4">Remove Liquidity</h3>
              <div className="space-y-4">
                <input
                  type="number"
                  placeholder="Shares Amount"
                  value={sharesAmount}
                  onChange={(e) => setSharesAmount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  onClick={removeLiquidity}
                  className={`w-full flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold shadow hover:from-red-600 hover:to-pink-600 ${
                    isLoading ? 'cursor-not-allowed opacity-75' : ''
                  }`}
                  disabled={isLoading}
          >
                  Remove Liquidity
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <input
              type="number"
              placeholder="Amount"
              value={swapAmount}
              onChange={(e) => setSwapAmount(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={isSwapLoading}
            />
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => swap('A')}
                disabled={isSwapLoading}
                className={`relative bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-lg font-semibold shadow hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSwapLoading && swapDirection === 'A' ? (
                  <>
                    <span className="opacity-0">Swap A → B</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  </>
                ) : (
                  'Swap A → B'
                )}
              </button>
              <button
                onClick={() => swap('B')}
                disabled={isSwapLoading}
                className={`relative bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSwapLoading && swapDirection === 'B' ? (
                  <>
                    <span className="opacity-0">Swap B → A</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  </>
                ) : (
                  'Swap B → A'
                )}
              </button>
            </div>
            {isSwapLoading && (
              <div className="text-sm text-gray-600 text-center animate-pulse">
                {swapDirection === 'A' ? 'Swapping Token A for Token B...' : 'Swapping Token B for Token A...'}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )}
</div>

  );
};

export default DEX;



// tokena a : 0x18cD212adab70c6473de5e33Cb828C623489255F
// token b : 0x468A99af760cCF59307b5dC45Ab0f93eeE66DD8c
// pool : 0x231DA6A5bA86DDdeA2c6CC903c52927Fe2E7af7D