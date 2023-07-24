import { useNotifiClientContext } from "@notifi-network/notifi-react-card";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { useStore } from "~/stores";

export const useNotifiBreadcrumb = () => {
  const {
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
  } = useStore();
  const { client } = useNotifiClientContext();
  const [hasUnreadNotification, setHasUnreadNotification] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const wallet = accountStore.getWallet(chainId);
      if (!wallet?.address || !client?.isAuthenticated)
        return setHasUnreadNotification(true);
      const localStorageKey = `lastStoredTimestamp:${wallet.address}`;

      client
        .getNotificationHistory({ first: 1 })
        .then((res) => {
          const newestHistoryItem = res.nodes?.[0];
          const newestNotificationCreatedDate = newestHistoryItem?.createdDate
            ? dayjs(newestHistoryItem?.createdDate)
            : dayjs("2022-01-05T12:30:00.792Z");

          const lastStoredTimestamp = dayjs(
            window.localStorage.getItem(localStorageKey)
          ).isValid()
            ? dayjs(window.localStorage.getItem(localStorageKey))
            : dayjs("2022-01-05T10:30:00.792Z");

          if (newestNotificationCreatedDate.isAfter(lastStoredTimestamp)) {
            setHasUnreadNotification(true);
          } else {
            setHasUnreadNotification(false);
          }
        })
        .catch(() => setHasUnreadNotification(true));
    }, 5000);

    return () => clearInterval(interval);
  }, [client?.isAuthenticated]);

  return { hasUnreadNotification };
};
