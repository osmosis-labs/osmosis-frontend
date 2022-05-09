import { GetServerSidePropsContext } from "next";
import { OsmosisQueries } from "@osmosis-labs/stores";
import { RootStore } from "../root";
import { PoolsPageSSRProps } from "./types";
import { configureContext } from "./configure-context";

/**
 * Fetch data from store that is relevant to pools page if initial load.
 * @param context Context object from `getServerSideProps`.
 * @returns Pools page data, or null if data assumed to be on client.
 */
export async function getPoolsPageData(
  context: GetServerSidePropsContext
): Promise<PoolsPageSSRProps | null> {
  // Next.js provides `/pools` url for initial page render,
  // and `/_next/**` url for subsequent page renders.
  // Resolve to null to let client-side store be used.
  if (context.req.url !== "/pools") {
    return Promise.resolve(null);
  }

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

/**
 * Pre-populate store data.
 * @param stores Stores to hydrate.
 * @param poolsPageProps Fresh pools page data. Nullable for when data is already on client.
 */
export function hydratePoolsPageStores(
  { osmosis }: OsmosisQueries,
  poolsPageProps: PoolsPageSSRProps | null
) {
  if (!poolsPageProps) {
    return;
  }

  const { pools, superfluidPools, epochs } = poolsPageProps;

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
