import { AvailableFlags } from "@osmosis-labs/types";
import { useFlags, useLDClient } from "launchdarkly-react-client-sdk";
import { useEffect, useState } from "react";

import { useWindowSize } from "~/hooks";

// Mirrors the values production serves. Only used in local dev without a
// LaunchDarkly client ID; deployed builds take every value from LaunchDarkly.
const defaultFlags: Record<AvailableFlags, boolean> = {
  staking: true,
  swapsAdBanner: true,
  tokenInfo: true,
  sidebarOsmoChangeAndChart: true,
  multiBridgeProviders: true,
  transactionsPage: true,
  osmosisUpdatesPopUp: false,
  aprBreakdown: true,
  topAnnouncementBanner: true,
  swapToolSimulateFee: true,
  newDepositWithdrawFlow: true,
  oneClickTrading: true,
  limitOrders: true,
  advancedChart: true,
  inGivenOut: true,
  sqsActiveOrders: true,
  alloyedAssets: true,
  assetAlerts: true,
  incentivizePool: true,
  bridgeDepositAddress: true,
  nomicWithdrawAmount: true,
  swapToolTopGainers: true,
  swapped: true,
  onrampmoney: true,
  multiTxBridgeRoutes: true,
  positionMigration: true,
};

export function useFeatureFlags() {
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
    oneClickTrading: isDevModeWithoutClientID
      ? defaultFlags.oneClickTrading
      : !isMobile &&
        launchdarklyFlags.swapToolSimulateFee && // 1-Click trading is dependent on the swap tool simulate fee flag
        launchdarklyFlags.oneClickTrading,
    _isInitialized: isDevModeWithoutClientID ? true : isInitialized,
    _isClientIDPresent: !!process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID,
  } as Record<
    AvailableFlags | "_isInitialized" | "_isClientIDPresent",
    boolean
  >;
}
