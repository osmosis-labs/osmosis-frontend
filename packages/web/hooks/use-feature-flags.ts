import { useFlags, useLDClient } from "launchdarkly-react-client-sdk";
import { useEffect, useState } from "react";

import { useWindowSize } from "~/hooks";

// NOTE: Please add a default value to any new flag you add to this list
export type AvailableFlags =
  | "concentratedLiquidity"
  | "staking"
  | "swapsAdBanner"
  | "notifications"
  | "mobileNotifications"
  | "tokenInfo"
  | "sidebarOsmoChangeAndChart"
  | "multiBridgeProviders"
  | "earnPage"
  | "transactionsPage"
  | "sidecarRouter"
  | "legacyRouter"
  | "tfmRouter"
  | "osmosisUpdatesPopUp"
  | "aprBreakdown"
  | "topAnnouncementBanner"
  | "tfmProTradingNavbarButton"
  | "positionRoi"
  | "swapToolSimulateFee"
  | "portfolioPageAndNewAssetsPage"
  | "displayDailyEarn"
  | "newAssetsPage";

type ModifiedFlags =
  | Exclude<AvailableFlags, "mobileNotifications">
  | "_isInitialized"
  | "_isClientIDPresent";

const defaultFlags: Record<ModifiedFlags, boolean> = {
  concentratedLiquidity: true,
  staking: true,
  swapsAdBanner: true,
  notifications: true,
  tokenInfo: true,
  sidebarOsmoChangeAndChart: true,
  multiBridgeProviders: true,
  earnPage: false,
  transactionsPage: false,
  sidecarRouter: true,
  legacyRouter: true,
  tfmRouter: true,
  osmosisUpdatesPopUp: false,
  aprBreakdown: true,
  topAnnouncementBanner: true,
  tfmProTradingNavbarButton: true,
  positionRoi: true,
  swapToolSimulateFee: false,
  portfolioPageAndNewAssetsPage: false,
  newAssetsPage: false,
  displayDailyEarn: false,
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

  const isDevModeWithoutClientID =
    process.env.NODE_ENV === "development" &&
    !process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID;

  return {
    ...launchdarklyFlags,
    ...(isDevModeWithoutClientID ? defaultFlags : {}),
    notifications: isMobile
      ? launchdarklyFlags.mobileNotifications
      : launchdarklyFlags.notifications,
    portfolioPageAndNewAssetsPage:
      isMobile || !isInitialized
        ? false
        : launchdarklyFlags.portfolioPageAndNewAssetsPage,
    _isInitialized: isDevModeWithoutClientID ? true : isInitialized,
    _isClientIDPresent: !!process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID,
  } as Record<ModifiedFlags, boolean>;
};
