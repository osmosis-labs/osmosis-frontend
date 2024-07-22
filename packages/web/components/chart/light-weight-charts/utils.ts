import { Dec } from "@keplr-wallet/unit";
import { isBusinessDay, Time } from "lightweight-charts";

import { FormatOptions, formatPretty } from "~/utils/formatter";
import { getDecimalCount } from "~/utils/number";

export const priceFormatter = (price: number) => {
  const minimumDecimals = 2;
  const maxDecimals = Math.max(getDecimalCount(price), minimumDecimals);

  /**
   * Exclude negative and small values
   */
  if (price < 0 || price < 10e-17) {
    return "";
  }

  const priceDec = new Dec(price);

  const formatOpts: FormatOptions = {
    notation: "compact",
  };

  return formatPretty(priceDec, {
    maxDecimals,
    currency: "USD",
    style: "currency",
    ...formatOpts,
  });
};

export const timepointToDate = (timePoint: Time) => {
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

  return date;
};

export const timepointToString = (
  timePoint: Time,
  formatOptions: Intl.DateTimeFormatOptions,
  locale?: string
) => {
  const date = timepointToDate(timePoint);

  return date.toLocaleString(locale, formatOptions);
};
