import React, { useState } from 'react';
import { ethers } from 'ethers';

const MintTokens = ({ 
  signer, 
  tokenAContract, 
  tokenBContract, 
  isOwner, 
  refreshBalances 
}) => {
    console.log("not here ");
  const [mintAmount, setMintAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState('A');

  const handleMint = async () => {
    if (!mintAmount || !recipientAddress) {
      alert('Please enter both amount and recipient address');
      return;
    }

    try {
      setIsLoading(true);
      console.log(`Minting ${mintAmount} of Token ${selectedToken} to ${recipientAddress}`);

      const amount = ethers.parseEther(mintAmount);
      const contract = selectedToken === 'A' ? tokenAContract : tokenBContract;

      console.log('Initiating mint transaction...');
      const tx = await contract.mint(recipientAddress, amount);
      console.log('Mint transaction hash:', tx.hash);
      
      await tx.wait();
      console.log('Mint transaction confirmed');

      // Clear inputs
      setMintAmount('');
      setRecipientAddress('');
      
      // Refresh balances
      await refreshBalances();
      
      alert('Tokens minted successfully!');
    } catch (error) {
      console.error('Minting error:', error);
      alert(`Failed to mint tokens: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOwner) {
    console.log("not owner");
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Mint Tokens (Owner Only)</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Token
          </label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="A">Token A</option>
            <option value="B">Token B</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <input
            type="number"
            placeholder="Amount to mint"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            placeholder="0x..."
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleMint}
          disabled={isLoading || !signer}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-lg font-semibold shadow hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50"
        >
          {isLoading ? 'Minting...' : 'Mint Tokens'}
        </button>
      </div>
    </div>
  );
};

export default MintTokens;