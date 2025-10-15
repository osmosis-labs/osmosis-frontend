import { trimZerosFromEnd } from "@osmosis-labs/stores";
import {
  CoinPretty,
  Dec,
  DecUtils,
  IntPretty,
  PricePretty,
  RatePretty,
} from "@osmosis-labs/unit";

import {
  getDecimalCount,
  getNumberMagnitude,
  toScientificNotation,
} from "~/utils/number";

type CustomFormatOpts = {
  maxDecimals: number;
  scientificMagnitudeThreshold: number;
  disabledTrimZeros?: boolean;
};

export type FormatOptions = Partial<
  Intl.NumberFormatOptions & CustomFormatOpts
>;

type FormatOptionsWithDefaults = Partial<Intl.NumberFormatOptions> &
  CustomFormatOpts;

const DEFAULT: CustomFormatOpts = {
  maxDecimals: 2,
  scientificMagnitudeThreshold: 14,
};

/** Formats a pretty object as compact by default. i.e. $7.53M or $265K, or 2K%. Validate handled by pretty object. */
export function formatPretty(
  prettyValue: PricePretty | CoinPretty | RatePretty | Dec | { toDec(): Dec },
  opts: FormatOptions = {}
) {
  const optsWithDefaults: FormatOptionsWithDefaults = {
    ...{ ...DEFAULT },
    ...opts,
  };

  if (
    Math.abs(getNumberMagnitude(prettyValue.toString())) >=
    optsWithDefaults.scientificMagnitudeThreshold
  ) {
    return toScientificNotation(
      prettyValue.toString(),
      optsWithDefaults.maxDecimals
    );
  }

  if (prettyValue instanceof PricePretty) {
    return priceFormatter(prettyValue, optsWithDefaults);
  } else if (prettyValue instanceof CoinPretty) {
    return coinFormatter(prettyValue, optsWithDefaults);
  } else if (prettyValue instanceof RatePretty) {
    return rateFormatter(prettyValue, optsWithDefaults);
  } else if (prettyValue instanceof Dec || "toDec" in prettyValue) {
    return decFormatter(
      prettyValue instanceof Dec ? prettyValue : prettyValue.toDec(),
      optsWithDefaults
    );
  } else {
    throw new Error("Unknown pretty value");
  }
}

/** Formats a dec as compact by default. i.e. $7.53M or $265K. Validate handled by `Dec`. */
function decFormatter(
  dec: Dec,
  opts: FormatOptionsWithDefaults = DEFAULT
): string {
  const options: Intl.NumberFormatOptions = {
    maximumSignificantDigits: 3,
    notation: "compact",
    compactDisplay: "short",
    ...opts,
  };
  const numStr = new IntPretty(dec)
    .maxDecimals(opts.maxDecimals)
    .locale(false)
    .toString();
  let num = Number(numStr);
  num = isNaN(num) ? 0 : num;

  if (hasIntlFormatOptions(opts)) {
    const formatter = new Intl.NumberFormat("en-US", options);

    if (opts.disabledTrimZeros) {
      return formatter.format(num);
    }

    return trimZerosFromEnd(formatter.format(num));
  } else {
    if (opts.disabledTrimZeros) {
      return new IntPretty(dec)
        .maxDecimals(opts.maxDecimals)
        .locale(false)
        .shrink(true)
        .toString();
    }

    return trimZerosFromEnd(
      new IntPretty(dec)
        .maxDecimals(opts.maxDecimals)
        .locale(false)
        .shrink(true)
        .toString()
    );
  }
}

/** Formats a price as compact by default. i.e. $7.53M or $265K. Validate handled by `PricePretty`. */
function priceFormatter(
  price: PricePretty,
  opts: FormatOptionsWithDefaults = DEFAULT
): string {
  const options: Intl.NumberFormatOptions = {
    maximumSignificantDigits: 3,
    notation: "compact",
    compactDisplay: "short",
    style: "currency",
    currency: price.fiatCurrency.currency,
    ...opts,
  };
  let num = Number(
    new IntPretty(price).maxDecimals(opts.maxDecimals).locale(false).toString()
  );
  num = isNaN(num) ? 0 : num;
  const formatter = new Intl.NumberFormat(price.fiatCurrency.locale, options);
  return formatter.format(num);
}

/** Formats a coin as compact by default. i.e. 7.53 ATOM or 265 OSMO. Validate handled by `CoinPretty`. */
function coinFormatter(
  coin: CoinPretty,
  opts: FormatOptionsWithDefaults = DEFAULT
): string {
  const { ...formatOpts } = opts || {};
  const options: Intl.NumberFormatOptions = {
    maximumSignificantDigits: 3,
    notation: "compact",
    compactDisplay: "short",
    style: "decimal",
    ...formatOpts,
  };

  if (hasIntlFormatOptions(opts)) {
    let num = Number(
      new IntPretty(coin).maxDecimals(opts.maxDecimals).locale(false).toString()
    );
    num = isNaN(num) ? 0 : num;
    const formatter = new Intl.NumberFormat("en-US", options);
    return [formatter.format(num), coin.currency.coinDenom.toUpperCase()].join(
      " "
    );
  } else {
    if (coin.toDec().isZero()) return coin.trim(true).shrink(true).toString();
    try {
      const baseAmount = new Dec(coin.toCoin().amount);
      let balanceMaxDecimals = opts.maxDecimals;
      while (
        baseAmount.lt(
          DecUtils.getTenExponentN(
            coin.currency.coinDecimals - balanceMaxDecimals
          )
        )
      )
        balanceMaxDecimals += opts.maxDecimals;

      return coin
        .maxDecimals(balanceMaxDecimals)
        .trim(true)
        .shrink(true)
        .toString();
    } catch (e) {
      return coin
        .maxDecimals(opts.maxDecimals)
        .trim(true)
        .shrink(true)
        .toString();
    }
  }
}

/** Formats a rate as compact by default. i.e. 33%. Validate handled by `RatePretty`. */
function rateFormatter(
  rate: RatePretty,
  opts: FormatOptionsWithDefaults = DEFAULT
): string {
  const options: Intl.NumberFormatOptions = {
    maximumSignificantDigits: 3,
    notation: "compact",
    compactDisplay: "short",
    style: "decimal",
    ...opts,
  };
  let num = Number(
    new RatePretty(rate)
      .maxDecimals(opts.maxDecimals)
      .locale(false)
      .symbol("")
      .toString()
  );
  num = isNaN(num) ? 0 : num;
  const formatter = new Intl.NumberFormat("en-US", options);
  return `${formatter.format(num)}${rate.options.symbol}`;
}

/** Copy opts and remove our custom format opts to reveal whether there are `Intl.NumberFormatOptions`. */
function hasIntlFormatOptions(opts: FormatOptions) {
  const copy = { ...opts };
  if ("maxDecimals" in copy) delete copy.maxDecimals;
  if ("scientificMagnitudeThreshold" in copy)
    delete copy.scientificMagnitudeThreshold;
  return Object.keys(copy).length > 0;
}

/**
 * If a number is less then $100, we only show 4 significant digits, examples:
 *  OSMO: $1.612
 *  AXL: $0.9032
 *  STARS: $0.03673
 *  HUAHUA: $0.00001231
 *
 * If a number is greater or equal to $100, we show a dynamic significant digits based on it's integer part, examples:
 * BTC: $47,334.21
 * ETH: $3,441.15
 */
export function getPriceExtendedFormatOptions(value: Dec): FormatOptions {
  /**
   * We need to know how long the integer part of the number is in order to calculate then how many decimal places.
   */
  const integerPartLength = value.truncate().toString().length ?? 0;

  const maximumSignificantDigits = value.lt(new Dec(100))
    ? 4
    : integerPartLength + 2;

  const minimumDecimals = 2;

  const maxDecimals = Math.max(
    getDecimalCount(parseFloat(value.toString())),
    minimumDecimals
  );

  return {
    maxDecimals,
    notation: "standard",
    maximumSignificantDigits,
    minimumSignificantDigits: maximumSignificantDigits,
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
    disabledTrimZeros: true,
  };
}

const countLeadingZeros = (decimalDigits: string) => {
  let zeroCount = 0;
  for (let i = 0; i < decimalDigits.length; i++) {
    if (decimalDigits[i] === "0") {
      zeroCount++;
    } else {
      break;
    }
  }

  return zeroCount;
};

/** Calculates and returns a price or amount value with the 0s extracted.
 * Useful for displaying 0s as suscript */
export const compressZeros = (
  formattedValue: string,
  hasCurrencySymbol: boolean,
  // The threshold of the leading zeros' count after which the compression should trigger
  zerosThreshold: number = 4
) => {
  // Find the punctuation symbol marking the start of the decimal part
  const punctuationSymbol = formattedValue.match(/[.,]/g)?.pop();

  const significantDigitsSubStart = hasCurrencySymbol ? 1 : 0;
  const currencySign = hasCurrencySymbol ? formattedValue[0] : undefined;

  if (!punctuationSymbol) {
    return {
      currencySign,
      significantDigits: formattedValue.substring(significantDigitsSubStart),
    };
  }
  // Find the index of the punctuation symbol
  const punctIdx = formattedValue.lastIndexOf(punctuationSymbol);

  // If no punctuation symbol found or no zeros after it, return the original value
  if (
    !punctuationSymbol ||
    !formattedValue.includes("0", formattedValue.indexOf(punctuationSymbol))
  ) {
    return {
      currencySign,
      significantDigits: formattedValue.substring(
        significantDigitsSubStart,
        punctIdx
      ),
      zeros: 0,
      decimalDigits: formattedValue.substring(punctIdx + 1),
    };
  }

  // Extract characters after the punctuation symbol
  const charsAfterPunct = formattedValue.slice(punctIdx + 1);

  // Count consecutive zeros
  const zerosCount = countLeadingZeros(charsAfterPunct);

  if (zerosCount < zerosThreshold)
    return {
      currencySign,
      significantDigits: formattedValue.substring(
        significantDigitsSubStart,
        punctIdx
      ),
      zeros: 0,
      decimalDigits: charsAfterPunct,
    };

  const otherDigits = charsAfterPunct.substring(zerosCount);

  const canDisplayZeros = zerosCount !== 0 || otherDigits.length !== 0;

  return {
    currencySign,
    significantDigits: formattedValue.substring(
      significantDigitsSubStart,
      punctIdx
    ),
    zeros: canDisplayZeros ? zerosCount : 0,
    decimalDigits: otherDigits,
  };
};

/**
 * Formats a fiat price using `getPriceExtendedFormatOptions` and displays `<0.01` if the price is less than $0.01.
 * Rounds to the provided `maxDecimals` parameter.
 */
export function formatFiatPrice(price: PricePretty, maxDecimals = 2) {
  if (price.toDec().isZero()) return "$0";

  if (price.toDec().lt(new Dec(0.01))) {
    return "<$0.01";
  }

  if (price.toDec().gte(new Dec(1000000000))) {
    return ">$1B";
  }

  const splitDec = price.toDec().toString().split(".");
  const maxDecimalStr = splitDec[0] + "." + splitDec[1].slice(0, maxDecimals);
  const maxDecimalPrice = new PricePretty(
    price.fiatCurrency,
    new Dec(maxDecimalStr)
  );

  const splitPretty = formatPretty(maxDecimalPrice, {
    ...getPriceExtendedFormatOptions(maxDecimalPrice.toDec()),
  }).split(".");

  return splitPretty[0] + "." + splitPretty[1].slice(0, maxDecimals);
}

/**
 * Returns the full unformatted decimal value as a string, trimming only trailing zeros.
 * Used for tooltips to show the complete precision.
 */
export function getFullPrecisionPrice(price: Dec): string {
  if (price.isZero()) return "0";

  const priceStr = price.toString();
  const [integerPart, decimalPart] = priceStr.split(".");

  if (!decimalPart) return integerPart;

  // Trim only trailing zeros
  const trimmedDecimal = decimalPart.replace(/0+$/, "");

  if (trimmedDecimal === "") return integerPart;

  return `${integerPart}.${trimmedDecimal}`;
}

/**
 * Formats a price preserving the user's original precision.
 * Shows up to 3 significant decimal places (non-zero), truncating (not rounding).
 * - Numbers under 10: maintain at least 2 decimal places (e.g., "5.00", "7.50")
 * - Whole numbers >= 10: no decimal places (e.g., "40", "100")
 * - Numbers with decimals: preserve up to 3 significant decimals
 * - Numbers very close to whole numbers (like 99.999 or 100.001) round to the nearest whole
 */
export function formatPriceWithUserPrecision(price: Dec): string {
  if (price.isZero()) return "0";

  const priceStr = price.toString();
  const [integerPart, decimalPart] = priceStr.split(".");

  const integerValue = parseInt(integerPart, 10);

  // No decimal part - it's a whole number
  if (!decimalPart) {
    if (integerValue >= 10) {
      return integerPart;
    } else {
      return `${integerPart}.00`;
    }
  }

  // Trim trailing zeros to see if it's actually a whole number
  const trimmedDecimal = decimalPart.replace(/0+$/, "");

  if (trimmedDecimal === "") {
    // It's a whole number (like "100.000")
    if (integerValue >= 10) {
      return integerPart;
    } else {
      return `${integerPart}.00`;
    }
  }

  // Count significant (non-zero) decimal places
  let significantDecimals = 0;
  let truncateAtIndex = -1;

  for (let i = 0; i < trimmedDecimal.length; i++) {
    if (trimmedDecimal[i] !== "0") {
      significantDecimals++;
      if (significantDecimals === 3) {
        truncateAtIndex = i;
        break;
      }
    }
  }

  let resultDecimal: string;

  if (truncateAtIndex === -1) {
    // 3 or fewer significant decimals - use as is
    resultDecimal = trimmedDecimal;
  } else {
    // More than 3 significant decimals - truncate at 3rd
    resultDecimal = trimmedDecimal.substring(0, truncateAtIndex + 1);
  }

  // Check if after truncation, we're very close to a whole number
  // The threshold scales with magnitude: 1.0001, 10.001, 100.01, etc.
  const reconstructed = `${integerPart}.${resultDecimal}`;
  const numericValue = parseFloat(reconstructed);
  const roundedWhole = Math.round(numericValue);

  // Don't round to 0
  if (roundedWhole === 0) {
    // For numbers < 10, ensure at least 2 decimal places
    if (integerValue < 10 && parseInt(integerPart, 10) === integerValue) {
      const minDecimalPlaces = 2;
      resultDecimal = resultDecimal.padEnd(minDecimalPlaces, "0");
    }
    return `${integerPart}.${resultDecimal}`;
  }

  // Determine threshold based on magnitude: 0.0001 for [1-10), 0.001 for [10-100), 0.01 for [100+)
  let threshold: number;
  if (roundedWhole < 10) {
    threshold = 0.0001; // 1.0001
  } else if (roundedWhole < 100) {
    threshold = 0.001; // 10.001
  } else {
    threshold = 0.01; // 100.01
  }

  // If we're within threshold of a whole number and all visible decimals are 9s or 0s, round to whole
  if (Math.abs(numericValue - roundedWhole) < threshold) {
    // Check if the decimal is all 9s (like .999) or very small (like .001)
    if (
      /^9+$/.test(resultDecimal) ||
      parseFloat(`0.${resultDecimal}`) < threshold
    ) {
      if (roundedWhole >= 10) {
        return String(roundedWhole);
      } else {
        return `${roundedWhole}.00`;
      }
    }
  }

  // For numbers < 10, ensure at least 2 decimal places
  if (integerValue < 10 && parseInt(integerPart, 10) === integerValue) {
    const minDecimalPlaces = 2;
    resultDecimal = resultDecimal.padEnd(minDecimalPlaces, "0");
  }

  return `${integerPart}.${resultDecimal}`;
}

export function calcFontSize(numChars: number, isMobile: boolean): string {
  const sizeMapping: { [key: number]: string } = isMobile
    ? {
        7: "30px",
        12: "18px",
        16: "16px",
      }
    : {
        7: "48px",
        12: "38px",
        16: "28px",
        33: "24px",
      };
  for (const [key, value] of Object.entries(sizeMapping)) {
    if (numChars <= Number(key)) {
      return value;
    }
  }

  return "16px";
}
