/** Generate a random string of characters. Useful for unique ids */
export function generateUniqueId() {
  return Math.random().toString(36).substring(2, 9);
}

/** Trucates a string with ellipsis, default breakpoint: `num = 8`. */
export function truncateString(str: string, num = 8) {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
}
