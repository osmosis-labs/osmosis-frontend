import { PricePretty, IntPretty } from "@keplr-wallet/unit";

export function replaceAt<T>(
  what: T,
  where: Array<T>,
  index: number
): Array<T> {
  where.splice(index, 1, what);
  return [...where];
}

/** Generates a pseudo-random gradient CSS property. Specify a number to generate the same gradient repeatedly. */
export function generateRandom(
  num?: number,
  list = [
    `linear-gradient(180deg, #89eafb 0%, #1377b0 100%)`,
    `linear-gradient(180deg, #00CEBA 0%, #008A7D 100%)`,
    `linear-gradient(180deg, #6976FE 0%, #3339FF 100%)`,
    `linear-gradient(180deg, #0069C4 0%, #00396A 100%)`,
    `linear-gradient(180deg, #FF652D 0%, #FF0000 100%)`,
    `linear-gradient(180deg, #FFBC00 0%, #FF8E00 100%)`,
  ]
) {
  const index = num ?? Math.random() * 10;
  return list[Math.floor(index % list.length)];
}

export function normalize(
  val: number,
  max: number,
  min: number,
  a: number = 0,
  b: number = 1
) {
  return a + ((val - min) * (b - a)) / (max - min);
}

/** Trucates a string with ellipsis, default breakpoint: `num = 8`. */
export function truncateString(str: string, num = 8) {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
}

/** Resolves a promise once desired results have been polled. */
export function poll<TData>({
  fn,
  validate,
  interval = 1_500,
  maxAttempts = 50,
}: {
  /** Polling function. */
  fn: () => Promise<TData>;
  /** Determines if result meets end condition. */
  validate: (data: TData) => boolean;
  /** Gap in MS. */
  interval?: number;
  /** Max number of attempts before finished polling. Leave `undefined` for infinite. */
  maxAttempts?: number;
}) {
  let attempts = 0;

  const executePoll = async (
    resolve: (data: TData) => void,
    reject: (error: Error) => void
  ) => {
    const result = await fn();
    attempts++;

    if (validate(result)) {
      return resolve(result);
    } else if (maxAttempts && attempts === maxAttempts) {
      return reject(new Error(`Exceeded max attempts: ${maxAttempts}`));
    } else {
      setTimeout(executePoll, interval, resolve, reject);
    }
  };

  return new Promise(executePoll);
}

export function getKeyByValue(
  object: { [key: string]: string },
  value: string
) {
  return Object.keys(object).find((key) => object[key] === value);
}

/** Formats a price as compact by default. i.e. $7.53M or $265K. Validate handled by `PricePretty`. */
export function priceFormatter(
  price: PricePretty,
  opts: Intl.NumberFormatOptions = {
    maximumSignificantDigits: 3,
    notation: "compact",
    compactDisplay: "short",
    style: "currency",
    currency: price.fiatCurrency.currency,
  }
): string {
  const formatter = new Intl.NumberFormat(price.fiatCurrency.locale, opts);
  return formatter.format(
    Number(new IntPretty(price).maxDecimals(2).toString().split(",").join(""))
  );
}
