import { useFlags, useLDClient } from "launchdarkly-react-client-sdk";
import { useEffect, useState } from "react";

import { useWindowSize } from "~/hooks";

export type AvailableFlags =
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
  | "earnPage"
  | "sidecarRouter"
  | "legacyRouter"
  | "tfmRouter"
  | "osmosisUpdatesPopUp"
  | "aprBreakdown";

type ModifiedFlags =
  | Exclude<AvailableFlags, "mobileNotifications">
  | "_isInitialized"
  | "_isClientIDPresent";

// These default flags will be passed to the app if the app is running in development mode
const defaultFlags: Record<ModifiedFlags, boolean> = {
  concentratedLiquidity: true,
  staking: false,
  swapsAdBanner: true,
  notifications: true,
  convertToStake: true,
  upgrades: true,
  tokenInfo: true,
  newAssetsTable: false,
  sidebarOsmoChangeAndChart: true,
  multiBridgeProviders: true,
  unlistedAssets: false,
  earnPage: false,
  sidecarRouter: true,
  legacyRouter: true,
  tfmRouter: true,
  osmosisUpdatesPopUp: false,
  aprBreakdown: true,
  _isInitialized: false,
  _isClientIDPresent: false,
};

export const useFeatureFlags = () => {
  const launchdarklyFlags: Record<AvailableFlags, boolean> = useFlags();
  const { isMobile } = useWindowSize();
  const [isInitialized, setIsInitialized] = useState(false);

  const client = useLDClient();

  useEffect(() => {
    if (!isInitialized && client && process.env.NODE_ENV !== "test")
      client.waitForInitialization().then(() => setIsInitialized(true));
  }, [isInitialized, client]);

  return {
    ...launchdarklyFlags,
    ...(process.env.NODE_ENV === "development" ? defaultFlags : {}),
    notifications: isMobile
      ? launchdarklyFlags.mobileNotifications
      : launchdarklyFlags.notifications,
    _isInitialized: process.env.NODE_ENV === "development" || isInitialized,
    _isClientIDPresent: !!process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID,
  } as Record<ModifiedFlags, boolean>;
};
