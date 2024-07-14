import { Program, AnchorProvider, web3, utils, BN } from '@project-serum/anchor';
import { PublicKey, Connection } from '@solana/web3.js';
import { PROGRAM_ID } from './constants';
import idl from '../idl/anchor_escrow.json';
import { getAccount, getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

export const getProgram = (connection: Connection, wallet: any) => {
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: 'processed',
  });
  return new Program(idl as any, PROGRAM_ID, provider);
};

export const makeEscrow = async (
  program: Program,
  walletPubkey: PublicKey,
  seed: number,
  depositAmount: number,
  receiveAmount: number,
  mintA: PublicKey,
  mintB: PublicKey
) => {
  const [escrowPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), walletPubkey.toBuffer(), new BN(seed).toArrayLike(Buffer, 'le', 8)],
    program.programId
  );

  const [vaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), escrowPDA.toBuffer()],
    program.programId
  );

  const makerAtaA = await getAssociatedTokenAddress(mintA, walletPubkey);

  const tx = await program.methods
    .make(new BN(seed), new BN(depositAmount), new BN(receiveAmount))
    .accounts({
      maker: walletPubkey,
      mintA: mintA,
      mintB: mintB,
      makerAtaA: makerAtaA,
      escrow: escrowPDA,
      vault: vaultPDA,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .rpc();

  return tx;
};

export const refundEscrow = async (
  program: Program,
  walletPubkey: PublicKey,
  seed: number,
  mintA: PublicKey
) => {
  const [escrowPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), walletPubkey.toBuffer(), new BN(seed).toArrayLike(Buffer, 'le', 8)],
    program.programId
  );

  const [vaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), escrowPDA.toBuffer()],
    program.programId
  );

  const makerAtaA = await getAssociatedTokenAddress(mintA, walletPubkey);

  const tx = await program.methods
    .refund()
    .accounts({
      maker: walletPubkey,
      mintA: mintA,
      makerAtaA: makerAtaA,
      escrow: escrowPDA,
      vault: vaultPDA,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .rpc();

  return tx;
};

export const takeEscrow = async (
  program: Program,
  takerPubkey: PublicKey,
  makerPubkey: PublicKey,
  seed: number,
  mintA: PublicKey,
  mintB: PublicKey
) => {
  const [escrowPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), makerPubkey.toBuffer(), new BN(seed).toArrayLike(Buffer, 'le', 8)],
    program.programId
  );

  const [vaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), escrowPDA.toBuffer()],
    program.programId
  );

  const takerAtaA = await getAssociatedTokenAddress(mintA, takerPubkey);
  const takerAtaB = await getAssociatedTokenAddress(mintB, takerPubkey);
  const makerAtaB = await getAssociatedTokenAddress(mintB, makerPubkey);

  const tx = await program.methods
    .take()
    .accounts({
      taker: takerPubkey,
      maker: makerPubkey,
      mintA: mintA,
      mintB: mintB,
      takerAtaA: takerAtaA,
      takerAtaB: takerAtaB,
      makerAtaB: makerAtaB,
      escrow: escrowPDA,
      vault: vaultPDA,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .rpc();

  return tx;
};

export const getTokenBalance = async (
  connection: Connection,
  walletPubkey: PublicKey,
  mintPubkey: PublicKey
): Promise<number> => {
  const ata = await getAssociatedTokenAddress(mintPubkey, walletPubkey);
  try {
    const account = await getAccount(connection, ata);
    return Number(account.amount);
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
  }
};

export const listActiveEscrows = async (
  program: Program,
  walletPubkey: PublicKey
): Promise<any[]> => {
  const escrows = await program.account.escrow.all([
    {
      memcmp: {
        offset: 8, // Discriminator
        bytes: walletPubkey.toBase58(),
      },
    },
  ]);
  return escrows;
};