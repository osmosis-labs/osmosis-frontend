import { FormattedTransaction } from "@osmosis-labs/server";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import relativeTime from "dayjs/plugin/relativeTime";
import { useTranslation } from "hooks";

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
