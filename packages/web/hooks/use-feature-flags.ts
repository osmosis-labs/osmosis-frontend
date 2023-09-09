import { useFlags, useLDClient } from "launchdarkly-react-client-sdk";
import { useEffect, useState } from "react";

import { useWindowSize } from "~/hooks";

type AvailableFlags =
  | "concentratedLiquidity"
  | "staking"
  | "swapsAdBanner"
  | "notifications"
  | "convertToStake"
  | "mobileNotifications"
  | "upgrades"
  | "tokenInfo";

export const useFeatureFlags = () => {
  const launchdarklyFlags: Record<AvailableFlags, boolean> = useFlags();
  const { isMobile } = useWindowSize();
  const [isInitialized, setIsInitialized] = useState(false);

  const client = useLDClient();

  useEffect(() => {
    if (!isInitialized && client)
      client.waitForInitialization().then(() => setIsInitialized(true));
  }, [isInitialized, client]);

  return {
    ...launchdarklyFlags,
    concentratedLiquidity: Boolean(
      !isMobile && launchdarklyFlags.concentratedLiquidity
    ),
    notifications: isMobile
      ? launchdarklyFlags.mobileNotifications
      : launchdarklyFlags.notifications,
    _isInitialized: isInitialized,
  } as Record<
    Exclude<AvailableFlags, "mobileNotifications"> | "_isInitialized",
    boolean
  >;
};
