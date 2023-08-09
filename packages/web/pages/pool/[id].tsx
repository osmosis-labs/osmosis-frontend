import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { ConcentratedLiquidityPool, SharePool } from "~/components/pool-detail";
import { useNavBar } from "~/hooks";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { TradeTokens } from "~/modals";
import { useStore } from "~/stores";

const Pool: FunctionComponent = observer(() => {
  const router = useRouter();
  const { chainStore, queriesStore } = useStore();
  const { id: poolId } = router.query as { id: string };
  const { chainId } = chainStore.osmosis;
  const t = useTranslation();

  const queryOsmosis = queriesStore.get(chainId).osmosis!;

  const flags = useFeatureFlags();

  const [showTradeModal, setShowTradeModal] = useState(false);

  // eject to pools page if pool does not exist
  const poolExists =
    poolId && typeof poolId === "string"
      ? queryOsmosis.queryPools.poolExists(poolId)
      : undefined;
  useEffect(() => {
    if (poolExists === false) {
      router.push("/pools");
    }
  }, [poolExists, router]);

  const queryPool = queryOsmosis.queryPools.getPool(poolId);

  useNavBar(
    useMemo(
      () => ({
        title: t("pool.title", { id: poolId ?? "" }),
        ctas: [
          { label: t("pool.swap"), onClick: () => setShowTradeModal(true) },
        ],
      }),
      [t, poolId]
    )
  );

  useEffect(() => {
    if (
      queryPool &&
      !flags.concentratedLiquidity &&
      queryPool.type === "concentrated"
    ) {
      router.push(`/pools`);
    }
  }, [queryPool, flags.concentratedLiquidity, router]);

  return (
    <>
      {showTradeModal && queryPool && (
        <TradeTokens
          className="md:!p-0"
          isOpen={showTradeModal}
          onRequestClose={() => {
            setShowTradeModal(false);
          }}
          memoedPools={[queryPool]}
        />
      )}
      {flags.concentratedLiquidity && queryPool?.type === "concentrated" ? (
        <ConcentratedLiquidityPool poolId={poolId} />
      ) : (
        queryPool && <SharePool poolId={poolId} />
      )}
    </>
  );
});

export default Pool;
