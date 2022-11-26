import { PricePretty, IntPretty } from "@keplr-wallet/unit";

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
