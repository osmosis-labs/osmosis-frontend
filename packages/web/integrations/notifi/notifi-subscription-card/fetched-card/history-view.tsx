import { useNotifiClientContext } from "@notifi-network/notifi-react-card";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";

import Spinner from "~/components/spinner";
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
  const t = useTranslation();
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

  useEffect(() => {
    if (!allNodes[0]?.id) return;

    client
      .markFusionNotificationHistoryAsRead({
        ids: [],
        beforeId: allNodes[0].id,
      })
      .catch((e) => console.log("Failed to mark as read", e));
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

  return (
    <>
      {isLoading ? (
        <LoadingCard />
      ) : (
        <>
          <HistoryRows rows={allNodes} />
          {cursorInfo.hasNextPage ? (
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
        </>
      )}
    </>
  );
};
