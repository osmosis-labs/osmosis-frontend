import { Dec } from "@keplr-wallet/unit";

import { formatPretty } from "~/utils/formatter";

export const priceFormatter = (price: number) => {
  const priceDec = new Dec(price);

  return formatPretty(priceDec, {
    currency: "USD",
    style: "currency",
    maxDecimals: 3,
    minimumSignificantDigits: 3,
    disabledTrimZeros: true,
  });
};
