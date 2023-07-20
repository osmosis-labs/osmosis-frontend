import {
  CoinPretty,
  Dec,
  DecUtils,
  IntPretty,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
import { trimZerosFromEnd } from "@osmosis-labs/stores";

import { getNumberMagnitude, toScientificNotation } from "~/utils/number";

type FormatOptions = Partial<
  Intl.NumberFormatOptions & { maxDecimals: number }
>;

type FormatOptionsWithDefaults = Partial<Intl.NumberFormatOptions> & {
  maxDecimals: number;
};

const DEFAULT = {
  maxDecimals: 2,
};

/** Formats a pretty object as compact by default. i.e. $7.53M or $265K, or 2K%. Validate handled by pretty object. */
export function formatPretty(
  prettyValue: PricePretty | CoinPretty | RatePretty | Dec,
  opts: FormatOptions = {}
) {
  const optsWithDefaults: FormatOptionsWithDefaults = {
    ...{ ...DEFAULT },
    ...opts,
  };

  if (Math.abs(getNumberMagnitude(prettyValue.toString())) > 14) {
    return toScientificNotation(prettyValue.toString());
  }

  if (prettyValue instanceof PricePretty) {
    return priceFormatter(prettyValue, optsWithDefaults);
  } else if (prettyValue instanceof CoinPretty) {
    return coinFormatter(prettyValue, optsWithDefaults);
  } else if (prettyValue instanceof RatePretty) {
    return rateFormatter(prettyValue, optsWithDefaults);
  } else if (prettyValue instanceof Dec) {
    return decFormatter(prettyValue, optsWithDefaults);
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
    return trimZerosFromEnd(formatter.format(num));
  } else {
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
    if (coin.toDec().equals(new Dec(0))) return coin.shrink(true).toString();

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

    return coin.maxDecimals(balanceMaxDecimals).shrink(true).toString();
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
  return Object.keys(copy).length > 0;
}
