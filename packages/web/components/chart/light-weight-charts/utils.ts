import { Dec } from "@keplr-wallet/unit";

import { formatPretty, getPriceExtendedFormatOptions } from "~/utils/formatter";
import { getDecimalCount } from "~/utils/number";

export const priceFormatter = (price: number) => {
  const minimumDecimals = 2;
  const maxDecimals = Math.max(getDecimalCount(price), minimumDecimals);

  const priceDec = new Dec(price);

  const formatOpts = getPriceExtendedFormatOptions(priceDec);

  return formatPretty(priceDec, {
    maxDecimals,
    currency: "USD",
    style: "currency",
    ...formatOpts,
  });
};
