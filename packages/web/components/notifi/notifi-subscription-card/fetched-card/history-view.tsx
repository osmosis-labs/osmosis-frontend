import { useNotifiClientContext } from "@notifi-network/notifi-react-card";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { HistoryRowData, HistoryRows } from "./history-rows";

type CursorInfo = Readonly<{
  hasNextPage: boolean;
  endCursor?: string | undefined;
}>;

const MESSAGES_PER_PAGE = 50;

interface Props {
  setAlertEntry: React.Dispatch<
    React.SetStateAction<HistoryRowData | undefined>
  >;
}

export const HistoryView: FunctionComponent<Props> = ({ setAlertEntry }) => {
  const { client } = useNotifiClientContext();

  const [allNodes, setAllNodes] = useState<ReadonlyArray<HistoryRowData>>([]);
  const [cursorInfo, setCursorInfo] = useState<CursorInfo>({
    hasNextPage: false,
    endCursor: undefined,
  });
  const fetchedRef = useRef(false);
  const isQuerying = useRef(false);

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
      getNotificationHistory({
        refresh: true,
      });
    }
  }, [getNotificationHistory]);

  // if (allNodes.length === 0) {
  //   return <HistoryEmpty />;
  // }

  return <HistoryRows rows={allNodes} setAlertEntry={setAlertEntry} />;
};
