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
  return (
    address.substring(0, opts?.prefixLength ?? 6) +
    "..." +
    address.substring(
      address.length - (opts?.suffixLength ?? 5),
      address.length
    )
  );
}
