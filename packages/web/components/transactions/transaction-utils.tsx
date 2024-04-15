import { FormattedTransaction } from "@osmosis-labs/server";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import relativeTime from "dayjs/plugin/relativeTime";

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

export const formatDate = (dateString: string) => {
  const date = dayjs(dateString);
  if (date.isToday()) return "Earlier Today";
  if (date.isYesterday()) return "Yesterday";
  if (date.isSame(dayjs(), "year")) return date.format("MMMM D");
  return date.format("MMMM D, YYYY");
};
