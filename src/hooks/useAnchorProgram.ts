import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program, Idl } from '@project-serum/anchor';
import { Connection } from '@solana/web3.js';
import { useMemo } from 'react';
import { PROGRAM_ID } from '../utils/constants';
import idl from '../idl/anchor_escrow.json';

export const getProgram = (connection: Connection, wallet: any) => {
    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: 'processed',
    });
    return new Program(idl as any, PROGRAM_ID, provider);
  };
  

export const useAnchorProgram = () => {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  const provider = useMemo(() => {
    if (anchorWallet) {
      return new AnchorProvider(connection, anchorWallet, {
        preflightCommitment: 'confirmed',
      });
    }
    return null;
  }, [connection, anchorWallet]);

  const program = useMemo(() => {
    if (provider) {
      return new Program(idl as Idl, PROGRAM_ID, provider);
    }
    return null;
  }, [provider]);

  return { program, provider };
};