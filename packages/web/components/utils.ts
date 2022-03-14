export function replaceAt<T>(
  what: T,
  where: Array<T>,
  index: number
): Array<T> {
  where.splice(index, 1, what);
  return [...where];
}

/** Generates a pseudo-random gradient CSS property. Specify a number to generate the same gradient repeatedly. */
export function generateGradient(num?: number) {
  const LINEAR_GRADIENT_LIST = [
    `linear-gradient(180deg, #89eafb 0%, #1377b0 100%)`,
    `linear-gradient(180deg, #00CEBA 0%, #008A7D 100%)`,
    `linear-gradient(180deg, #6976FE 0%, #3339FF 100%)`,
    `linear-gradient(180deg, #0069C4 0%, #00396A 100%)`,
    `linear-gradient(180deg, #FF652D 0%, #FF0000 100%)`,
    `linear-gradient(180deg, #FFBC00 0%, #FF8E00 100%)`,
  ];
  return LINEAR_GRADIENT_LIST[
    Math.floor((num ?? Math.random() * 10) % LINEAR_GRADIENT_LIST.length)
  ];
}
