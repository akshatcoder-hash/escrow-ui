import { PublicKey } from '@solana/web3.js';

export const isValidPublicKey = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const formatAmount = (amount: number | string, decimals: number = 9): string => {
  return (Number(amount) / Math.pow(10, decimals)).toFixed(decimals);
};