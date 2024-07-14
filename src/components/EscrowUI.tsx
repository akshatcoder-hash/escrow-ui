import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram, makeEscrow, refundEscrow, takeEscrow, getTokenBalance, listActiveEscrows } from '../utils/anchorProgram';

const EscrowUI: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const [seed, setSeed] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [receiveAmount, setReceiveAmount] = useState<string>('');
  const [mintA, setMintA] = useState<string>('');
  const [mintB, setMintB] = useState<string>('');
  const [makerAddress, setMakerAddress] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [balanceA, setBalanceA] = useState<number>(0);
  const [balanceB, setBalanceB] = useState<number>(0);
  const [activeEscrows, setActiveEscrows] = useState<any[]>([]);

  useEffect(() => {
    if (publicKey && mintA) {
      getTokenBalance(connection, publicKey, new PublicKey(mintA)).then(setBalanceA);
    }
  }, [connection, publicKey, mintA]);

  useEffect(() => {
    if (publicKey && mintB) {
      getTokenBalance(connection, publicKey, new PublicKey(mintB)).then(setBalanceB);
    }
  }, [connection, publicKey, mintB]);

  useEffect(() => {
    if (publicKey) {
      const program = getProgram(connection, { publicKey, signTransaction, signAllTransactions });
      listActiveEscrows(program, publicKey).then(setActiveEscrows);
    }
  }, [connection, publicKey, signTransaction, signAllTransactions]);

  const handleError = (error: unknown) => {
    console.error('Error:', error);
    if (error instanceof Error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setStatus('An unknown error occurred');
    }
  };

  const handleMake = async () => {
    if (!publicKey || !signTransaction) return;
    setStatus('Processing...');
    try {
      const program = getProgram(connection, { publicKey, signTransaction, signAllTransactions });
      const tx = await makeEscrow(
        program,
        publicKey,
        parseInt(seed),
        parseInt(depositAmount),
        parseInt(receiveAmount),
        new PublicKey(mintA),
        new PublicKey(mintB)
      );
      setStatus(`Escrow created! Transaction: ${tx}`);
      // Refresh balances and active escrows
      getTokenBalance(connection, publicKey, new PublicKey(mintA)).then(setBalanceA);
      listActiveEscrows(program, publicKey).then(setActiveEscrows);
    } catch (error: unknown) {
      handleError(error);
    }
  };

  const handleRefund = async () => {
    if (!publicKey || !signTransaction) return;
    setStatus('Processing refund...');
    try {
      const program = getProgram(connection, { publicKey, signTransaction, signAllTransactions });
      const tx = await refundEscrow(
        program,
        publicKey,
        parseInt(seed),
        new PublicKey(mintA)
      );
      setStatus(`Escrow refunded! Transaction: ${tx}`);
      // Refresh balances and active escrows
      getTokenBalance(connection, publicKey, new PublicKey(mintA)).then(setBalanceA);
      listActiveEscrows(program, publicKey).then(setActiveEscrows);
    } catch (error: unknown) {
      handleError(error);
    }
  };

  const handleTake = async () => {
    if (!publicKey || !signTransaction) return;
    setStatus('Processing take...');
    try {
      const program = getProgram(connection, { publicKey, signTransaction, signAllTransactions });
      const tx = await takeEscrow(
        program,
        publicKey,
        new PublicKey(makerAddress), // This should be the wallet address of the escrow creator
        parseInt(seed),
        new PublicKey(mintA),
        new PublicKey(mintB)
      );
      setStatus(`Escrow taken! Transaction: ${tx}`);
      // Refresh balances and active escrows
      getTokenBalance(connection, publicKey, new PublicKey(mintA)).then(setBalanceA);
      getTokenBalance(connection, publicKey, new PublicKey(mintB)).then(setBalanceB);
      listActiveEscrows(program, publicKey).then(setActiveEscrows);
    } catch (error: unknown) {
      handleError(error);
    }
  };
  
  if (!publicKey) {
    return <div className="text-center text-xl font-bold mt-10">Please connect your wallet to use the Escrow UI.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Anchor Escrow Application</h1>
      
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
        <p className="font-bold">Escrow Information</p>
        <p>An escrow is a financial arrangement where a third party holds and regulates payment of the funds required for two parties involved in a given transaction.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h2 className="font-bold mb-2">Token A Balance</h2>
          <p>{balanceA}</p>
        </div>
        <div>
          <h2 className="font-bold mb-2">Token B Balance</h2>
          <p>{balanceB}</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Unique Identifier (Seed)</label>
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Enter a unique number for this escrow"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Token You're Offering (Mint A)</label>
          <input
            type="text"
            value={mintA}
            onChange={(e) => setMintA(e.target.value)}
            placeholder="Enter the address of the token you're offering"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Token You're Requesting (Mint B)</label>
          <input
            type="text"
            value={mintB}
            onChange={(e) => setMintB(e.target.value)}
            placeholder="Enter the address of the token you want"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Amount You're Offering</label>
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Enter the amount you're offering"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Amount You're Requesting</label>
          <input
            type="number"
            value={receiveAmount}
            onChange={(e) => setReceiveAmount(e.target.value)}
            placeholder="Enter the amount you want to receive"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Maker Address (for Take)</label>
          <input
            type="text"
            value={makerAddress}
            onChange={(e) => setMakerAddress(e.target.value)}
            placeholder="Enter the address of the escrow creator"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleMake}
          className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
        >
          Create Escrow
        </button>
        <button
          onClick={handleRefund}
          className="flex-1 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
        >
          Refund Escrow
        </button>
        <button
          onClick={handleTake}
          className="flex-1 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
        >
          Take Escrow
        </button>
      </div>

      {status && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-800">{status}</p>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Active Escrows</h2>
        {activeEscrows.length > 0 ? (
          <ul className="space-y-2">
            {activeEscrows.map((escrow, index) => (
              <li key={index} className="bg-gray-100 p-4 rounded">
                <p>Seed: {escrow.account.seed.toString()}</p>
                <p>Mint A: {escrow.account.mintA.toString()}</p>
                <p>Mint B: {escrow.account.mintB.toString()}</p>
                <p>Receive Amount: {escrow.account.receive.toString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No active escrows found.</p>
        )}
      </div>
    </div>
  );
};

export default EscrowUI;