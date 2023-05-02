export function getKeyByValue(
  object: { [key: string]: string },
  value: string
) {
  return Object.keys(object).find((key) => object[key] === value);
}

// Written by chatgpt:
/**
 * Recursively searches through a tree structure and returns all objects that are instances of a given class.
 * @param root The root object of the tree structure to search.
 * @param targetClass The class constructor function to search for.
 * @returns An array of objects that are instances of the target class.
 */
export function getObjectsByClass<T>(
  root: any,
  targetClass: new (...args: any[]) => T
): T[] {
  let results: T[] = [];

  // Base case: return an empty array if the root object is null or undefined
  if (!root) {
    return results;
  }

  // If the current object is an instance of the target class, add it to the results array
  if (root instanceof targetClass) {
    results.push(root);
  }

  // Recursively search through the keys of the current object
  for (let key in root) {
    if (typeof root[key] === "object") {
      let childResults = getObjectsByClass(root[key], targetClass);
      results = results.concat(childResults);
    }
  }

  return results;
}
