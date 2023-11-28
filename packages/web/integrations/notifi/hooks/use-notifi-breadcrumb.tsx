import { useNotifiClientContext } from "@notifi-network/notifi-react-card";
import { useEffect, useMemo, useState } from "react";

import { useStore } from "~/stores";

export const useNotifiBreadcrumb = () => {
  const {
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
  } = useStore();
  const { client } = useNotifiClientContext();
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const hasUnreadNotification = useMemo(
    () => (unreadNotificationCount > 0 ? true : false),
    [unreadNotificationCount]
  );

  useEffect(() => {
    const wallet = accountStore.getWallet(chainId);
    if (!wallet?.address || !client?.isAuthenticated) return;

    client
      .getUnreadNotificationHistoryCount()
      .then((res) => {
        const unreadNotificationCount = res.count;
        setUnreadNotificationCount(unreadNotificationCount);
      })
      .catch((_e) => {
        /* Intentionally empty (Concurrent can only possibly happens here instead of inside interval) */
      });

    const interval = setInterval(() => {
      const wallet = accountStore.getWallet(chainId);
      if (!wallet?.address || !client?.isAuthenticated) return;

      client.getUnreadNotificationHistoryCount().then((res) => {
        const unreadNotificationCount = res.count;
        setUnreadNotificationCount(unreadNotificationCount);
      });
    }, Math.floor(Math.random() * 5000) + 5000); // a random interval between 5 and 10 seconds to avoid spamming the server

    return () => clearInterval(interval);
  }, [client?.isAuthenticated]);

  return { hasUnreadNotification, unreadNotificationCount };
};
