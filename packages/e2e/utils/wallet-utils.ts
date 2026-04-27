/**
 * @file wallet-utils.ts
 * @description Wallet address derivation from hex private keys or BIP39 mnemonics.
 *
 * Used by the balance checker, standalone scripts, and test files to derive
 * an osmo1... bech32 address from a hex-encoded private key or a mnemonic
 * phrase, removing the need for a separate WALLET_ID environment variable.
 *
 * @example
 * ```ts
 * import { deriveAddress } from '../utils/wallet-utils';
 * const { address } = await deriveAddress(process.env.PRIVATE_KEY!);
 * console.log(address); // osmo1dkmsds5j6q9l9lv4dkhas68767tlqfx8ls5j0c
 * ```
 */

import {
  DirectSecp256k1HdWallet,
  DirectSecp256k1Wallet,
  type OfflineDirectSigner,
} from "@cosmjs/proto-signing";

/**
 * Derives an Osmosis wallet and bech32 address from either a hex-encoded
 * secp256k1 private key or a BIP39 mnemonic phrase.
 *
 * Auto-detects the format: if the input contains spaces it is treated as a
 * mnemonic (using the default Cosmos HD path m/44'/118'/0'/0/0), otherwise
 * as a hex private key (with or without `0x` prefix).
 *
 * @param privateKeyOrMnemonic - Hex private key or BIP39 mnemonic.
 * @returns The wallet signer and derived `address` (osmo1...).
 *
 * @example
 * ```ts
 * const { wallet, address } = await deriveAddress('44886ab5033ff99ab2...')
 * const { wallet, address } = await deriveAddress('word1 word2 ... word12')
 * ```
 */
export async function deriveAddress(privateKeyOrMnemonic: string): Promise<{
  wallet: OfflineDirectSigner;
  address: string;
}> {
  const input = privateKeyOrMnemonic.trim();

  if (input.includes(" ")) {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(input, {
      prefix: "osmo",
    });
    const [account] = await wallet.getAccounts();
    return { wallet, address: account.address };
  }

  const normalized = input.replace(/^0x/, "");
  const keyBytes = Uint8Array.from(Buffer.from(normalized, "hex"));
  const wallet = await DirectSecp256k1Wallet.fromKey(keyBytes, "osmo");
  const [account] = await wallet.getAccounts();
  return { wallet, address: account.address };
}

/**
 * Returns `true` if the value looks like a hex private key rather than a bech32 address.
 */
export function isPrivateKey(value: string): boolean {
  const normalized = value.replace(/^0x/, "");
  return /^[0-9a-fA-F]{64}$/.test(normalized);
}
