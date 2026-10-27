import { queryOsmosisCMS } from "@osmosis-labs/server";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";

import { useFeatureFlags, useWalletSelect } from "~/hooks";
import { useWallet } from "~/hooks/use-wallet";
import {
  ActiveForcedMigration,
  ForcedMigrationsResponse,
  getActiveForcedMigrations,
  getForcedMigrationSnoozeEndMs,
  getForcedMigrationSnoozeKey,
  isForcedMigrationSnoozed,
  parseForcedMigrations,
} from "~/utils/forced-migrations";
import { api } from "~/utils/trpc";

export const FORCED_MIGRATIONS_FILE_PATH = "cms/forced-migrations.json";

const readSnoozedAtMs = (key: string): number | undefined => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? undefined : Number(raw);
  } catch {
    // Storage blocked: fall back to the in-memory snooze, so the popup can
    // still be closed for this session.
    return undefined;
  }
};

/**
 * Forced migrations from the fe-content repo that have started and match an
 * old asset the connected wallet holds anywhere on Osmosis.
 *
 * `activeMigrations` is every match, for callers that only need to know a
 * migration applies (the alloyed-assets toast steps aside for these).
 * `visibleMigrations` drops the ones snoozed by this wallet; that is what the
 * popup shows. `isSettled` says whether the lists can still change as data
 * loads. Both are empty while the `forcedMigrations` flag is off or no
 * wallet is connected.
 */
export const useForcedMigrations = () => {
  const { address, isWalletConnected: isOsmosisWalletConnected } = useWallet();
  const { isLoading: isWalletLoading } = useWalletSelect();
  const { forcedMigrations } = useFeatureFlags();

  // Bumped when a snooze is written and at stage / snooze boundaries:
  // visibility is derived at render time, so a re-render re-evaluates it.
  const [, forceVisibilityUpdate] = useReducer((count: number) => count + 1, 0);
  // Mirrors snoozes in memory, so closing works even when storage is blocked.
  const [sessionSnoozes, setSessionSnoozes] = useState<Record<string, number>>(
    {}
  );

  const isWalletConnected =
    !isWalletLoading && isOsmosisWalletConnected && Boolean(address);
  // `Boolean` keeps the queries disabled until LaunchDarkly initialises.
  const isEnabled = Boolean(forcedMigrations) && isWalletConnected;

  const { data: migrationsData, isFetched: isMigrationsFetched } = useQuery({
    queryKey: ["osmosis-forced-migrations"],
    queryFn: () =>
      queryOsmosisCMS<ForcedMigrationsResponse>({
        filePath: FORCED_MIGRATIONS_FILE_PATH,
      }),
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 3, // 3 minutes
    enabled: isEnabled,
  });

  const migrations = useMemo(
    () => parseForcedMigrations(migrationsData?.migrations),
    [migrationsData]
  );

  const { data: portfolioAssets, isFetched: isPortfolioFetched } =
    api.local.portfolio.getPortfolioAssets.useQuery(
      {
        address: address ?? "",
      },
      {
        enabled: isEnabled && migrations.length > 0,
        refetchOnWindowFocus: false,
      }
    );

  const fromDenoms = useMemo(
    () => [...new Set(migrations.flatMap(({ fromDenoms }) => fromDenoms))],
    [migrations]
  );

  // Per-position rows, so unlocking positions can be told apart from locked
  // ones. On failure the popup falls back to the portfolio totals.
  const {
    data: holdings,
    isFetched: isHoldingsFetched,
    isError: isHoldingsError,
  } = api.local.portfolio.getForcedMigrationHoldings.useQuery(
    { address: address ?? "", denoms: fromDenoms },
    {
      enabled: isEnabled && fromDenoms.length > 0,
      refetchOnWindowFocus: false,
    }
  );

  /** Whether `activeMigrations` is final for now: nothing is gated on, or
   *  the CMS file and (when it has entries) the portfolio and holdings have
   *  loaded. A failed fetch counts as settled. */
  const isSettled =
    !isEnabled ||
    (isMigrationsFetched &&
      (migrations.length === 0 || (isPortfolioFetched && isHoldingsFetched)));

  const now = new Date();

  // Derived at render time so dates and snoozes are always checked against
  // the current time, and cached data is ignored as soon as the flag flips
  // off or the wallet disconnects.
  const activeMigrations: ActiveForcedMigration[] =
    // Waits for the holdings too, so the popup doesn't open on the
    // portfolio-totals fallback and then change shape.
    isEnabled && portfolioAssets && isHoldingsFetched
      ? getActiveForcedMigrations({
          migrations,
          heldAssets: portfolioAssets.heldAssets,
          assetVariants: portfolioAssets.assetVariants,
          holdings: isHoldingsError ? undefined : holdings,
          now,
        })
      : [];

  const getSnoozedAtMs = (id: string) => {
    const key = getForcedMigrationSnoozeKey(id, address ?? "");
    return readSnoozedAtMs(key) ?? sessionSnoozes[key];
  };

  const visibleMigrations = activeMigrations.filter(
    ({ migration, stage }) =>
      !isForcedMigrationSnoozed(getSnoozedAtMs(migration.id), stage, now)
  );

  // Re-render at the next boundary that can change visibility: a migration
  // starting, escalating or passing its deadline, or a snooze running out.
  const nextBoundaryMs = Math.min(
    ...migrations.flatMap(({ startDate, escalateDate, deadline }) =>
      [startDate, escalateDate, deadline]
        .map((date) => (date ? new Date(date).getTime() : NaN))
        .filter((time) => !Number.isNaN(time) && time > now.getTime())
    ),
    ...activeMigrations.map(({ migration, stage }) => {
      const snoozedAtMs = getSnoozedAtMs(migration.id);
      return snoozedAtMs === undefined
        ? Number.POSITIVE_INFINITY
        : getForcedMigrationSnoozeEndMs(snoozedAtMs, stage);
    })
  );

  useEffect(() => {
    if (!Number.isFinite(nextBoundaryMs)) return;
    // Clamp to setTimeout's max delay (~24.8 days); the re-render after
    // firing schedules the boundary after.
    const delay = Math.min(
      Math.max(nextBoundaryMs - Date.now() + 1, 0),
      2 ** 31 - 1
    );
    const timeout = setTimeout(forceVisibilityUpdate, delay);
    return () => clearTimeout(timeout);
  }, [nextBoundaryMs]);

  const snooze = useCallback(
    (ids: string[]) => {
      const snoozedAt = Date.now();
      const keys = ids.map((id) =>
        getForcedMigrationSnoozeKey(id, address ?? "")
      );
      setSessionSnoozes((prev) => ({
        ...prev,
        ...Object.fromEntries(keys.map((key) => [key, snoozedAt])),
      }));
      keys.forEach((key) => {
        try {
          window.localStorage.setItem(key, String(snoozedAt));
        } catch {
          // The in-memory snooze above covers this session.
        }
      });
      forceVisibilityUpdate();
    },
    [address]
  );

  return { activeMigrations, visibleMigrations, isSettled, snooze };
};
