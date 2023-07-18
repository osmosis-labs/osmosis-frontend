import dayjs from "dayjs";
import { FunctionComponent, useMemo } from "react";

import { HistoryRowData } from "./history-rows";

interface Props {
  historyRowData: HistoryRowData;
}

export const HistoryDetailView: FunctionComponent<Props> = ({
  historyRowData,
}) => {
  const { title, timestamp, message } = useMemo(() => {
    const isToday = dayjs(historyRowData.createdDate).isAfter(
      dayjs(Date.now()).subtract(1, "day")
    );
    const isYesterday =
      dayjs(historyRowData.createdDate).isAfter(
        dayjs(Date.now()).subtract(2, "day")
      ) && !isToday;
    const timestamp = isToday
      ? dayjs(historyRowData.createdDate).format("h:mm A")
      : isYesterday
      ? "Yesterday"
      : dayjs(historyRowData.createdDate).format("MMMM D, YYYY h:mm A");
    let title = "";
    let message = "";
    switch (historyRowData.detail?.__typename) {
      case "BroadcastMessageEventDetails":
        title = historyRowData.detail.subject || "No title";
        message = historyRowData.detail.message || "No message";
        break;

      case "GenericEventDetails":
        title = historyRowData.detail.sourceName || "No title";
        message = historyRowData.detail.notificationTypeName || "No message";
        break;

      default:
        title = "Unsupported Notification";
        message = "Oops, something went wrong. Please let us know";
        break;
    }
    return { title, timestamp, message };
  }, [historyRowData]);
  return (
    <>
      <div className=" flex flex-col px-[32px]">
        <div className="mb-5 flex flex-row items-center justify-between">
          <div className="font-600 col-span-2 text-[16px]">{title}</div>
          <div className="font-500 font-500 col-span-1 text-right text-[12px] opacity-[0.7]">
            {timestamp}
          </div>
        </div>

        <div className="font-500 text-[12px] text-osmoverse-200">{message}</div>
      </div>
    </>
  );
};
