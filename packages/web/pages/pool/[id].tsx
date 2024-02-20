import { observer } from "mobx-react-lite";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { FunctionComponent, useEffect, useMemo, useState } from "react";

import SkeletonLoader from "~/components/loaders/skeleton-loader";
import {
  BasePoolDetails,
  ConcentratedLiquidityPool,
  SharePool,
} from "~/components/pool-detail";
import { useTranslation, useWindowSize } from "~/hooks";
import { useNavBar } from "~/hooks";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { TradeTokens } from "~/modals";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

interface Props {
  id: string;
}

const Pool: FunctionComponent<Props> = observer(
  ({ poolId }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const router = useRouter();
    const { chainStore, queriesStore } = useStore();
    const { chainId } = chainStore.osmosis;
    const { t } = useTranslation();
    const { isMobile } = useWindowSize();

    const { data } = api.edge.pools.getPool.useQuery({ poolId });

    console.log("data: ", data);

    // call trpc with the poolId

    const queryOsmosis = queriesStore.get(chainId).osmosis!;

    const flags = useFeatureFlags();

    const [showTradeModal, setShowTradeModal] = useState(false);

    // eject to pools page if pool does not exist
    const poolExists =
      poolId && typeof poolId === "string" && Boolean(poolId)
        ? queryOsmosis.queryPools.poolExists(poolId)
        : undefined;

    // click or navigate on a non-cosmwasm pool 2, 5, 8
    // on a cosmwasm pool that is transmuter, opens basic pools page (balances, liquidity) - 1211

    // on a cosmwasm pool that is not transmuter, open celatone - 352, 373

    // this uses a legacy query to fetch the pool data, we can deprecate this once we migrate to tRPC

    // TODO - bring up - migrate pool detail page to tRPC

    // the legacy query only supports transmuter cosmwasm pools
    useEffect(() => {
      // code ID of a CW contract
      // open external URL if match

      if (!data || !(poolId && typeof poolId === "string" && Boolean(poolId)))
        return;

      const isCosmwasmNotTransmuter =
        data.type.startsWith("cosmwasm") && data.type !== "cosmwasm-transmuter";

      // https://celatone.osmosis.zone/osmosis-1/pools/$%7Bpool.id%7D

      const celatoneUrl = `https://celatone.osmosis.zone/osmosis-1/pools/${poolId}`;

      if (isCosmwasmNotTransmuter) window.location.href = celatoneUrl;
    }, [data, poolId]);

    useEffect(() => {
      // code ID of a CW contract
      // open external URL if match

      if (poolExists === false) {
        router.push("/pools");
      }
    }, [poolExists, router]);

    console.log("poolId: ", poolId);

    const queryPool = queryOsmosis.queryPools.getPool(poolId);
    // const queryPool = queryOsmosis.queryPools.getPool(poolId);

    console.log("queryPool: ", queryPool);

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
        queryPool.type === "concentrated" &&
        !isMobile
      ) {
        router.push(`/pools`);
      }
    }, [queryPool, isMobile, flags.concentratedLiquidity, router]);

    return (
      <>
        <NextSeo title={t("seo.pool.title", { id: poolId })} />
        {queryPool && Boolean(poolId) && (
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
            {flags.concentratedLiquidity &&
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
  }
);

export const getServerSideProps: GetServerSideProps = async ({
  resolvedUrl,
}) => {
  const splitUrl = resolvedUrl.split("/");
  return { props: { poolId: splitUrl.pop() ?? "-" } };
};

export default Pool;
