import {
  getConcentratedRaw,
  getPoolRawDenoms,
  getStableRaw,
  getWeightedRaw,
  type Pool,
} from "@osmosis-labs/server";
import type { ObservableCreatePoolConfig } from "@osmosis-labs/stores/build/ui-config/create-pool";
import { Dec } from "@osmosis-labs/unit";
import { runInAction } from "mobx";
import { useEffect, useMemo } from "react";

import { api } from "~/utils/trpc";

/** Discriminated union describing a pool the user is about to create.
 *  Each arm carries the exact keys used to decide if an existing pool is an
 *  exact match — the asset set + the type-specific parameters. All denoms
 *  must be `coinMinimalDenom` (never display denom) so IBC tokens with the
 *  same symbol are not conflated. */
export type ProposedPool =
  | {
      kind: "weighted";
      /** Minimal denoms; order does not matter. */
      denoms: string[];
      /** Map from minimal denom → percentage (0–100), e.g. 50 for half-share.
       *  Compared as a ratio against the existing pool's weight/total_weight,
       *  since chain-stored weights are arbitrary integers normalized by
       *  total_weight (e.g. 2^29 scale on legacy pools). */
      weights: Record<string, number>;
      /** Decimal string, e.g. "0.003". */
      swapFee: string;
    }
  | {
      kind: "stable";
      denoms: string[];
      /** Map from minimal denom → scaling factor (number). */
      scalingFactors: Record<string, number>;
      swapFee: string;
    }
  | {
      kind: "concentrated";
      /** Either ordering accepted; canonicalised before comparison. */
      denom0: string;
      denom1: string;
      /** Decimal string, e.g. "0.001000000000000000". */
      spreadFactor: string;
      tickSpacing: number;
    };
// Future: Orderbook arm to be added when its creation flow lands.

export interface ExistingPoolSummary {
  id: string;
  type: Pool["type"];
  denoms: string[];
  /** Display symbols (e.g. "USDC", "OSMO") aligned with `denoms` order where
   *  resolvable from the pool's reserveCoins. May be empty if the pool's
   *  reserves were not in the asset list. */
  symbols: string[];
  /** Pretty-formatted TVL preserved from server, callers can re-format. */
  totalFiatValueLocked: Pool["totalFiatValueLocked"];
  /** Raw TVL number for sorting. */
  tvlNumber: number;
  /** "/pool/{id}". */
  detailUrl: string;
  /** Decimal string for swap fee / spread factor (raw chain repr). */
  feeRaw: string;
}

export interface DuplicatePoolCheckResult {
  status: "idle" | "loading" | "ready" | "error";
  exactMatches: ExistingPoolSummary[];
  similarMatches: ExistingPoolSummary[];
}

/** Sort denoms lexicographically to produce a stable asset-set key. */
export function canonicalizeDenoms(denoms: string[]): string[] {
  return [...denoms].sort((a, b) => a.localeCompare(b));
}

/** Mirror chain-side canonical token0/token1 ordering for CL pools. */
export function canonicalizeCLPair(
  a: string,
  b: string
): { denom0: string; denom1: string } {
  return a.localeCompare(b) <= 0
    ? { denom0: a, denom1: b }
    : { denom0: b, denom1: a };
}

function decEq(a: string, b: string): boolean {
  try {
    return new Dec(a).equals(new Dec(b));
  } catch {
    return false;
  }
}

function sameDenomSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const ca = canonicalizeDenoms(a);
  const cb = canonicalizeDenoms(b);
  for (let i = 0; i < ca.length; i++) {
    if (ca[i] !== cb[i]) return false;
  }
  return true;
}

/** Pool fee in canonical decimal-string form, regardless of pool type. The
 *  server already normalises `pool_params.swap_fee` (weighted/stable) and
 *  `spread_factor` (concentrated) into `pool.spreadFactor`. */
function poolFeeDec(pool: Pool): string {
  return pool.spreadFactor.toDec().toString();
}

function isExactWeighted(
  proposed: Extract<ProposedPool, { kind: "weighted" }>,
  pool: Pool
): boolean {
  const raw = getWeightedRaw(pool);
  if (!raw) return false;
  const assets = raw.pool_assets;
  const totalWeight = raw.total_weight;
  if (!assets || !totalWeight) return false;
  const denoms = assets.map((a) => a.token.denom);
  if (!sameDenomSet(denoms, proposed.denoms)) return false;

  // Compare normalized weight ratios. Chain stores weights as arbitrary
  // integers scaled by total_weight (e.g. 2^29 × 10^6 for a 50/50 pool),
  // so a direct integer compare against the user's percentage is wrong.
  let totalDec: Dec;
  try {
    totalDec = new Dec(totalWeight);
  } catch {
    return false;
  }
  if (totalDec.isZero()) return false;
  const oneHundred = new Dec(100);
  for (const a of assets) {
    const proposedPct = proposed.weights[a.token.denom];
    if (proposedPct === undefined) return false;
    let existingRatioPct: Dec;
    try {
      existingRatioPct = new Dec(a.weight).quo(totalDec).mul(oneHundred);
    } catch {
      return false;
    }
    // Round to 2 decimals before comparing — the user enters integer percents
    // (or close to it) but legacy pools have weights that don't divide evenly.
    const proposedScaled = new Dec(proposedPct)
      .mul(new Dec(100))
      .truncate()
      .toString();
    const existingScaled = existingRatioPct
      .mul(new Dec(100))
      .truncate()
      .toString();
    if (proposedScaled !== existingScaled) return false;
  }
  return decEq(poolFeeDec(pool), proposed.swapFee);
}

function isExactStable(
  proposed: Extract<ProposedPool, { kind: "stable" }>,
  pool: Pool
): boolean {
  const raw = getStableRaw(pool);
  if (!raw) return false;
  const liquidity = raw.pool_liquidity;
  const factors = raw.scaling_factors;
  if (!liquidity || !factors) return false;
  const denoms = liquidity.map((a) => a.denom);
  if (!sameDenomSet(denoms, proposed.denoms)) return false;
  if (factors.length !== liquidity.length) return false;
  // scaling_factors is parallel to pool_liquidity, so map by index.
  for (let i = 0; i < liquidity.length; i++) {
    const denom = liquidity[i].denom;
    const proposedFactor = proposed.scalingFactors[denom];
    if (proposedFactor === undefined) return false;
    if (!decEq(String(proposedFactor), factors[i])) return false;
  }
  return decEq(poolFeeDec(pool), proposed.swapFee);
}

function isExactConcentrated(
  proposed: Extract<ProposedPool, { kind: "concentrated" }>,
  pool: Pool
): boolean {
  const raw = getConcentratedRaw(pool);
  if (!raw) return false;
  if (!raw.token0 || !raw.token1) return false;
  const proposedCanonical = canonicalizeCLPair(
    proposed.denom0,
    proposed.denom1
  );
  const existingCanonical = canonicalizeCLPair(raw.token0, raw.token1);
  if (
    proposedCanonical.denom0 !== existingCanonical.denom0 ||
    proposedCanonical.denom1 !== existingCanonical.denom1
  ) {
    return false;
  }
  if (!decEq(poolFeeDec(pool), proposed.spreadFactor)) return false;
  if (raw.tick_spacing === undefined) return false;
  return decEq(raw.tick_spacing, String(proposed.tickSpacing));
}

function hasSameDenomSet(proposed: ProposedPool, pool: Pool): boolean {
  // "Similar" is cross-type: a user creating a Balancer ATOM/OSMO should see
  // an existing Concentrated ATOM/OSMO in the informational list, since the
  // CL pool is likely a better home for their liquidity. The exact-match
  // tier is still type-strict via isExactWeighted/Stable/Concentrated, so
  // the gating UX is unaffected; only the soft "similar pools" callout
  // widens.
  const proposedDenoms =
    proposed.kind === "concentrated"
      ? [proposed.denom0, proposed.denom1]
      : proposed.denoms;
  return sameDenomSet(proposedDenoms, getPoolRawDenoms(pool));
}

function summarize(pool: Pool): ExistingPoolSummary {
  const denoms = getPoolRawDenoms(pool);
  // Map each denom to its display symbol via the pool's reserveCoins lookup.
  // reserveCoins ordering does not always match raw denom ordering, so resolve
  // by minimal denom rather than index.
  const symbolByDenom = new Map<string, string>();
  for (const coin of pool.reserveCoins) {
    symbolByDenom.set(coin.currency.coinMinimalDenom, coin.currency.coinDenom);
  }
  const symbols = denoms.map((d) => symbolByDenom.get(d) ?? "");
  return {
    id: pool.id,
    type: pool.type,
    denoms,
    symbols,
    totalFiatValueLocked: pool.totalFiatValueLocked,
    tvlNumber: Number(pool.totalFiatValueLocked.toDec().toString()),
    detailUrl: `/pool/${pool.id}`,
    feeRaw: poolFeeDec(pool),
  };
}

/** Pure classification: given a proposed pool and a candidate list of existing
 *  pools (already filtered to those sharing the proposed denoms), return the
 *  exact/similar partition. Exported for unit testing. */
export function classifyMatches(
  proposed: ProposedPool,
  candidates: Pool[]
): {
  exactMatches: ExistingPoolSummary[];
  similarMatches: ExistingPoolSummary[];
} {
  const exactMatches: ExistingPoolSummary[] = [];
  const similarMatches: ExistingPoolSummary[] = [];

  for (const pool of candidates) {
    let isExact = false;
    if (proposed.kind === "weighted") isExact = isExactWeighted(proposed, pool);
    else if (proposed.kind === "stable")
      isExact = isExactStable(proposed, pool);
    else if (proposed.kind === "concentrated")
      isExact = isExactConcentrated(proposed, pool);

    if (isExact) {
      exactMatches.push(summarize(pool));
    } else if (hasSameDenomSet(proposed, pool)) {
      similarMatches.push(summarize(pool));
    }
  }

  // Sort by TVL desc so the most-liquid match shows first.
  const byTvl = (a: ExistingPoolSummary, b: ExistingPoolSummary) =>
    b.tvlNumber - a.tvlNumber;
  exactMatches.sort(byTvl);
  similarMatches.sort(byTvl);

  return { exactMatches, similarMatches };
}

function getProposedDenoms(p: ProposedPool): string[] {
  if (p.kind === "concentrated") return [p.denom0, p.denom1];
  return p.denoms;
}

/** React hook: looks up existing pools that share the proposed denoms and
 *  classifies them as exact or near duplicates. Caller controls when the
 *  query fires via `enabled` (e.g. when entering the review step).
 *
 *  Implementation note: SQS's `denoms` filter is OR-semantics, so a single
 *  page (limit 100) of a popular asset like USDC can omit the low-TVL pool
 *  the user is about to duplicate. We auto-fetch every page until the cursor
 *  is exhausted, then JS-filter to the asset set the user proposed. No type
 *  filter on the query: similar matches are surfaced cross-type so a user
 *  creating a Balancer ATOM/OSMO sees an existing Concentrated ATOM/OSMO
 *  (and vice versa) in the informational list. */
export function useDuplicatePoolCheck({
  proposed,
  enabled,
}: {
  proposed: ProposedPool | null;
  enabled: boolean;
}): DuplicatePoolCheckResult {
  const denoms = proposed ? getProposedDenoms(proposed) : [];
  const queryEnabled = enabled && denoms.length >= 2;

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
  } = api.local.pools.getPools.useInfiniteQuery(
    {
      denoms,
      limit: 100,
      // Don't filter by min liquidity — a duplicate at $0 TVL is still a
      // duplicate, and the user should know about it.
      minLiquidityUsd: 0,
    },
    {
      enabled: queryEnabled,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
      // Pool creation is irreversible and fee-bearing, so the check prefers
      // freshness over cache reuse. A pool created seconds ago must surface
      // here, not get hidden behind a stale-while-revalidate window.
      staleTime: 0,
      refetchOnMount: "always",
      // expensive query, mirrors pools-table pattern
      trpc: { context: { skipBatch: true } },
    }
  );

  // Cap auto-pagination so a popular token (USDC, OSMO) can't trigger
  // dozens of sequential API calls and block the user for many seconds
  // while the gate sits in "loading". Pages are TVL-desc, so any duplicate
  // worth warning about is well within the first MAX_PAGES * 100 = 2000
  // pools. If a duplicate sits below that, the user is making it anyway —
  // the soft warning surface doesn't justify a multi-second blocked UI.
  const MAX_PAGES = 20;
  const fetchedPageCount = data?.pages.length ?? 0;
  const canFetchMore = fetchedPageCount < MAX_PAGES;

  // Auto-fetch the next page so a low-TVL duplicate beyond the first page
  // is not silently missed. Skipped once the query errors — `hasNextPage`
  // stays true after a failed `fetchNextPage()` (it's driven by the last
  // successful page's cursor), and re-firing on every settle would create
  // an infinite retry loop. Also skipped once we hit the page cap.
  useEffect(() => {
    if (
      queryEnabled &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isError &&
      canFetchMore
    ) {
      fetchNextPage();
    }
  }, [
    queryEnabled,
    hasNextPage,
    isFetchingNextPage,
    isError,
    canFetchMore,
    fetchNextPage,
  ]);

  return useMemo<DuplicatePoolCheckResult>(() => {
    if (!proposed || !queryEnabled) {
      return { status: "idle", exactMatches: [], similarMatches: [] };
    }
    // On any query error, surface an explicit "error" state rather than
    // hanging in "loading" or pretending the check passed. The downstream
    // gate does NOT block on error (avoids deadlocking creation if SQS is
    // unavailable); the callout shows that we can't guarantee no duplicate
    // exists, and the user can retry by reopening the flow. Whatever pages
    // were successfully fetched are still classified so any duplicates we
    // did see are surfaced.
    if (isError) {
      const partial = data?.pages.flatMap((p) => p.items) ?? [];
      const { exactMatches, similarMatches } = classifyMatches(
        proposed,
        partial
      );
      return { status: "error", exactMatches, similarMatches };
    }
    // Use `isLoading` (initial-fetch-only), not `isFetching` (also true on
    // background refetches). Otherwise a focus-driven refetch under
    // `staleTime: 0` would briefly drop us back to "loading" with empty
    // matches, which `useDuplicateGate` would observe as `hasExact = false`
    // and use to clear the user's acknowledgement mid-refetch.
    // Treat `hasNextPage` as "still fetching" only while we're still
    // willing to fetch more (under the MAX_PAGES cap); past the cap the
    // cursor is still non-empty but we've decided to stop.
    const stillFetching =
      isLoading || isFetchingNextPage || (hasNextPage && canFetchMore);
    if (!data || stillFetching) {
      return { status: "loading", exactMatches: [], similarMatches: [] };
    }
    const allItems = data.pages.flatMap((p) => p.items);
    const { exactMatches, similarMatches } = classifyMatches(
      proposed,
      allItems
    );
    return { status: "ready", exactMatches, similarMatches };
  }, [
    proposed,
    queryEnabled,
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isError,
    canFetchMore,
  ]);
}

/** Wraps the gate-flag writes onto `ObservableCreatePoolConfig`. Sets
 *  `duplicateBlocking` while the duplicate check is loading or has an exact
 *  match, and resets `duplicateAcknowledged` when the matched-pool identity
 *  changes (or when there's no exact match). Both writes go through a single
 *  `runInAction` per change to keep mobx semantics clean and avoid the
 *  side-effect-from-component-effect pattern. */
export function useDuplicateGate({
  config,
  status,
  exactMatches,
  proposed,
}: {
  config: ObservableCreatePoolConfig;
  status: DuplicatePoolCheckResult["status"];
  exactMatches: ExistingPoolSummary[];
  proposed: ProposedPool | null;
}): void {
  // Sort ids before joining so a pure TVL reordering of the same matched
  // set doesn't look like a different identity and silently clear the
  // user's acknowledgement.
  const exactMatchKey = exactMatches
    .map((m) => m.id)
    .sort()
    .join("|");
  const isPending = proposed !== null && status === "loading";
  const hasExact = exactMatches.length > 0;

  useEffect(() => {
    runInAction(() => {
      config.duplicateBlocking = isPending || hasExact;
      if (!hasExact) config.duplicateAcknowledged = false;
    });
  }, [config, isPending, hasExact]);

  // Reset blocking flags on unmount only. The create-pool config is a
  // singleton owned by the parent modal, so without this cleanup a stale
  // `duplicateBlocking = true` from a previous pool-type's flow would leak
  // into the next mount and briefly disable the new flow's button until
  // the first paint's effect corrects it.
  useEffect(() => {
    return () => {
      runInAction(() => {
        config.duplicateBlocking = false;
        config.duplicateAcknowledged = false;
      });
    };
  }, [config]);

  useEffect(() => {
    runInAction(() => {
      config.duplicateAcknowledged = false;
    });
  }, [config, exactMatchKey]);
}
