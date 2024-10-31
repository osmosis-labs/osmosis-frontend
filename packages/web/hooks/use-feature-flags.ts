import { AvailableFlags } from "@osmosis-labs/types";
import { useFlags, useLDClient } from "launchdarkly-react-client-sdk";
import { useEffect, useState } from "react";

import { useWindowSize } from "~/hooks";

const defaultFlags: Record<AvailableFlags, boolean> = {
  staking: true,
  swapsAdBanner: true,
  tokenInfo: true,
  sidebarOsmoChangeAndChart: true,
  multiBridgeProviders: true,
  earnPage: false,
  transactionsPage: true,
  osmosisUpdatesPopUp: false,
  aprBreakdown: true,
  topAnnouncementBanner: true,
  tfmProTradingNavbarButton: false,
  positionRoi: true,
  swapToolSimulateFee: true,
  portfolioPageAndNewAssetsPage: true,
  newAssetsPage: true,
  displayDailyEarn: false,
  newDepositWithdrawFlow: true,
  oneClickTrading: true,
  limitOrders: true,
  advancedChart: false,
  cypherCard: false,
  newPortfolioPage: false,
  inGivenOut: false,
  sqsActiveOrders: false,
  alloyedAssets: false,
  bridgeDepositAddress: false,
  nomicWithdrawAmount: false,
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
    portfolioPageAndNewAssetsPage:
      // don't want to use either on mobile
      // as this flag bundles the 2 pages,
      // and the portfolio page not be mobile responsive yet
      // (even thought the assets page is)
      isMobile || !isInitialized
        ? false
        : launchdarklyFlags.portfolioPageAndNewAssetsPage,
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
