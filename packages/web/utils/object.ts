export function getKeyByValue(
  object: { [key: string]: string },
  value: string
) {
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
