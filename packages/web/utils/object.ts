export function getKeyByValue(
  object: { [key: string]: string },
  value: string
) {
  return Object.keys(object).find((key) => object[key] === value);
}
