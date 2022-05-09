import {
  OsmosisQueries,
  ObservableQueryPoolFeesMetrics,
} from "@osmosis-labs/stores";
import { RootStore } from "../root";
import { PoolsPageSSRProps } from "./types";

/**
 * Fetch data from store that is relevant to pools page.
 * @returns Pools page data. Sent to client initially embedded in HTML or later as JSON within session.
 */
export async function getPoolsPageData(): Promise<PoolsPageSSRProps | null> {
  const { chainStore, queriesStore, queriesExternalStore } = new RootStore();
  const { chainId } = chainStore.osmosis;
  const osmosisQueries = queriesStore.get(chainId).osmosis;

  const pools = await osmosisQueries?.queryGammPools.waitFreshResponse();
  const poolsFeeData = await queriesExternalStore
    .get()
    .queryGammPoolFeeMetrics.waitFreshResponse();
  const superfluidPools =
    await osmosisQueries?.querySuperfluidPools.waitFreshResponse();
  const epochs = await osmosisQueries?.queryEpochs.waitFreshResponse();

  return {
    pools,
    poolsFeeData,
    superfluidPools,
    epochs,
  };
}

/**
 * Pre-populate store data.
 * @param stores Stores to hydrate.
 * @param poolsPageProps Fresh pools page data. Nullable for when data is already on client.
 */
export function hydratePoolsPageStores(
  { osmosis }: OsmosisQueries,
  queryGammPoolFeeMetrics: ObservableQueryPoolFeesMetrics,
  poolsPageProps: PoolsPageSSRProps | null
) {
  if (!poolsPageProps) {
    return;
  }

  const { pools, poolsFeeData, superfluidPools, epochs } = poolsPageProps;

  if (pools) {
    osmosis?.queryGammPools.hydrate(pools);
  }
  if (poolsFeeData) {
    queryGammPoolFeeMetrics.hydrate(poolsFeeData);
  }
  if (superfluidPools) {
    osmosis?.querySuperfluidPools.hydrate(superfluidPools);
  }
  if (epochs) {
    osmosis?.queryEpochs.hydrate(epochs);
  }
}
