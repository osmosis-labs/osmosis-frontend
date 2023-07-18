import { useNotifiClientContext } from "@notifi-network/notifi-react-card";
import dayjs from "dayjs";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Spinner from "~/components/spinner";
import { useStore } from "~/stores";

import { LoadingCard } from "../loading-card";
import { HistoryRowData, HistoryRows } from "./history-rows";

type CursorInfo = Readonly<{
  hasNextPage: boolean;
  endCursor?: string | undefined;
}>;

const MESSAGES_PER_PAGE = 20;

export const HistoryView: FunctionComponent = () => {
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
  const {
    accountStore,
    chainStore: {
      osmosis: { chainId },
    },
  } = useStore();

  useEffect(() => {
    // A hack to implement the feat of breadcrumbs (Will move to BE approach)
    window.localStorage.setItem(
      `lastStoredTimestamp:${accountStore.getWallet(chainId)?.address}`,
      dayjs(Date.now()).utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
    );
  }, []);

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
      const result = await client.getNotificationHistory({
        first: MESSAGES_PER_PAGE,
        after: refresh ? undefined : cursorInfo.endCursor,
      });

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
      .getNotificationHistory({
        first: MESSAGES_PER_PAGE,
        after: cursorInfo.endCursor,
      })
      .then((result) => {
        setAllNodes((existing) => existing.concat(result.nodes ?? []));
        setCursorInfo(result.pageInfo);
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
                "LoadMore"
              )}
            </div>
          ) : null}
        </>
      )}
    </>
  );
};
