import { useEffect, useState, useSyncExternalStore } from "react";

import {
  getPendingWalletRequest,
  subscribePendingWalletRequest,
  WC_WAITING_NOTICE_DELAY_MS,
} from "~/integrations/core-walletconnect/pending-request";

/**
 * The WalletConnect request currently waiting on the user's phone, once it has
 * gone unanswered long enough to be worth saying so. `undefined` otherwise.
 */
export function usePendingWalletRequest() {
  const pending = useSyncExternalStore(
    subscribePendingWalletRequest,
    getPendingWalletRequest,
    () => null
  );
  const [shownFor, setShownFor] = useState<number | null>(null);

  useEffect(() => {
    if (!pending) return;
    const remaining = Math.max(
      0,
      pending.startedAt + WC_WAITING_NOTICE_DELAY_MS - Date.now()
    );
    const timer = setTimeout(() => setShownFor(pending.startedAt), remaining);
    return () => clearTimeout(timer);
  }, [pending]);

  return pending && shownFor === pending.startedAt ? pending : undefined;
}
