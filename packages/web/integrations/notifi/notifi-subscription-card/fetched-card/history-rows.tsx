import { NotifiFrontendClient } from "@notifi-network/notifi-frontend-client";
import { useRouter } from "next/router";
import { FunctionComponent, useCallback } from "react";

import { Icon } from "~/components/assets";
import Spinner from "~/components/spinner";
import { EventName } from "~/config";
import { useTranslation } from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks";
import {
  DisplayingView,
  DummyRow,
  useHistoryDetailContents,
} from "~/integrations/notifi/hooks/use-history-detail-contents";
import { useNotifiModalContext } from "~/integrations/notifi/notifi-modal-context";
import { HistoryEmpty } from "~/integrations/notifi/notifi-subscription-card/fetched-card/history-empty";

export type HistoryRowData = NonNullable<
  NonNullable<
    Awaited<ReturnType<NotifiFrontendClient["getFusionNotificationHistory"]>>
  >["nodes"]
>[number];

type HistoryRowsProps = {
  rows: ReadonlyArray<HistoryRowData | DummyRow>;
  hasNextPage: boolean;
  loadMore: () => void;
  isLoadingMore: boolean;
};

export const HistoryRows: FunctionComponent<HistoryRowsProps> = ({
  rows,
  hasNextPage,
  loadMore,
  isLoadingMore,
}) => {
  const { t } = useTranslation();
  return (
    <>
      {rows.length > 0 ? (
        <div className="h-full overflow-scroll">
          <ul>
            {rows.map((row, key) => {
              return <HistoryRow key={key} row={row} />;
            })}
          </ul>
          {hasNextPage && rows.length > 0 ? (
            <div
              className="my-auto h-[2rem] w-full cursor-pointer bg-osmoverse-700 py-1 text-center"
              onClick={loadMore}
            >
              {isLoadingMore ? (
                <Spinner className="text-white-full" />
              ) : (
                t("notifi.loadMore")
              )}
            </div>
          ) : null}
        </div>
      ) : (
        <HistoryEmpty />
      )}
    </>
  );
};

type HistoryRowProps = {
  row: HistoryRowData | DummyRow;
};

const validateHistoryRow = (
  row: HistoryRowData | DummyRow
): row is HistoryRowData => {
  return row.__typename !== "DummyRow";
};

export const HistoryRow: FunctionComponent<HistoryRowProps> = ({ row }) => {
  const {
    renderView,
    selectedHistoryEntry,
    setSelectedHistoryEntry,
    closeCard,
    setIsOverLayEnabled,
  } = useNotifiModalContext();
  const router = useRouter();
  const { logEvent } = useAmplitudeAnalytics();

  const { emoji, title, message, cta, timestamp, popOutUrl } =
    useHistoryDetailContents(row, DisplayingView.HistoryRows);

  const handleClick = useCallback(() => {
    setIsOverLayEnabled(false);

    if (popOutUrl) {
      if (popOutUrl.startsWith("/")) {
        router.push(popOutUrl);
        closeCard?.();
        return;
      }
      router.push(popOutUrl);
      return;
    }

    if (validateHistoryRow(row)) {
      setSelectedHistoryEntry(row);
      renderView("historyDetail");
      return;
    }
    // Dummy Row
    row.onCtaClick();
  }, [renderView, popOutUrl, selectedHistoryEntry]);

  return (
    <li className="item-center flex flex-row border-b border-osmoverse-700 px-[2rem] py-[1.125rem]">
      <div className="m-auto mr-[1.25rem] flex-1 ">{emoji}</div>
      <div className="flex w-full flex-col">
        <div className="mb-[0.25rem] flex w-full justify-between">
          <div className="max-w-sm text-subtitle1">{title}</div>
          <div
            className="flex h-[1.5rem] max-w-[5.5625rem] cursor-pointer items-center text-wosmongton-200 transition-all duration-[0.2s] hover:scale-[105%] hover:text-osmoverse-200"
            onClick={() => {
              logEvent([EventName.Notifications.alertClicked]);

              handleClick();
            }}
          >
            <div className="text-button font-[700] ">{cta}</div>
            <Icon
              id={"arrow-right"}
              className=" scale-[60%] "
              height={24}
              width={24}
            />
          </div>
        </div>
        <div className="flex w-full items-center justify-between text-caption font-[500]">
          <div
            className="max-w-[13.75rem] whitespace-pre-wrap break-words text-osmoverse-200 sm:max-w-[9rem]"
            // To avoid installing extra tailwind utils lib, in-line style is adopted here
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: "2",
              overflow: "hidden",
            }}
            dangerouslySetInnerHTML={{ __html: message }}
          />

          <div className="col-span-1 text-right text-osmoverse-200">
            {timestamp}
          </div>
        </div>
      </div>
    </li>
  );
};
