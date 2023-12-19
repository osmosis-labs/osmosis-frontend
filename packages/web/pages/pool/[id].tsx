import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { FunctionComponent, useEffect, useMemo, useState } from "react";

import {
  BasePoolDetails,
  ConcentratedLiquidityPool,
  SharePool,
} from "~/components/pool-detail";
import SkeletonLoader from "~/components/skeleton-loader";
import { ENABLE_FEATURES } from "~/config";
import { useTranslation, useWindowSize } from "~/hooks";
import { useNavBar } from "~/hooks";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { TradeTokens } from "~/modals";
import { useStore } from "~/stores";

const Pool: FunctionComponent = observer(() => {
  const router = useRouter();
  const { chainStore, queriesStore } = useStore();
  const { id: poolId } = router.query as { id: string };
  const { chainId } = chainStore.osmosis;
  const { t } = useTranslation();
  const { isMobile } = useWindowSize();

  const queryOsmosis = queriesStore.get(chainId).osmosis!;

  const flags = useFeatureFlags();

  const [showTradeModal, setShowTradeModal] = useState(false);

  // eject to pools page if pool does not exist
  const poolExists =
    poolId && typeof poolId === "string" && Boolean(poolId)
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
      !(ENABLE_FEATURES || flags.concentratedLiquidity) &&
      queryPool.type === "concentrated" &&
      !isMobile
    ) {
      router.push(`/pools`);
    }
  }, [queryPool, isMobile, flags.concentratedLiquidity, router]);

  return (
    <>
      <NextSeo
        title={t("seo.pool.title", { id: poolId ? poolId.toString() : "-" })}
      />
      {showTradeModal && queryPool && poolId && (
        <TradeTokens
          className="md:!p-0"
          isOpen={showTradeModal}
          onRequestClose={() => {
            setShowTradeModal(false);
          }}
          sendTokenDenom={queryPool.poolAssetDenoms[0]}
          outTokenDenom={queryPool.poolAssetDenoms[1]}
          forceSwapInPoolId={poolId}
        />
      )}
      {!queryPool ? (
        <div className="mx-auto flex max-w-container flex-col gap-10 py-6 px-6">
          <SkeletonLoader className="h-[30rem] !rounded-3xl" />
          <SkeletonLoader className="h-40 !rounded-3xl" />
          <SkeletonLoader className="h-8 !rounded-xl" />
          <SkeletonLoader className="h-40 !rounded-3xl" />
        </div>
      ) : (
        <>
          {(ENABLE_FEATURES || flags.concentratedLiquidity) &&
          queryPool?.type === "concentrated" &&
          !isMobile ? (
            <ConcentratedLiquidityPool poolId={poolId} />
          ) : Boolean(queryPool?.sharePool) ? (
            queryPool && <SharePool poolId={poolId} />
          ) : queryPool ? (
            <BasePoolDetails pool={queryPool!.pool} />
          ) : null}
        </>
      )}
    </>
  );
});

export default Pool;
