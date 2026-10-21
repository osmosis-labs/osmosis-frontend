import { useCallback, useState, useSyncExternalStore } from "react";

import { useIsClient } from "~/hooks/use-is-client";

export const AlloyedAssetsToastSeenThisSessionKey =
  "seen-alloyed-assets-toast-this-session";

const readHasSeenToastThisSession = (): boolean => {
  try {
    return (
      sessionStorage.getItem(AlloyedAssetsToastSeenThisSessionKey) === "true"
    );
  } catch {
    return false;
  }
};

const writeHasSeenToastThisSession = () => {
  try {
    sessionStorage.setItem(AlloyedAssetsToastSeenThisSessionKey, "true");
  } catch {
    // If session storage is unavailable, component state still prevents repeats
    // until the app reloads.
  }
};

const subscribeToNothing = () => () => {};

/** Keeps the proactive toast to at most once per browser-tab session. */
export const useAlloyedAssetsToastSession = () => {
  const isSessionHydrated = useIsClient();
  const hasSeenInStorage = useSyncExternalStore(
    subscribeToNothing,
    readHasSeenToastThisSession,
    () => false
  );
  // Covers the case where session storage is unavailable for writes.
  const [hasSeenInState, setHasSeenInState] = useState(false);

  const markToastSeenThisSession = useCallback(() => {
    writeHasSeenToastThisSession();
    setHasSeenInState(true);
  }, []);

  return {
    hasSeenToastThisSession: hasSeenInState || hasSeenInStorage,
    isSessionHydrated,
    markToastSeenThisSession,
  };
};
