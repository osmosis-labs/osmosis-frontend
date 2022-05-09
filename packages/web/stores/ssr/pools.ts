import { GetServerSidePropsContext } from "next";
import { OsmosisQueries } from "@osmosis-labs/stores";
import { RootStore } from "../root";
import { PoolsPageSSRProps } from "./types";
import { configureContext } from "./configure-context";

/** Construct the store and take response data needed for pools page. */
export async function getPoolsPageData(
  context: GetServerSidePropsContext
): Promise<PoolsPageSSRProps> {
  configureContext(context);

  const { chainStore, queriesStore } = new RootStore();
  const { chainId } = chainStore.osmosis;
  const osmosisQueries = queriesStore.get(chainId).osmosis;

  const pools = await osmosisQueries?.queryGammPools.waitFreshResponse();
  const superfluidPools =
    await osmosisQueries?.querySuperfluidPools.waitFreshResponse();
  const epochs = await osmosisQueries?.queryEpochs.waitFreshResponse();

  return {
    pools,
    superfluidPools,
    epochs,
  };
}

/** Hydrate the stores with pools data. */
export function hydratePoolsPageStores(
  { osmosis }: OsmosisQueries,
  { pools, superfluidPools, epochs }: PoolsPageSSRProps
) {
  if (pools) {
    osmosis?.queryGammPools.hydrate(pools);
  }
  if (superfluidPools) {
    osmosis?.querySuperfluidPools.hydrate(superfluidPools);
  }
  if (epochs) {
    osmosis?.queryEpochs.hydrate(epochs);
  }
}
