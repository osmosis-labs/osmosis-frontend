import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { FunctionComponent, useEffect, useState } from "react";

import SkeletonLoader from "~/components/loaders/skeleton-loader";
import {
  BasePoolDetails,
  ConcentratedLiquidityPool,
  SharePool,
} from "~/components/pool-detail";
import { useTranslation, useWindowSize } from "~/hooks";
import { useNavBar } from "~/hooks";
import { useConst } from "~/hooks/use-const";
import { TradeTokens } from "~/modals";
import { api } from "~/utils/trpc";

interface Props {
  id: string;
}

const Pool: FunctionComponent<Props> = ({
  poolId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { isMobile } = useWindowSize();

  const { data: pool, isError } = api.edge.pools.getPool.useQuery({ poolId });

  const [showTradeModal, setShowTradeModal] = useState(false);

  const isValidPoolId = Boolean(
    poolId && typeof poolId === "string" && Boolean(poolId) && !isNaN(+poolId)
  );

  useNavBar(
    useConst({
      title: t("pool.title", { id: poolId ?? "" }),
      ctas: [{ label: t("pool.swap"), onClick: () => setShowTradeModal(true) }],
    })
  );

  // Redirects
  useEffect(() => {
    // the legacy query only supports transmuter cosmwasm pools
    // this uses a legacy query to fetch the pool data, we can deprecate this once we migrate to tRPC
    if (!pool || !isValidPoolId) return;

    const isCosmwasmNotSupported =
      pool.type.startsWith("cosmwasm") &&
      pool.type !== "cosmwasm-transmuter" &&
      pool.type !== "cosmwasm-astroport-pcl" &&
      pool.type !== "cosmwasm-whitewhale";

    const celatoneUrl = `https://celatone.osmosis.zone/osmosis-1/pools/${poolId}`;

    if (isCosmwasmNotSupported) window.location.href = celatoneUrl;
  }, [pool, poolId, isValidPoolId]);
  useEffect(() => {
    if ((!isValidPoolId || isError) && router.isReady) {
      router.push("/pools");
    }
  }, [isValidPoolId, isError, router]);

  return (
    <>
      <NextSeo title={t("seo.pool.title", { id: poolId })} />
      {pool && Boolean(poolId) && (
        <TradeTokens
          className="md:!p-0"
          isOpen={showTradeModal}
          onRequestClose={() => {
            setShowTradeModal(false);
          }}
          sendTokenDenom={pool.reserveCoins[0].denom}
          outTokenDenom={pool.reserveCoins[1].denom}
          forceSwapInPoolId={poolId}
        />
      )}
      {!pool ? (
        <div className="mx-auto flex max-w-container flex-col gap-10 py-6 px-6">
          <SkeletonLoader className="h-[30rem] !rounded-3xl" />
          <SkeletonLoader className="h-40 !rounded-3xl" />
          <SkeletonLoader className="h-8 !rounded-xl" />
          <SkeletonLoader className="h-40 !rounded-3xl" />
        </div>
      ) : pool.type === "concentrated" && !isMobile ? (
        <ConcentratedLiquidityPool poolId={pool.id} />
      ) : pool.type === "weighted" || pool.type === "stable" ? (
        <SharePool pool={pool} />
      ) : (
        <BasePoolDetails pool={pool} />
      )}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  resolvedUrl,
}) => {
  const splitUrl = resolvedUrl.split("/");
  return { props: { poolId: splitUrl.pop() ?? "-" } };
};

export default Pool;
