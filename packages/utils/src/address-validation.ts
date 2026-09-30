// Chain-specific address validators. Kept apart from ./string so importing
// light helpers like `truncate` doesn't pull the TON/Bitcoin/XRPL libraries
// into the shared client bundle.
import { Address } from "@ton/core";
import * as bitcoin from "bitcoinjs-lib";
import bs58 from "bs58";
import bs58check from "bs58check";
import { isValidCashAddress } from "ecashaddrjs";
import { isValidClassicAddress, isValidXAddress } from "ripple-address-codec";

export function isBitcoinAddressValid({
  address,
  env,
}: {
  address: string;
  env: "mainnet" | "testnet";
}): boolean {
  try {
    // Attempt to decode the address
    const decoded = bitcoin.address.fromBase58Check(address);
    const isTestnet =
      decoded.version === bitcoin.networks.testnet.pubKeyHash ||
      decoded.version === bitcoin.networks.testnet.scriptHash;
    const isMainnet =
      decoded.version === bitcoin.networks.bitcoin.pubKeyHash ||
      decoded.version === bitcoin.networks.bitcoin.scriptHash;

    if ((env === "mainnet" && isMainnet) || (env === "testnet" && isTestnet)) {
      return true; // Address is valid for the given environment
    }
    return false; // Address is invalid for the given environment
  } catch (e) {
    try {
      // If Base58 decoding fails, try Bech32 decoding
      const decoded = bitcoin.address.fromBech32(address);
      const isTestnet = decoded.prefix === "tb" || decoded.prefix === "bcrt";
      const isMainnet = decoded.prefix === "bc";

      if (
        (env === "mainnet" && isMainnet) ||
        (env === "testnet" && isTestnet)
      ) {
        return true; // Address is valid for the given environment
      }
      return false; // Address is invalid for the given environment
    } catch (e) {
      return false; // Address is invalid
    }
  }
}

/**
 * Verifies if a given string is a valid Dogecoin address.
 * @param address The Dogecoin address to validate
 * @returns boolean True if valid, false otherwise
 */
export function isDogecoinAddressValid({ address }: { address: string }) {
  try {
    // Decode base58-check; this throws if the checksum or format is invalid.
    const payload = bs58check.decode(address);

    // payload is 21 bytes: 1 version byte + 20 data bytes
    // The 4-byte checksum is verified and removed internally by bs58check.
    if (payload.length !== 21) {
      return false;
    }

    // The first byte is the "version". For Dogecoin mainnet:
    // - 0x1E (30 decimal) for P2PKH (commonly looks like a 'D' address)
    // - 0x16 (22 decimal) for P2SH (often starts with '9', 'A', etc.)
    const version = payload[0];

    // Return true if it matches Dogecoin mainnet prefixes
    // Disable prettier for the next line as it's changing the hex value of 0x1E to 0x1e.
    // prettier-ignore prettier
    return version === 0x1e || version === 0x16;
  } catch (error) {
    // If decoding fails (invalid checksum/base58), it's not valid
    return false;
  }
}

/**
 * Verifies if a given string is a valid Litecoin address.
 * @param address The Litecoin address to validate
 * @returns boolean True if valid, false otherwise
 */
export function isLitecoinAddressValid({ address }: { address: string }) {
  try {
    // Decode base58-check; this throws if the checksum or format is invalid.
    const payload = bs58check.decode(address);

    // payload is 21 bytes: 1 version byte + 20 data bytes
    // The 4-byte checksum is verified and removed internally by bs58check.
    if (payload.length !== 21) {
      return false;
    }

    // The first byte is the "version". For Litecoin mainnet:
    // - 0x30 (48 decimal) for P2PKH (commonly looks like a 'L' address)
    // - 0x05 (5 decimal) for P2SH (often starts with '3')
    const version = payload[0];

    // Return true if it matches Litecoin mainnet prefixes
    return version === 0x30 || version === 0x05;
  } catch (error) {
    try {
      // If Base58Check decoding fails, try Bech32 decoding for SegWit addresses
      const decoded = bitcoin.address.fromBech32(address);
      return decoded.prefix === "ltc";
    } catch (error) {
      // If both decodings fail, it's not valid
      return false;
    }
  }
}

export function isBitcoinCashAddressValid({ address }: { address: string }) {
  return isValidCashAddress(address);
}

export function isSolanaAddressValid({
  address,
}: {
  address: string;
}): boolean {
  if (address.length < 32 || address.length > 44) return false;
  try {
    const bytes = bs58.decode(address);
    return bytes.length === 32;
  } catch {
    return false;
  }
}

export function isTonAddressValid({ address }: { address: string }) {
  try {
    Address.parse(address);
    return true;
  } catch {
    return false;
  }
}

export function isXrplAddressValid({ address }: { address: string }) {
  return isValidClassicAddress(address) || isValidXAddress(address);
}
