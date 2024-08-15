import { apiClient } from "@osmosis-labs/utils";
import { useQuery } from "@tanstack/react-query";
import { useFlags, useLDClient } from "launchdarkly-react-client-sdk";
import { useEffect, useState } from "react";

import { useWindowSize } from "~/hooks";
import { LevanaGeoBlockedResponse } from "~/pages/_app";

// NOTE: Please add a default value to any new flag you add to this list
export type AvailableFlags =
  | "staking"
  | "swapsAdBanner"
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
  | "newAssetsPage"
  | "newDepositWithdrawFlow"
  | "oneClickTrading"
  | "limitOrders"
  | "advancedChart"
  | "cypherCard";

type ModifiedFlags =
  | Exclude<AvailableFlags, "mobileNotifications">
  | "_isInitialized"
  | "_isClientIDPresent";

const defaultFlags: Record<ModifiedFlags, boolean> = {
  staking: true,
  swapsAdBanner: true,
  tokenInfo: true,
  sidebarOsmoChangeAndChart: true,
  multiBridgeProviders: true,
  earnPage: false,
  transactionsPage: true,
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
  newAssetsPage: true,
  displayDailyEarn: false,
  newDepositWithdrawFlow: false,
  oneClickTrading: false,
  limitOrders: true,
  advancedChart: false,
  _isInitialized: false,
  _isClientIDPresent: false,
  cypherCard: false,
};

const LIMIT_ORDER_COUNTRY_CODES =
  process.env.NEXT_PUBLIC_LIMIT_ORDER_COUNTRY_CODES?.split(",").map((s) =>
    s.trim()
  ) ?? [];

export const useFeatureFlags = () => {
  const launchdarklyFlags: Record<AvailableFlags, boolean> = useFlags();
  const { isMobile } = useWindowSize();
  const [isInitialized, setIsInitialized] = useState(false);

  const client = useLDClient();

  const { data: levanaGeoblock } = useQuery(
    ["levana-geoblocked"],
    () =>
      apiClient<LevanaGeoBlockedResponse>("https://geoblocked.levana.finance/"),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      retry: false,
    }
  );

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
    oneClickTrading:
      !isMobile &&
      launchdarklyFlags.swapToolSimulateFee && // 1-Click trading is dependent on the swap tool simulate fee flag
      launchdarklyFlags.oneClickTrading,
    _isInitialized: isDevModeWithoutClientID ? true : isInitialized,
    _isClientIDPresent: !!process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID,
    limitOrders: false,
    // isInitialized &&
    // launchdarklyFlags.limitOrders &&
    // (LIMIT_ORDER_COUNTRY_CODES.length === 0 ||
    //   LIMIT_ORDER_COUNTRY_CODES.includes(levanaGeoblock?.countryCode ?? "")),
  } as Record<ModifiedFlags, boolean>;
};
