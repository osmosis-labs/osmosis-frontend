/**
 * @file wallet-utils.ts
 * @description Wallet address derivation from raw secp256k1 private keys.
 *
 * Used by the balance checker, standalone scripts, and test files to derive
 * an osmo1... bech32 address from a hex-encoded private key, removing the
 * need for a separate WALLET_ID environment variable.
 *
 * @example
 * ```ts
 * import { deriveAddress } from '../utils/wallet-utils';
 * const { address } = await deriveAddress(process.env.PRIVATE_KEY!);
 * console.log(address); // osmo1dkmsds5j6q9l9lv4dkhas68767tlqfx8ls5j0c
 * ```
 */

import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";

/**
 * Derives an Osmosis wallet and bech32 address from a hex-encoded secp256k1 private key.
 *
 * @param privateKeyHex - Hex-encoded secp256k1 private key (with or without `0x` prefix).
 * @returns The derived `address` (osmo1...) and the `DirectSecp256k1Wallet` instance.
 * @throws {Error} If the key is missing or invalid hex.
 */
export async function deriveAddress(privateKeyHex: string): Promise<{
  wallet: DirectSecp256k1Wallet;
  address: string;
}> {
  const normalized = privateKeyHex.replace(/^0x/, "");
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
