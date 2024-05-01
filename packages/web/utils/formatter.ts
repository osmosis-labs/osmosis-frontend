import {
  CoinPretty,
  Dec,
  DecUtils,
  IntPretty,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
import { trimZerosFromEnd } from "@osmosis-labs/stores";

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

/** Formats a coin with given decimals depending on if coin amount is greater or less than one.
 *  Ex: `1.23` at 2 decimals or `0.000023` at 6 decimals. Default: above 2, below 6. */
export function formatCoinMaxDecimalsByOne(
  coin?: CoinPretty,
  aboveOneMaxDecimals = 2,
  belowOneMaxDecimals = 6
) {
  if (!coin) return "";
  return coin.toDec().gt(new Dec(1))
    ? coin.maxDecimals(aboveOneMaxDecimals).trim(true).toString()
    : coin.maxDecimals(belowOneMaxDecimals).trim(true).toString();
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
