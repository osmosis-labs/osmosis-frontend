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
  | "tokenInfo"
  | "newAssetsTable"
  | "sidebarOsmoChangeAndChart"
  | "multiBridgeProviders"
  | "unlistedAssets"
  | "sidecarRouter";

type ModifiedFlags =
  | Exclude<AvailableFlags, "mobileNotifications">
  | "_isInitialized"
  | "_isClientIDPresent";

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
    notifications: isMobile
      ? launchdarklyFlags.mobileNotifications
      : launchdarklyFlags.notifications,
    _isInitialized: isInitialized,
    _isClientIDPresent: !!process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID,
  } as Record<ModifiedFlags, boolean>;
};
