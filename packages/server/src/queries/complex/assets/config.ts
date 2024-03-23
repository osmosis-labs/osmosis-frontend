import { FiatCurrency } from "@keplr-wallet/types";

/** Use to specify the display properties for `PricePretty`. */
export const DEFAULT_VS_CURRENCY: FiatCurrency = {
  currency: "usd",
  symbol: "$",
  maxDecimals: 2,
  locale: "en-US",
};
