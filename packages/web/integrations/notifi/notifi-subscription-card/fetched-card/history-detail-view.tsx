import dayjs from "dayjs";
import { FunctionComponent, useMemo } from "react";
import { useTranslation } from "react-multi-lang";

import { HistoryRowData } from "~/integrations/notifi/notifi-subscription-card/fetched-card/history-rows";

interface Props {
  historyRowData: HistoryRowData;
}

export const HistoryDetailView: FunctionComponent<Props> = ({
  historyRowData,
}) => {
  const t = useTranslation();
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
      : dayjs(historyRowData.createdDate).format("MMMM D");
    let title = "";
    let message = "";
    switch (historyRowData.detail?.__typename) {
      case "BroadcastMessageEventDetails":
        title = historyRowData.detail.subject || t("notifi.emptyHistoryTitle");
        message =
          historyRowData.detail.message || t("notifi.emptyHistoryMessage");
        break;

      case "GenericEventDetails":
        title =
          historyRowData.detail.sourceName || t("notifi.emptyHistoryTitle");
        message =
          historyRowData.detail.notificationTypeName ||
          t("notifi.emptyHistoryMessage");
        break;

      default:
        title = t("notifi.unsupportedHistoryTitle");
        message = t("notifi.unsupportedHistoryMessage");
        break;
    }
    return { title, timestamp, message };
  }, [historyRowData]);
  return (
    <>
      <div className=" flex flex-col px-[2rem]">
        <div className="mb-5 flex flex-row items-center justify-between">
          <div className="col-span-2 text-subtitle1">{title}</div>
          <div className="col-span-1 text-right text-caption opacity-[0.7]">
            {timestamp}
          </div>
        </div>

        <div className="whitespace-pre-wrap break-words text-caption text-osmoverse-200">
          {message}
        </div>
      </div>
    </>
  );
};
