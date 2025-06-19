import * as cosmjsEncoding from "@cosmjs/encoding";
import { Address } from '@ton/core';
import * as bitcoin from "bitcoinjs-lib";
import bs58check from "bs58check";
import WAValidator from 'multicoin-address-validator';
import * as viem from "viem";
/** Trucates a string with ellipsis, default breakpoint: `num = 8`. */
export function truncate(str: string, num = 8) {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
}

/**
 * Shorten a string with truncation in the middle.
 * Example: `ibc/EA...25DC5`
 */
export function shorten(
  string: string,
  opts?: { prefixLength?: number; suffixLength?: number; delim?: string }
) {
  if (!string) return "";
  if (string.length <= (opts?.prefixLength ?? 6) + (opts?.suffixLength ?? 5)) {
    return string;
  }

  const prefix = string.substring(0, opts?.prefixLength ?? 6);
  const suffix = string.substring(
    string.length - (opts?.suffixLength ?? 5),
    string.length
  );

  return prefix + (opts?.delim ?? "...") + suffix;
}

export const formatICNSName = (name?: string, maxLength = 28) => {
  if (!name) return undefined;
  if (name.length <= maxLength) return name;

  const nameParts = name.split(".");
  const userName = nameParts[0];
  const chain = nameParts[1];

  return (
    userName.substring(0, 10) +
    "..." +
    userName.substring(userName.length - 5, userName.length) +
    "." +
    chain
  );
};

export const normalizeUrl = (url: string): string => {
  // Remove "https://", "http://", "www.", and trailing slashes
  url = url.replace(/^https?:\/\//, "");
  url = url.replace(/^www\./, "");
  url = url.replace(/\/$/, "");
  return url;
};

export const ellipsisText = (str: string, maxLength: number): string => {
  if (!str) return "";
  const trimmedStr = str.trim();
  if (str.length > maxLength) {
    return trimmedStr.slice(0, maxLength - 3).concat("...");
  }
  return trimmedStr;
};

export const camelCaseToSnakeCase = (input: string) => {
  return input.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
};

export function isEvmAddressValid({ address }: { address: string }): boolean {
  return viem.isAddress(address);
}

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

export function isCosmosAddressValid({
  address,
  bech32Prefix,
}: {
  address: string;
  bech32Prefix: string;
}): boolean {
  try {
    const { prefix, data } = cosmjsEncoding.fromBech32(address);
    if (prefix !== bech32Prefix) {
      return false;
    }
    return data.length === 20;
  } catch {
    return false;
  }
}

export function deriveCosmosAddress({
  address,
  desiredBech32Prefix,
}: {
  address: string;
  desiredBech32Prefix: string;
}) {
  const { data } = cosmjsEncoding.fromBech32(address);
  return cosmjsEncoding.toBech32(desiredBech32Prefix, data);
}

export function camelToKebabCase(str: string): string {
  return str
    .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
    .replace(/^-/, "");
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

export function isAddressValidByWA({ address, waSymbol, env }: { address: string; waSymbol: string; env: "mainnet" | "testnet"; }) {
  return WAValidator.validate(address, waSymbol, {
    networkType: env === 'mainnet' ? 'prod' : 'testnet',
  });
}

export function isTonAddressValid({ address }: { address: string }) {
  try {
    Address.parse(address);
    return true;
  } catch {
    return false;
  }
}
