import { Dec } from "@keplr-wallet/unit";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import { autorun, reaction, when } from "mobx";
import { useCallback, useEffect, useRef, useState } from "react";

import { ENABLE_FEATURES, IS_TESTNET } from "~/config";
import { useStore } from "~/stores";

import { useFeatureFlags } from "../use-feature-flags";

/** Minimal number of pools considered routable from prior knowledge. Subject to change */
export const ROUTABLE_POOL_COUNT = IS_TESTNET ? 10_000 : 300;
const ROUTABLE_POOL_MIN_LIQUIDITY = IS_TESTNET ? 0 : 1_000;

/** Use memoized pools considered fit for routing, likely within the swap tool component.
 *  Fitness is determined by sufficient TVL per pool type, and whether the pool is verified.
 *
 * @param numPoolsLimit The maximum number of pools to load from the chain to reduce data transfer
 *  based on prior knowledge of how many pools are routable.
 * @returns List of query pool objects, or undefined if loading.
 */
export function useRoutablePools(
  numPoolsLimit = ROUTABLE_POOL_COUNT,
  minimumLiquidity = ROUTABLE_POOL_MIN_LIQUIDITY
): ObservableQueryPool[] | undefined {
  const {
    chainStore: {
      osmosis: { chainId },
    },
    queriesStore,
    priceStore,
  } = useStore();
  const flags = useFeatureFlags();

  const queries = queriesStore.get(chainId);
  const queryOsmosis = queries.osmosis!;
  const queryPools = queryOsmosis.queryPools;

  const [routablePools, setRoutablePools] = useState<
    ObservableQueryPool[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const reloadPoolsReactionDisposer = useRef<() => void | undefined>();

  // dispose of reaction to avoid memory leaks and overhead
  useEffect(() => () => reloadPoolsReactionDisposer.current?.(), []);

  // Normally we can just use mobx to react to the dependent query stores in a view.
  // However, due to how data-intensive the pool query and filter process is
  // we instead manually query for pools outside of a reactive context (in the useEffect).
  // Then, we only trigger renders when the data (pools, price, etc) is in the desired state.
  // The exception is that we react to the userSettings state to show/hide unverified assets
  // as well as the feature flag for concentrated liquidity.
  const loadPools = useCallback(async () => {
    // Dispose of any previous reaction to avoid memory leaks and overhead
    reloadPoolsReactionDisposer?.current?.();

    setIsLoading(true);
    await queryPools.fetchRemainingPools({
      limit: numPoolsLimit,
      minLiquidity: minimumLiquidity,
    });
    const allPools = queryPools.getAllPools();

    // Get the remote data if needed in price store before filtering by TVL.
    await when(() => Boolean(priceStore.response));

    if (IS_TESTNET) {
      setRoutablePools(allPools);
      setIsLoading(false);
      return;
    }

    // wrapping in autorun then immediately disposing the reaction as a way to silence the computedFn warnings
    // TODO: This function is a 200+ ms performance bottleneck for us right now.
    // We need to:
    // - speedup ComputeTotalValueLocked
    // - Remove unnecessary type casts
    autorun(() => {
      const filteredPools = allPools
        .filter((pool) => {
          // filter concentrated pools if feature flag is not enabled
          if (
            pool.type === "concentrated" &&
            !(ENABLE_FEATURES || flags.concentratedLiquidity)
          )
            return false;

          // some min TVL for balancer pools
          return pool
            .computeTotalValueLocked(priceStore)
            .toDec()
            .gte(new Dec(1_000));
        })
        .sort((a, b) => {
          // sort by TVL to find routes amongst most valuable pools first
          const aTVL = a.computeTotalValueLocked(priceStore);
          const bTVL = b.computeTotalValueLocked(priceStore);

          return Number(bTVL.sub(aTVL).toDec().toString());
        });

      setRoutablePools(filteredPools);
    })(); // dispose immediately

    setIsLoading(false);

    // add reaction to run loadPools() if specific query data changes, only after the data is loaded
    reloadPoolsReactionDisposer.current = reaction(
      () => {
        return [queryPools.response, priceStore.response];
      },
      () => {
        if (!queryPools.isFetching && !priceStore.isFetching) {
          loadPools();
        }
      }
    );
  }, [
    flags.concentratedLiquidity,
    numPoolsLimit,
    minimumLiquidity,
    // below should remain constant
    queryPools,
    priceStore,
  ]);

  // initial load, where a future reaction will be triggered from the query stores later
  useEffect(() => {
    if (
      !routablePools &&
      !isLoading &&
      (flags._isInitialized || !flags._isClientIDPresent)
    ) {
      loadPools();
    }
  }, [
    loadPools,
    routablePools,
    isLoading,
    flags._isInitialized,
    flags._isClientIDPresent,
  ]);

  return isLoading ? undefined : routablePools ?? undefined;
}
