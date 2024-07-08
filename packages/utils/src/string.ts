import * as cosmjsEncoding from "@cosmjs/encoding";
import * as viem from "viem";

/** Trucates a string with ellipsis, default breakpoint: `num = 8`. */
export function truncateString(str: string, num = 8) {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
}

export function getShortAddress(
  address: string,
  opts?: { prefixLength?: number; suffixLength?: number }
) {
  if (!address) return "";
  return (
    address.substring(0, opts?.prefixLength ?? 6) +
    "..." +
    address.substring(
      address.length - (opts?.suffixLength ?? 5),
      address.length
    )
  );
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
