import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { FunctionComponent, useEffect, useMemo, useState } from "react";

import { SkeletonLoader } from "~/components/loaders/skeleton-loader";
import {
  BasePoolDetails,
  ConcentratedLiquidityPool,
  SharePool,
} from "~/components/pool-detail";
import { useTranslation, useWindowSize } from "~/hooks";
import { useNavBar } from "~/hooks";
import { TradeTokens } from "~/modals";
import { api } from "~/utils/trpc";

const Pool: FunctionComponent = () => {
  const router = useRouter();
  const poolId = typeof router.query.id === "string" ? router.query.id : "";
  const { t } = useTranslation();
  const { isMobile } = useWindowSize();
  const isValidPoolId = Boolean(poolId && !isNaN(+poolId));

  const {
    data: pool,
    isError,
    error,
  } = api.local.pools.getPool.useQuery(
    { poolId },
    { enabled: router.isReady && isValidPoolId }
  );

  const [showTradeModal, setShowTradeModal] = useState(false);

  useNavBar(
    useMemo(
      () => ({
        title: t("pool.title", { id: poolId }),
        ctas: [
          { label: t("pool.swap"), onClick: () => setShowTradeModal(true) },
        ],
      }),
      [poolId, t]
    )
  );

  // Redirects
  useEffect(() => {
    // the legacy query only supports transmuter cosmwasm pools
    // this uses a legacy query to fetch the pool data, we can deprecate this once we migrate to tRPC
    if (!pool || !isValidPoolId) return;

    // Handle different cosmwasm pool type redirections
    if (pool.type.startsWith("cosmwasm")) {
      let redirectUrl = "";

      if (pool.type === "cosmwasm-alloyed") {
        redirectUrl = `https://alloyed.osmosis.zone/pools/${poolId}`;
      } else if (pool.type === "cosmwasm-astroport-pcl") {
        return; // Keep on current site for astroport pools
      } else if (pool.type === "cosmwasm-whitewhale") {
        return; // Keep on current site for whitewhale pools
      } else {
        // cosmwasm-transmuter and other cosmwasm pools go to celatone
        const contractAddress = (pool.raw as any)?.contract_address;
        if (contractAddress) {
          redirectUrl = `https://celatone.osmosis.zone/osmosis-1/contracts/${contractAddress}`;
        } else {
          redirectUrl = `https://celatone.osmosis.zone/osmosis-1/pools/${poolId}`;
        }
      }

      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }
  }, [pool, poolId, isValidPoolId]);
  useEffect(() => {
    if ((!isValidPoolId || isError) && router.isReady) {
      // Log error for debugging
      if (isError && error) {
        console.error("Pool fetch error:", error);
      }
      router.push("/pools");
    }
  }, [isValidPoolId, isError, router, error]);

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
          useOtherCurrencies={pool.reserveCoins.length > 2}
          forceSwapInPoolId={poolId}
          page="Pool Details Page"
        />
      )}
      {!pool ? (
        <div className="mx-auto flex max-w-container flex-col gap-10 px-6 py-6">
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

export default Pool;
