import Image from "next/image";
import Link from "next/link";

import { Icon } from "~/components/assets";
import { Skeleton } from "~/components/ui/skeleton";
import { useTranslation } from "~/hooks";
import { api } from "~/utils/trpc";

interface AlloyedAssetsSectionProps {
  className?: string;
  contractAddress: string;
  title: string;
  denom: string;
}

export const AlloyedAssetsSection = (props: AlloyedAssetsSectionProps) => {
  const { contractAddress, title, denom, className } = props;
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

  if (!alloyedAssets) {
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
          count: alloyedAssets.length.toString(),
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
        {alloyedAssets.map((alloyedAsset) => (
          <Link
            href={`/assets/${alloyedAsset.asset.coinDenom}`}
            key={alloyedAsset.asset.coinMinimalDenom}
            className="flex"
          >
            {alloyedAsset.asset.coinImageUrl ? (
              <Image
                src={alloyedAsset.asset.coinImageUrl}
                alt={alloyedAsset.asset.coinName}
                width={48}
                height={48}
                className="h-12 w-12 min-w-[48px]"
              />
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
              <p className="mb-1 text-subtitle1 font-semibold">
                {alloyedAsset.percentage?.toString()}
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
    </section>
  );
};
