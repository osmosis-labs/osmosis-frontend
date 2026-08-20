import { useCallback, useEffect, useState } from "react";

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

/** Keeps the proactive toast to at most once per browser-tab session. */
export const useAlloyedAssetsToastSession = () => {
  const [hasSeenToastThisSession, setHasSeenToastThisSession] = useState(false);
  const [isSessionHydrated, setIsSessionHydrated] = useState(false);

  useEffect(() => {
    setHasSeenToastThisSession(readHasSeenToastThisSession());
    setIsSessionHydrated(true);
  }, []);

  const markToastSeenThisSession = useCallback(() => {
    writeHasSeenToastThisSession();
    setHasSeenToastThisSession(true);
  }, []);

  return {
    hasSeenToastThisSession,
    isSessionHydrated,
    markToastSeenThisSession,
  };
};
