import { AvailableFlags } from "@osmosis-labs/types";
import { useFlags, useLDClient } from "launchdarkly-react-client-sdk";
import { useEffect, useState } from "react";

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
  displayDailyEarn: false,
  newDepositWithdrawFlow: true,
  oneClickTrading: true,
  limitOrders: true,
  advancedChart: false,
  cypherCard: false,
  inGivenOut: false,
  sqsActiveOrders: false,
  alloyedAssets: false,
  bridgeDepositAddress: false,
  nomicWithdrawAmount: false,
  swapToolTopGainers: false,
  babyTokenBanner: false,
  moonpay: true,
  layerswapcoinbase: true,
  swapped: true,
  onrampmoney: true,
  transak: true,
  polarisBanner: false,
};

export function useFeatureFlags() {
  const launchdarklyFlags: Record<AvailableFlags, boolean> = useFlags();
  // const { isMobile } = useWindowSize();
  const [isInitialized, setIsInitialized] = useState(false);
  const client = useLDClient();

  useEffect(() => {
    if (!isInitialized && client && process.env.NODE_ENV !== "test")
      client.waitForInitialization().then(() => setIsInitialized(true));
  }, [isInitialized, client]);

  // const isDevModeWithoutClientID =
  //   process.env.NODE_ENV === "development" &&
  //   !process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID;

  return {
    ...launchdarklyFlags,
    ...defaultFlags,
    oneClickTrading: defaultFlags.oneClickTrading,
    _isInitialized: true,
    _isClientIDPresent: !!process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID,
  } as Record<
    AvailableFlags | "_isInitialized" | "_isClientIDPresent",
    boolean
  >;
}
