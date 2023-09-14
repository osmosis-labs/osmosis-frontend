import { Dec } from "@keplr-wallet/unit";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import { autorun, reaction, when } from "mobx";
import { useCallback, useEffect, useRef, useState } from "react";

import { IS_TESTNET } from "~/config";
import { useStore } from "~/stores";
import { UnverifiedAssetsState } from "~/stores/user-settings";

import { useFeatureFlags } from "../use-feature-flags";

/** Minimal number of pools considered routable from prior knowledge. Subject to change */
export const ROUTABLE_POOL_COUNT = 200;

/** Use memoized pools considered fit for routing, likely within the swap tool component.
 *  Fitness is determined by sufficient TVL per pool type, and whether the pool is verified.
 *
 * @param numPoolsLimit The maximum number of pools to load from the chain to reduce data transfer
 *  based on prior knowledge of how many pools are routable.
 * @returns List of query pool objects, or undefined if loading.
 */
export function useRoutablePools(
  numPoolsLimit = ROUTABLE_POOL_COUNT
): ObservableQueryPool[] | undefined {
  const {
    chainStore: {
      osmosis: { chainId },
    },
    queriesStore,
    priceStore,
    userSettings,
  } = useStore();
  const flags = useFeatureFlags();

  const queries = queriesStore.get(chainId);
  const queryOsmosis = queries.osmosis!;
  const queryPools = queryOsmosis.queryPools;
  const showUnverified =
    userSettings.getUserSettingById<UnverifiedAssetsState>("unverified-assets")
      ?.state?.showUnverifiedAssets;

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
    await queryPools.fetchRemainingPools(numPoolsLimit);
    const allPools = queryPools.getAllPools();

    // Get the remote data if needed in price store before filtering by TVL.
    await when(() => Boolean(priceStore.response));

    if (IS_TESTNET) {
      setRoutablePools(allPools);
      return;
    }

    if (flags.concentratedLiquidity) {
      // Wait for CL pool balances to load if not already.
      // This takes a long time, and in our case should only happen if the
      // filtered-pools query is not being used.
      const queryClPools = allPools.filter(
        (pool) => pool.type === "concentrated" && pool.poolAssets.length === 0
      );
      if (queryClPools.length > 0) {
        await when(() => {
          const allClPoolBalancesLoaded = queryClPools.every((queryClPool) =>
            queries.queryBalances
              .getQueryBech32Address(
                (queryClPool.pool as ConcentratedLiquidityPool).address
              )
              .balances.some((balance) => Boolean(balance.response))
          );

          const allClPoolsAssetsLoaded = queryClPools.every(
            (queryClPool) => queryClPool.poolAssets.length > 0
          );

          return allClPoolBalancesLoaded && allClPoolsAssetsLoaded;
        });
      }
    }

    // wrapping in autorun then immediately disposing the reaction as a way to silence the computedFn warnings
    autorun(() => {
      const filteredPools = allPools
        .filter((pool) => {
          // filter concentrated pools if feature flag is not enabled
          if (pool.type === "concentrated" && !flags.concentratedLiquidity)
            return false;

          // some min TVL for balancer pools
          return pool
            .computeTotalValueLocked(priceStore)
            .toDec()
            .gte(
              new Dec(
                showUnverified || pool.type === "concentrated" ? 1_000 : 10_000
              )
            );
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
    showUnverified,
    // below should remain constant
    queryPools,
    priceStore,
    queries,
  ]);

  // initial load, where a future reaction will be triggered from the query stores later
  useEffect(() => {
    if (!routablePools && !isLoading && flags._isInitialized) {
      loadPools();
    }
  }, [loadPools, routablePools, isLoading, flags._isInitialized]);

  return isLoading ? undefined : routablePools ?? undefined;
}
