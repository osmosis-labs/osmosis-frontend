import Link from "next/link";
import { useMemo } from "react";

import { Icon } from "~/components/assets";
import { EntityImage } from "~/components/ui/entity-image";
import { Skeleton } from "~/components/ui/skeleton";
import { ALLOYED_ASSETS_DASHBOARD_URL } from "~/config/env";
import { useTranslation } from "~/hooks";
import { getLogoURIs } from "~/utils/logo-uri";
import { api } from "~/utils/trpc";

/**
 * Backing history page for an alloyed asset on the alloy dashboard. The
 * dashboard redirects an alloyed denom to the pool that currently issues it,
 * so the link survives a pool redeploy.
 */
export const getAlloyBackingHistoryUrl = (coinMinimalDenom: string) =>
  `${ALLOYED_ASSETS_DASHBOARD_URL}/alloys/${encodeURIComponent(
    coinMinimalDenom
  )}`;

interface AlloyedAssetsSectionProps {
  className?: string;
  contractAddress: string;
  title: string;
  denom: string;
  /** Minimal denom of the alloyed asset, for its page on the alloy dashboard. */
  coinMinimalDenom: string;
}

export const AlloyedAssetsSection = (props: AlloyedAssetsSectionProps) => {
  const { contractAddress, title, denom, coinMinimalDenom, className } = props;
  const { t } = useTranslation();

  const { data: alloyedAssets, isLoading } =
    api.edge.pools.getTransmuterTotalPoolLiquidity.useQuery(
      {
        contractAddress,
      },
      {
        enabled: Boolean(contractAddress),
      }
    );

  // Largest share of the alloy first; assets without a percentage go last.
  const sortedAlloyedAssets = useMemo(
    () =>
      alloyedAssets
        ? [...alloyedAssets].sort((a, b) => {
            if (!a.percentage || !b.percentage) {
              return a.percentage ? -1 : b.percentage ? 1 : 0;
            }
            const aShare = a.percentage.toDec();
            const bShare = b.percentage.toDec();
            if (aShare.gt(bShare)) return -1;
            if (aShare.lt(bShare)) return 1;
            return 0;
          })
        : undefined,
    [alloyedAssets]
  );

  if (isLoading) {
    return (
      <section className={className}>
        <h3 className="mb-8 text-h6 font-semibold">
          {t("tokenInfos.underlyingAssets.title")}
        </h3>

        <Skeleton className="mb-4 h-3 w-full !rounded-full" />
        <Skeleton className="mb-6 h-3 w-1/2 rounded-full" />

        <div className="flex flex-col gap-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="flex items-center" key={index}>
              <Skeleton className="h-12 w-12 min-w-[48px] !rounded-full" />

              <div className="ml-3 mr-2">
                <Skeleton className="mb-2 h-4 w-32 !rounded-full" />
                <Skeleton className="h-3 w-16 !rounded-full" />
              </div>

              <div className="ml-auto">
                <Skeleton className="mb-2 h-4 w-16 !rounded-full" />
                <Skeleton className="h-3 w-12 !rounded-full" />
              </div>

              <Icon
                id="caret-down"
                className="ml-2 h-6 w-6 min-w-[24px] -rotate-90 text-osmoverse-800"
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!sortedAlloyedAssets) {
    return null;
  }

  return (
    <section className={className}>
      <h3 className="mb-8 text-h6 font-semibold">
        {t("tokenInfos.underlyingAssets.title")}
      </h3>

      <p className="mb-6 text-body2 font-medium text-osmoverse-300">
        {t("tokenInfos.underlyingAssets.description", {
          name: title ?? denom,
          denom,
          count: sortedAlloyedAssets.length.toString(),
        })}{" "}
        <Link
          href="https://forum.osmosis.zone/t/alloyed-assets-on-osmosis-unifying-ux-and-solving-liquidity-fragmentation/2624"
          target="_blank"
          className="text-wosmongton-300"
        >
          {t("pool.learnMore")}
        </Link>
      </p>

      <div className="flex flex-col gap-8">
        {sortedAlloyedAssets.map((alloyedAsset) => (
          <Link
            href={`/assets/${alloyedAsset.asset.coinMinimalDenom}`}
            key={alloyedAsset.asset.coinMinimalDenom}
            className="flex"
          >
            {alloyedAsset.asset.coinImageUrl ? (
              <div className="h-12 w-12 min-w-[48px] shrink-0 overflow-hidden rounded-full">
                <EntityImage
                  logoURIs={getLogoURIs(alloyedAsset.asset.coinImageUrl)}
                  symbol={alloyedAsset.asset.coinDenom}
                  name={alloyedAsset.asset.coinName}
                  width={48}
                  height={48}
                />
              </div>
            ) : (
              false
            )}

            <div className="ml-3 mr-2">
              <p className="mb-1 text-subtitle1 font-semibold">
                {alloyedAsset.asset.coinName}
              </p>

              <p className="text-body2 font-medium text-osmoverse-300">
                {alloyedAsset.asset.coinDenom}
              </p>
            </div>

            <div className="ml-auto">
              <p className="mb-1 whitespace-nowrap text-subtitle1 font-semibold">
                {/* Two decimals keep tiny shares to "< 0.01%"; nowrap stops it
                    splitting at the formatter's space */}
                {alloyedAsset.percentage?.maxDecimals(2).toString()}
              </p>

              <p className="text-right text-body2 font-medium text-osmoverse-300">
                {t("tokenInfos.underlyingAssets.of", { denom })}
              </p>
            </div>

            <Icon
              id="caret-down"
              className="ml-2 h-6 w-6 min-w-[24px] -rotate-90 text-osmoverse-500"
            />
          </Link>
        ))}
      </div>

      <Link
        href={getAlloyBackingHistoryUrl(coinMinimalDenom)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-1 text-body2 font-medium text-wosmongton-300"
      >
        {t("tokenInfos.underlyingAssets.viewBackingHistory")}
        <Icon id="external-link" className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </section>
  );
};
