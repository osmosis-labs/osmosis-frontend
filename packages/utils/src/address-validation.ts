// Chain-specific address validators. Kept apart from ./string so importing
// light helpers like `truncate` doesn't pull the TON/Bitcoin/XRPL libraries
// into the shared client bundle.
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

/** CRC16-XMODEM, as TON user-friendly addresses use for their checksum. */
function tonCrc16(data: Uint8Array): number {
  let crc = 0;
  for (const byte of data) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc;
}

const TON_BOUNCEABLE_TAG = 0x11;
const TON_NON_BOUNCEABLE_TAG = 0x51;
const TON_TEST_FLAG = 0x80;

/**
 * Accepts what `Address.parse` from `@ton/core` accepts, without pulling that
 * library in: the raw form `<workchain>:<64 hex>`, or the 48-character
 * user-friendly form (base64 or base64url of tag, workchain, 32-byte hash and
 * a CRC16 checksum).
 */
export function isTonAddressValid({ address }: { address: string }) {
  if (address.includes(":")) {
    const [workchain, hash, ...rest] = address.split(":");
    return (
      rest.length === 0 &&
      Number.isInteger(parseFloat(workchain)) &&
      /^[0-9a-fA-F]{64}$/.test(hash)
    );
  }

  if (address.length !== 48 || !/^[A-Za-z0-9+/_-]+$/.test(address)) {
    return false;
  }
  let bytes: Uint8Array;
  try {
    bytes = Uint8Array.from(
      atob(address.replace(/-/g, "+").replace(/_/g, "/")),
      (char) => char.charCodeAt(0)
    );
  } catch {
    return false;
  }
  if (bytes.length !== 36) return false;

  const tag = bytes[0] & ~TON_TEST_FLAG;
  if (tag !== TON_BOUNCEABLE_TAG && tag !== TON_NON_BOUNCEABLE_TAG)
    return false;

  const crc = tonCrc16(bytes.subarray(0, 34));
  return bytes[34] === crc >> 8 && bytes[35] === (crc & 0xff);
}

export function isXrplAddressValid({ address }: { address: string }) {
  return isValidClassicAddress(address) || isValidXAddress(address);
}
