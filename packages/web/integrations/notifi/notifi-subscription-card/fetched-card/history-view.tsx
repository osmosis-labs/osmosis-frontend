import { useNotifiClientContext } from "@notifi-network/notifi-react-card";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Icon } from "~/components/assets";
import { TeamUpdateIcon } from "~/components/assets/notifi-alerts/team-update";
import IconButton from "~/components/buttons/icon-button";
import { useTranslation } from "~/hooks";
import { useWindowSize } from "~/hooks";
import { useNotifiLocalStorage } from "~/integrations/notifi/hooks";
import { DummyRow } from "~/integrations/notifi/hooks/use-history-detail-contents";
import { useNotifiModalContext } from "~/integrations/notifi/notifi-modal-context";
import {
  HistoryRowData,
  HistoryRows,
} from "~/integrations/notifi/notifi-subscription-card/fetched-card/history-rows";
import { LoadingCard } from "~/integrations/notifi/notifi-subscription-card/loading-card";

type CursorInfo = Readonly<{
  hasNextPage: boolean;
  endCursor?: string | undefined;
}>;

const MESSAGES_PER_PAGE = 20;

export const HistoryView: FunctionComponent = () => {
  const { t } = useTranslation();
  const { client } = useNotifiClientContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const [allNodes, setAllNodes] = useState<ReadonlyArray<HistoryRowData>>([]);
  const [cursorInfo, setCursorInfo] = useState<CursorInfo>({
    hasNextPage: false,
    endCursor: undefined,
  });
  const fetchedRef = useRef(false);
  const isQuerying = useRef(false);

  const { notifiLocalStorageValue, updateLocalStorage } =
    useNotifiLocalStorage();

  const dummyRows: DummyRow[] = notifiLocalStorageValue?.notShowDummyHistory
    ? []
    : [
        {
          emoji: <TeamUpdateIcon />,
          __typename: "DummyRow",
          title: t("notifi.getStartedHistoryTitle1"),
          message: t("notifi.getStartedHistoryMessage1"),
          cta: "Buy",
          timestamp: "",
          onCtaClick: () => {
            window.open(
              "https://osmosis.zone/blog/layerswap-a-new-on-ramp-and-cross-chain-service-for-osmosis",
              "_blank"
            );
          },
        },
        {
          emoji: <TeamUpdateIcon />,
          __typename: "DummyRow",
          title: t("notifi.getStartedHistoryTitle2"),
          message: t("notifi.getStartedHistoryMessage2"),
          cta: "Learn",
          timestamp: "",
          onCtaClick: () => {
            window.open(
              "https://support.osmosis.zone/tutorials/trading-on-osmosis",
              "_blank"
            );
          },
        },
        {
          emoji: <TeamUpdateIcon />,
          __typename: "DummyRow",
          title: t("notifi.getStartedHistoryTitle3"),
          message: t("notifi.getStartedHistoryMessage3"),
          cta: "Learn",
          timestamp: "",
          onCtaClick: () => {
            window.open(
              "https://support.osmosis.zone/tutorials/deposits",
              "_blank"
            );
          },
        },
      ];

  const { innerState: { onRequestBack, backIcon, title } = {} } =
    useNotifiModalContext();

  const { isMobile } = useWindowSize();

  useEffect(() => {
    if (!allNodes[0]?.id) return;

    client
      .markFusionNotificationHistoryAsRead({
        ids: [],
        beforeId: allNodes[0].id,
      })
      .catch((e) => console.error("Failed to mark as read", e));
  }, [allNodes]);

  const getNotificationHistory = useCallback(
    async ({ refresh }: { refresh: boolean }) => {
      if (!client.isInitialized || !client.isAuthenticated) {
        return;
      }

      if (!(refresh || cursorInfo.hasNextPage)) {
        return;
      }

      if (isQuerying.current) {
        return;
      }

      isQuerying.current = true;
      const result = await client.getFusionNotificationHistory({
        first: MESSAGES_PER_PAGE,
        after: refresh ? undefined : cursorInfo.endCursor,
        includeHidden: false,
      });

      if (!result) {
        return;
      }

      const nodes = result.nodes ?? [];
      setAllNodes((existing) => existing.concat(nodes));
      setCursorInfo(result.pageInfo);

      isQuerying.current = false;
      return result;
    },
    [client, cursorInfo.endCursor, cursorInfo.hasNextPage]
  );

  useEffect(() => {
    if (fetchedRef.current !== true) {
      fetchedRef.current = true;
      setIsLoading(true);
      getNotificationHistory({
        refresh: true,
      }).finally(() => setIsLoading(false));
    }
  }, [getNotificationHistory]);

  const loadMore = async () => {
    if (!cursorInfo.hasNextPage) return;
    setIsLoadingMore(true);
    client
      .getFusionNotificationHistory({
        first: MESSAGES_PER_PAGE,
        after: cursorInfo.endCursor,
        includeHidden: false,
      })
      .then((result) => {
        setAllNodes((existing) => existing.concat(result?.nodes ?? []));
        setCursorInfo(
          result?.pageInfo ?? {
            hasNextPage: false,
            endCursor: undefined,
          }
        );
      })
      .finally(() => setIsLoadingMore(false));
  };

  const clearAll = useCallback(() => {
    if (dummyRows.length > 0) {
      updateLocalStorage({ notShowDummyHistory: true });
    }

    if (
      !client.isInitialized ||
      !client.isAuthenticated ||
      allNodes.length === 0
    ) {
      return;
    }

    client
      .markFusionNotificationHistoryAsRead({
        ids: [],
        beforeId: allNodes[0].id,
        readState: "HIDDEN",
      })
      .then(() => {
        setAllNodes([]);
      })
      .catch((e) => console.error("Failed to clear history", e));
  }, [client, allNodes]);

  return (
    <>
      {isLoading ? (
        <LoadingCard />
      ) : (
        <>
          {!isMobile && (
            <div className="mt-[2rem] mb-[1rem] flex place-content-between items-center py-[0.625rem]">
              {onRequestBack && (
                <IconButton
                  aria-label="Back"
                  mode="unstyled"
                  size="unstyled"
                  className={`top-9.5 absolute ${
                    backIcon !== "setting" ? "left" : "right"
                  }-8 z-2 mt-1 w-fit rotate-180 cursor-pointer py-0 text-osmoverse-400 transition-all duration-[0.5s] hover:text-osmoverse-200`}
                  icon={
                    <Icon
                      id={backIcon ?? "arrow-right"}
                      width={23}
                      height={23}
                    />
                  }
                  onClick={onRequestBack}
                />
              )}
              <div className="relative mx-auto">
                <h6>{title}</h6>
              </div>
            </div>
          )}

          {[...allNodes, ...dummyRows].length > 0 ? (
            <div
              className={`absolute left-[2rem] top-[0.625rem] cursor-pointer font-body2 text-osmoverse-300 transition-all duration-[0.2s] hover:scale-[105%] hover:text-osmoverse-200 md:top-8`}
              onClick={clearAll}
            >
              {t("notifi.clearAllHistory")}
            </div>
          ) : null}

          <HistoryRows
            rows={[...allNodes, ...dummyRows]}
            hasNextPage={cursorInfo.hasNextPage}
            loadMore={loadMore}
            isLoadingMore={isLoadingMore}
          />
        </>
      )}
    </>
  );
};
