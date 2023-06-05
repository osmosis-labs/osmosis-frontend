import {
  CoinPretty,
  IntPretty,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";

/** Formats a pretty object as compact by default. i.e. $7.53M or $265K, or 2K%. Validate handled by pretty object. */
export function formatPretty(
  prettyValue: PricePretty | CoinPretty | RatePretty,
  opts?: Partial<Intl.NumberFormatOptions>
) {
  const { ...formatOpts } = opts || {};
  if (prettyValue instanceof PricePretty) {
    return priceFormatter(prettyValue, opts ?? formatOpts);
  } else if (prettyValue instanceof CoinPretty) {
    return coinFormatter(prettyValue, opts ?? { ...formatOpts });
  } else if (prettyValue instanceof RatePretty) {
    return rateFormatter(prettyValue, opts ?? formatOpts);
  } else {
    throw new Error("Unknown pretty value");
  }
}

/** Formats a price as compact by default. i.e. $7.53M or $265K. Validate handled by `PricePretty`. */
function priceFormatter(
  price: PricePretty,
  opts?: Partial<Intl.NumberFormatOptions>
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
    new IntPretty(price).maxDecimals(2).locale(false).toString()
  );
  num = isNaN(num) ? 0 : num;
  const formatter = new Intl.NumberFormat(price.fiatCurrency.locale, options);
  return formatter.format(num);
}

/** Formats a coin as compact by default. i.e. $7.53 ATOM or $265 OSMO. Validate handled by `CoinPretty`. */
function coinFormatter(
  coin: CoinPretty,
  opts?: Partial<Intl.NumberFormatOptions> & {
    hideCoinDenom?: boolean;
    maxDecimals?: number;
  }
): string {
  const { ...formatOpts } = opts || {};
  const options: Intl.NumberFormatOptions = {
    maximumSignificantDigits: 3,
    notation: "compact",
    compactDisplay: "short",
    style: "decimal",
    ...formatOpts,
  };
  let num = Number(new IntPretty(coin).maxDecimals(2).locale(false).toString());
  num = isNaN(num) ? 0 : num;
  const formatter = new Intl.NumberFormat("en-US", options);
  return [formatter.format(num), coin.currency.coinDenom.toUpperCase()].join(
    " "
  );
}

/** Formats a coin as compact by default. i.e. $7.53 ATOM or $265 OSMO. Validate handled by `CoinPretty`. */
function rateFormatter(
  rate: RatePretty,
  opts?: Partial<Intl.NumberFormatOptions>
): string {
  const options: Intl.NumberFormatOptions = {
    maximumSignificantDigits: 3,
    notation: "compact",
    compactDisplay: "short",
    style: "decimal",
    ...opts,
  };
  let num = Number(
    new RatePretty(rate).maxDecimals(2).locale(false).symbol("").toString()
  );
  num = isNaN(num) ? 0 : num;
  const formatter = new Intl.NumberFormat("en-US", options);
  return `${formatter.format(num)}${rate.options.symbol}`;
}
