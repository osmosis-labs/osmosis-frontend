/** Generate a random string of characters. Useful for unique ids */
export function generateUniqueId() {
  return Math.random().toString(36).substring(2, 9);
}
