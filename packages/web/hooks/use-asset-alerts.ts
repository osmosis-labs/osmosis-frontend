import { queryOsmosisCMS } from "@osmosis-labs/server";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useReducer } from "react";

import { useFeatureFlags, useWalletSelect } from "~/hooks";
import { useStore } from "~/stores";
import {
  AssetAlertsResponse,
  getActiveAssetAlerts,
} from "~/utils/asset-alerts";
import { api } from "~/utils/trpc";

/**
 * Dismissal is persisted under the alert's `localStorageKey` with the same
 * `"false"` convention as the announcement banner. Read directly (SSR-guarded)
 * when deriving visibility so previously dismissed alerts never flash.
 */
const isAlertDismissed = (localStorageKey: string) =>
  typeof window !== "undefined" &&
  window.localStorage.getItem(localStorageKey) === "false";

/**
 * Returns the asset alerts from the fe-content repo that are live (within
 * their date range), match a denom the connected wallet holds anywhere on
 * Osmosis (bank balances, staked, in-locks, unclaimed rewards, or pooled),
 * and have not been dismissed, plus a `dismissAlert` callback that persists
 * a dismissal. Returns no alerts when the `assetAlerts` feature flag is off
 * or no wallet is connected.
 */
export const useAssetAlerts = () => {
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const { isLoading: isWalletLoading } = useWalletSelect();
  const { assetAlerts } = useFeatureFlags();

  // Bumped on dismissals and at alert date boundaries: visibility is derived
  // at render time, so a re-render is all that's needed to re-evaluate it.
  const [, forceVisibilityUpdate] = useReducer((count: number) => count + 1, 0);

  const isWalletConnected =
    !isWalletLoading &&
    Boolean(wallet?.isWalletConnected) &&
    Boolean(wallet?.address);

  const { data: alertsData } = useQuery({
    queryKey: ["osmosis-asset-alerts"],
    queryFn: () =>
      queryOsmosisCMS<AssetAlertsResponse>({
        filePath: "cms/asset-alerts.json",
      }),
    staleTime: 1000 * 60 * 3, // 3 minutes
    cacheTime: 1000 * 60 * 3, // 3 minutes
    enabled: assetAlerts && isWalletConnected,
  });

  const { data: portfolioAssets } =
    api.local.portfolio.getPortfolioAssets.useQuery(
      {
        address: wallet?.address ?? "",
      },
      {
        enabled:
          assetAlerts &&
          isWalletConnected &&
          (alertsData?.alerts?.length ?? 0) > 0,
        refetchOnWindowFocus: false,
      }
    );

  // Re-render at the next alert start/end boundary so alerts appear and
  // expire while a session stays open, rescheduling for the boundary after.
  useEffect(() => {
    const alerts = alertsData?.alerts;
    if (!alerts?.length) return;

    let timeout: ReturnType<typeof setTimeout> | undefined;

    const scheduleNextBoundary = () => {
      const nowMs = Date.now();
      const futureBoundaries = alerts
        .flatMap(({ banner: { startDate, endDate } }) => [startDate, endDate])
        .map((date) => (date ? new Date(date).getTime() : NaN))
        .filter((time) => !Number.isNaN(time) && time > nowMs);

      if (futureBoundaries.length === 0) return;

      // Clamp to setTimeout's max delay (~24.8 days); the reschedule after
      // firing covers boundaries further out.
      const delay = Math.min(
        Math.min(...futureBoundaries) - nowMs + 1,
        2 ** 31 - 1
      );
      timeout = setTimeout(() => {
        forceVisibilityUpdate();
        scheduleNextBoundary();
      }, delay);
    };

    scheduleNextBoundary();
    return () => clearTimeout(timeout);
  }, [alertsData]);

  // Derived at render time (not memoized): dismissals stored in a previous
  // session are respected on the very first render that shows alerts (no
  // flash), each render re-evaluates date bounds against the current time,
  // and cached query data is ignored the moment the kill switch flips off or
  // the wallet disconnects (react-query's `enabled` stops fetching but keeps
  // cached data).
  const activeAlerts =
    assetAlerts && isWalletConnected
      ? getActiveAssetAlerts({
          alerts: alertsData?.alerts,
          heldAssets: portfolioAssets?.heldAssets ?? [],
        })
      : [];

  const visibleAlerts = activeAlerts.filter(
    (alert) => !isAlertDismissed(alert.banner.localStorageKey)
  );

  const dismissAlert = useCallback((localStorageKey: string) => {
    window.localStorage.setItem(localStorageKey, "false");
    forceVisibilityUpdate();
  }, []);

  return { visibleAlerts, dismissAlert };
};
