import { AvailableFlags } from "@osmosis-labs/types";
import {
  type LDClient,
  useFlags,
  useLDClient,
} from "launchdarkly-react-client-sdk";
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
  swapToolTopGainers: true,
  swapped: true,
  onrampmoney: true,
  multiTxBridgeRoutes: true,
  positionMigration: true,
  solanaSkipRoutes: false,
  fastBridgeTransfers: false,
  fastBridgeTransfersNonEvmSources: false,
  inactiveValidatorAlerts: false,
  forcedMigrations: true,
};

/** Seconds to wait before falling back to LaunchDarkly's `initialized` event. */
const LD_INIT_TIMEOUT_SECONDS = 5;

/**
 * One init promise per client, shared by every `useFeatureFlags` caller.
 *
 * A bounded `waitForInitialization` avoids the SDK warning it logs on every
 * call without a timeout. On timeout or failure (slow network, blocked by an
 * ad blocker) keep waiting for a late successful init instead of leaving an
 * unhandled rejection; a client that never initializes stays uninitialized.
 */
const initPromises = new WeakMap<LDClient, Promise<void>>();

function waitForLdInitialization(client: LDClient): Promise<void> {
  let promise = initPromises.get(client);
  if (!promise) {
    promise = client
      .waitForInitialization(LD_INIT_TIMEOUT_SECONDS)
      .catch(
        () => new Promise<void>((resolve) => client.on("initialized", resolve))
      );
    initPromises.set(client, promise);
  }
  return promise;
}

export function useFeatureFlags() {
  const launchdarklyFlags: Record<AvailableFlags, boolean> = useFlags();
  const { isMobile } = useWindowSize();
  const [isInitialized, setIsInitialized] = useState(false);
  const client = useLDClient();

  useEffect(() => {
    if (isInitialized || !client || process.env.NODE_ENV === "test") return;
    let cancelled = false;
    void waitForLdInitialization(client).then(() => {
      if (!cancelled) setIsInitialized(true);
    });
    return () => {
      cancelled = true;
    };
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
