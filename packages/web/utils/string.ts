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
