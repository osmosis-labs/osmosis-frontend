export function getKeyByValue<Dict extends Record<string, string>>(
  object: Dict,
  value: keyof Dict
): string | undefined {
  return Object.keys(object).find((key) => object[key] === value);
}

export function parseObjectValues<T extends Record<any, any>>(
  obj: Record<string, any>
): T {
  const parsedObj = {} as T;
  for (const key in obj) {
    try {
      parsedObj[key as keyof T] = JSON.parse(obj[key]);
    } catch (e) {
      parsedObj[key as keyof T] = obj[key];
    }
  }
  return parsedObj;
}

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
