import { PricePretty } from "@keplr-wallet/unit";
import { Dec } from "@keplr-wallet/unit";
import { FormattedTransaction } from "@osmosis-labs/server";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import relativeTime from "dayjs/plugin/relativeTime";
import { useTranslation } from "hooks";

import { MultiLanguageT } from "~/hooks";

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

export const groupTransactionsByDate = (
  transactions: FormattedTransaction[]
): Record<string, FormattedTransaction[]> => {
  return transactions.reduce((acc, transaction) => {
    // extract date from block timestamp
    const date = dayjs(transaction.blockTimestamp).format("YYYY-MM-DD");

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(transaction);

    return acc;
  }, {} as Record<string, FormattedTransaction[]>);
};

export const useFormatDate = () => {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    const date = dayjs(dateString);
    if (date.isToday()) return t("date.earlierToday");
    if (date.isYesterday()) return t("date.yesterday");

    const month = date.format("MMMM");

    if (date.isSame(dayjs(), "year")) return `${month} ${date.format("D")}`;

    return `${month} ${date.format("D, YYYY")}`;
  };

  return formatDate;
};

export const displayFiatPrice = (
  value: PricePretty | undefined,
  prefix: "-" | "+" | "",
  t: MultiLanguageT
): string => {
  if (value === undefined || value?.toDec().equals(new Dec(0)))
    return t("transactions.noPriceData");

  const decValue = value.toDec();
  const symbol = value.symbol;

  if (decValue.lt(new Dec(0.01))) {
    return `${prefix} <${symbol}0.01`;
  }

  // Convert displayValue to a fixed 2-decimal place string
  const formattedDisplayValue = `${prefix} ${symbol}${Number(
    decValue.toString()
  ).toFixed(2)}`;

  return formattedDisplayValue;
};
