import { Dec } from "@keplr-wallet/unit";
import { isBusinessDay, Time } from "lightweight-charts";

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

export const timepointToString = (
  timePoint: Time,
  formatOptions: Intl.DateTimeFormatOptions,
  locale?: string
) => {
  let date = new Date();

  if (typeof timePoint === "string") {
    date = new Date(timePoint);
  } else if (!isBusinessDay(timePoint)) {
    date = new Date((timePoint as number) * 1000);
  } else {
    date = new Date(
      Date.UTC(timePoint.year, timePoint.month - 1, timePoint.day)
    );
  }

  return date.toLocaleString(locale, formatOptions);
};
