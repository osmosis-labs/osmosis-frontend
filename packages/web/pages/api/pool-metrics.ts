import { ObservableQuery } from "@keplr-wallet/stores";
import { PoolFallbackPriceStore, PoolMetrics } from "@osmosis-labs/stores";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { $mobx, autorun } from "mobx";
import type { NextApiRequest, NextApiResponse } from "next";

dayjs.extend(duration);

import { RootStore } from "~/stores/root";
import { getObjectsByClass } from "~/utils/object";

export default async function poolMetrics(
  req: NextApiRequest,
  res: NextApiResponse<PoolMetrics>
) {
  if (!req.method || req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }
  if (!req.query?.poolId) return res.status(400);
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate"); // 15 minute cache

  const {
    derivedDataStore,
    priceStore,
    queriesStore,
    chainStore: {
      osmosis: { chainId },
    },
    queriesExternalStore,
  } = new RootStore();
  const osmosisQueries = queriesStore.get(chainId).osmosis!;

  const poolId = req.query.poolId as string;
  const { poolBonding } = derivedDataStore.getForPool(poolId);

  // check if pool is incentivized
  await osmosisQueries.queryIncentivizedPools.waitResponse();

  // all the query objects referenced by the poolBonding object
  const observableQueries = Array.from(
    new Set(getObjectsByClass((poolBonding as any)[$mobx], ObservableQuery))
  ).filter(
    (q) => !(q instanceof PoolFallbackPriceStore) // calculate this on client
  );

  // wait for all the queries to be ready
  await Promise.all(observableQueries.map((q) => q.waitResponse()));

  const metrics =
    queriesExternalStore.queryGammPoolFeeMetrics.getPoolFeesMetrics(
      poolId,
      priceStore
    );
  const fees7d = metrics.feesSpent7d.toDec().toString();
  const volume24h = metrics.volume24h.toDec().toString();

  if (!osmosisQueries.queryIncentivizedPools.isIncentivized(poolId)) {
    return res
      .status(200)
      .json({ maxApr: "0", fees7d, volume24hUsd: volume24h });
  }

  let stopObserving: ReturnType<typeof autorun> | undefined;
  const eventualMetrics = new Promise<PoolMetrics>((resolve, reject) => {
    // set a timeout to guarauntee the user gets a response
    setTimeout(() => {
      reject(new Error("Metrics not found"));
    }, 10_000);

    // will resolve once the desired conditions are met
    stopObserving = autorun(() => {
      if (!poolBonding.highestBondDuration || !priceStore.response) return;

      resolve({
        maxApr: poolBonding.highestBondDuration.aggregateApr.toDec().toString(),
        fees7d,
        volume24hUsd: volume24h,
      });
    });
  });

  const result = await eventualMetrics;
  stopObserving?.();

  return res.status(200).json(result);
}
