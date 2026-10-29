import { queryOsmosisCMS } from "@osmosis-labs/server";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { create } from "zustand";

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
/**
 * Snoozes in memory, shared by every `useForcedMigrations` caller (the popup
 * and the alerts that wait for it), so a snooze in one is seen by all at once
 * and closing still works when storage is blocked.
 */
const useSessionSnoozeStore = create<{
  sessionSnoozes: Record<string, number>;
  addSnoozes: (keys: string[], snoozedAt: number) => void;
}>((set) => ({
  sessionSnoozes: {},
  addSnoozes: (keys, snoozedAt) =>
    set(({ sessionSnoozes }) => ({
      sessionSnoozes: {
        ...sessionSnoozes,
        ...Object.fromEntries(keys.map((key) => [key, snoozedAt])),
      },
    })),
}));

export const useForcedMigrations = () => {
  const { address, isWalletConnected: isOsmosisWalletConnected } = useWallet();
  const { isLoading: isWalletLoading } = useWalletSelect();
  const { forcedMigrations } = useFeatureFlags();

  // Bumped at stage / snooze boundaries: visibility is derived at render
  // time, so a re-render re-evaluates it. A new snooze re-renders every caller
  // through the shared store.
  const [, forceVisibilityUpdate] = useReducer((count: number) => count + 1, 0);
  const sessionSnoozes = useSessionSnoozeStore(
    ({ sessionSnoozes }) => sessionSnoozes
  );
  const addSnoozes = useSessionSnoozeStore(({ addSnoozes }) => addSnoozes);

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

  const {
    data: portfolioAssets,
    // After mount, not just fetched: a restored persisted cache already
    // counts as fetched and may hold a previous session's state.
    isFetchedAfterMount: isPortfolioFetched,
    isError: isPortfolioError,
  } = api.local.portfolio.getPortfolioAssets.useQuery(
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
    isFetchedAfterMount: isHoldingsFetched,
    isError: isHoldingsError,
    refetch: refetchHoldings,
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
    // portfolio-totals fallback and then change shape. A failed portfolio
    // still evaluates the chain holdings (no bank rows or prices, so they
    // count as unpriced), rather than going quiet on a wallet known to hold
    // the old asset.
    isEnabled &&
    isHoldingsFetched &&
    (portfolioAssets || (isPortfolioFetched && isPortfolioError))
      ? getActiveForcedMigrations({
          migrations,
          heldAssets: portfolioAssets?.heldAssets ?? [],
          assetVariants: portfolioAssets?.assetVariants ?? [],
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

  // Unlocks finishing free their funds, which can bring the popup back (a
  // wallet holding only unlocking positions has no active migration until
  // then), so holdings are refetched just after each one ends. Read from the
  // raw holdings for that reason, with a few seconds for the block.
  const UNLOCK_SETTLE_MS = 10_000;
  const nextUnlockEndMs = Math.min(
    ...(holdings ?? [])
      .flatMap((holding) => {
        if (holding.kind === "order" || holding.state !== "unlocking")
          return [];
        // A pool's unlocking locks share one row; the first to end frees
        // shares, so schedule on the earliest.
        const end =
          (holding.kind === "share" && holding.nextUnlockEndTime) ||
          holding.unlockEndTime;
        return end ? [new Date(end).getTime() + UNLOCK_SETTLE_MS] : [];
      })
      .filter((time) => !Number.isNaN(time) && time > now.getTime())
  );

  // Re-render at the next boundary that can change visibility: a migration
  // starting, escalating or passing its deadline, a snooze running out, or an
  // unlock finishing.
  const nextBoundaryMs = Math.min(
    nextUnlockEndMs,
    ...migrations.flatMap(({ startDate, escalateDate, deadline }) =>
      [startDate, escalateDate, deadline]
        .map((date) => (date ? new Date(date).getTime() : NaN))
        .filter((time) => !Number.isNaN(time) && time > now.getTime())
    ),
    ...activeMigrations.map(({ migration, stage }) => {
      const snoozedAtMs = getSnoozedAtMs(migration.id);
      const endMs =
        snoozedAtMs === undefined
          ? Number.POSITIVE_INFINITY
          : getForcedMigrationSnoozeEndMs(snoozedAtMs, stage);
      // An expired snooze keeps its stored key; it's no longer a boundary.
      return endMs > now.getTime() ? endMs : Number.POSITIVE_INFINITY;
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
    const isUnlockEnd = nextBoundaryMs === nextUnlockEndMs;
    const timeout = setTimeout(() => {
      if (isUnlockEnd) void refetchHoldings();
      forceVisibilityUpdate();
    }, delay);
    return () => clearTimeout(timeout);
  }, [nextBoundaryMs, nextUnlockEndMs, refetchHoldings]);

  const snooze = useCallback(
    (ids: string[]) => {
      const snoozedAt = Date.now();
      const keys = ids.map((id) =>
        getForcedMigrationSnoozeKey(id, address ?? "")
      );
      keys.forEach((key) => {
        try {
          window.localStorage.setItem(key, String(snoozedAt));
        } catch {
          // The in-memory snooze below covers this session.
        }
      });
      // Written after storage, so every caller re-renders with both in place.
      addSnoozes(keys, snoozedAt);
    },
    [address, addSnoozes]
  );

  return { activeMigrations, visibleMigrations, isSettled, snooze };
};
