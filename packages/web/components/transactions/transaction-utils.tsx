import { FormattedTransaction } from "@osmosis-labs/server";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import relativeTime from "dayjs/plugin/relativeTime";
import { MultiLanguageT, useTranslation } from "hooks";

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

// input: string month like "January", "February", ...
// note - inlang linter requires direct references to months like t("date.january")
export const getMonthTranslation = (month: string, t: MultiLanguageT) => {
  if (month === "January") return t("date.january");
  if (month === "February") return t("date.february");
  if (month === "March") return t("date.march");
  if (month === "April") return t("date.april");
  if (month === "May") return t("date.may");
  if (month === "June") return t("date.june");
  if (month === "July") return t("date.july");
  if (month === "August") return t("date.august");
  if (month === "September") return t("date.september");
  if (month === "October") return t("date.october");
  if (month === "November") return t("date.november");
  if (month === "December") return t("date.december");
  return "";
};

export const useFormatDate = () => {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    const date = dayjs(dateString);
    if (date.isToday()) return t("date.earlierToday");
    if (date.isYesterday()) return t("date.yesterday");

    const month = date.format("MMMM");
    const monthTranslation = getMonthTranslation(month, t);

    if (date.isSame(dayjs(), "year"))
      return `${monthTranslation} ${date.format("D")}`;

    return `${monthTranslation} ${date.format("D, YYYY")}`;
  };

  return formatDate;
};
