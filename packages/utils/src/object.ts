/** Function to get nested property value from an object using a string "."-delimited (default) keyPath */
export function getDeepValue<ReturnValue = any>(
  obj: any,
  keyPath?: string,
  delim = "."
): ReturnValue | undefined {
  if (!keyPath || !obj) return undefined;

  // Split the keyPath by '.' to get an array of keys
  // Then use reduce to traverse the object
  // If at any point it encounters an undefined value, it will return an empty object to prevent a TypeError
  return keyPath.split(delim).reduce((o, k) => (o || {})[k], obj);
}
