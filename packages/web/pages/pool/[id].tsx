import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect } from "react";

import { ConcentratedLiquidityPool, SharePool } from "~/components/pool-detail";

import { useStore } from "../../stores";

const Pool: FunctionComponent = observer(() => {
  const router = useRouter();
  const { chainStore, queriesStore } = useStore();
  const { id: poolId } = router.query as { id: string };
  const { chainId } = chainStore.osmosis;

  const queryOsmosis = queriesStore.get(chainId).osmosis!;

  // eject to pools page if pool does not exist
  const poolExists =
    poolId && typeof poolId === "string"
      ? queryOsmosis.queryGammPools.poolExists(poolId)
      : undefined;
  useEffect(() => {
    if (poolExists === false) {
      router.push("/pools");
    }
  }, [poolExists, router]);

  console.log({ poolId, poolExists });

  if (poolExists === undefined) return null; // TODO: use skeleton loader page

  const queryPool = queryOsmosis.queryGammPools.getPool(poolId);

  if (queryPool === undefined) return null;

  if (queryPool.type === "concentrated") {
    return <ConcentratedLiquidityPool poolId={poolId} />;
  }

  // share pool; stable, balancer
  return <SharePool poolId={poolId} />;
});

export default Pool;
