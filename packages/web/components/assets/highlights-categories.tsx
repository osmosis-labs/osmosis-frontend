import Image from "next/image";
import Link from "next/link";
import { FunctionComponent, ReactNode } from "react";

import { Icon } from "~/components/assets/icon";
import { PriceChange } from "~/components/assets/price";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { useTranslation } from "~/hooks";
import { api, RouterOutputs } from "~/utils/trpc";

type PriceChange24hAsset =
  | RouterOutputs["edge"]["assets"]["getTopNewAssets"][number]
  | RouterOutputs["edge"]["assets"]["getTopGainerAssets"][number];

type UpcomingReleaseAsset =
  RouterOutputs["edge"]["assets"]["getTopUpcomingAssets"][number];

export const HighlightsCategories: FunctionComponent<{
  isCategorySelected: boolean;
  onSelectCategory: (category: string) => void;
  onSelectAllTopGainers: () => void;
}> = ({ isCategorySelected, onSelectCategory, onSelectAllTopGainers }) => {
  const { t } = useTranslation();

  const { data: topNewAssets, isLoading: isTopNewAssetsLoading } =
    api.edge.assets.getTopNewAssets.useQuery({});
  const { data: topGainerAssets, isLoading: isTopGainerAssetsLoading } =
    api.edge.assets.getTopGainerAssets.useQuery({});
  const { data: topUpcomingAssets, isLoading: isTopUpcomingAssetsLoading } =
    api.edge.assets.getTopUpcomingAssets.useQuery({});

  if (isCategorySelected) return null;

  return (
    <div className="flex gap-6">
      <AssetHighlights
        title={t("assets.highlights.new")}
        isLoading={isTopNewAssetsLoading}
        assets={(topNewAssets ?? []).map(highlightPrice24hChangeAsset)}
        onClickSeeAll={() => onSelectCategory("new")}
      />
      <AssetHighlights
        title={t("assets.highlights.topGainers")}
        isLoading={isTopGainerAssetsLoading}
        assets={(topGainerAssets ?? []).map(highlightPrice24hChangeAsset)}
        onClickSeeAll={onSelectAllTopGainers}
      />
      <AssetHighlights
        title={t("assets.highlights.upcoming")}
        isLoading={isTopUpcomingAssetsLoading}
        assets={(topUpcomingAssets ?? []).map(highlightUpcomingReleaseAsset)}
        disableLinking
      />
    </div>
  );
};

function highlightPrice24hChangeAsset(asset: PriceChange24hAsset) {
  return {
    asset,
    extraInfo: asset.priceChange24h ? (
      <PriceChange
        priceChange={asset.priceChange24h}
        overrideTextClasses="body2"
      />
    ) : null,
  };
}

function highlightUpcomingReleaseAsset(asset: UpcomingReleaseAsset) {
  return {
    asset: {
      coinDenom: asset.symbol,
      coinName: asset.assetName,
      coinImageUrl: asset.images[0].png ?? asset.images[0].svg,
    },
    extraInfo: asset.estimatedLaunchDateUtc ? (
      <div className="flex items-center gap-2">
        {asset.osmosisAirdrop && <Icon id="present" height={20} width={20} />}
        <span className="body2 text-osmoverse-400">
          Est. {asset.estimatedLaunchDateUtc}
        </span>
      </div>
    ) : null,
  };
}

export const AssetHighlights: FunctionComponent<{
  title: string;
  onClickSeeAll?: () => void;
  assets: {
    asset: {
      coinDenom: string;
      coinName: string;
      coinImageUrl?: string;
    };
    extraInfo: ReactNode;
  }[];
  isLoading?: boolean;
  disableLinking?: boolean;
}> = ({
  title,
  onClickSeeAll,
  assets,
  isLoading = false,
  disableLinking = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col border-t border-osmoverse-700">
      <div className="flex place-content-between py-3">
        <h6>{title}</h6>
        {onClickSeeAll && (
          <button className="body2 text-wosmongton-300" onClick={onClickSeeAll}>
            {t("assets.seeAll")}
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {isLoading ? (
          <>
            {new Array(3).fill(0).map((_, i) => (
              <SkeletonLoader className="h-12 w-full" key={i} />
            ))}
          </>
        ) : (
          <>
            {assets.map(({ asset, extraInfo }) => (
              <AssetHighlightRow
                key={asset.coinDenom}
                asset={asset}
                extraInfo={extraInfo}
                disableLinking={disableLinking}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

const AssetHighlightRow: FunctionComponent<{
  asset: {
    coinDenom: string;
    coinName: string;
    coinImageUrl?: string;
  };
  extraInfo: ReactNode;
  disableLinking?: boolean;
}> = ({
  asset: { coinDenom, coinName, coinImageUrl },
  extraInfo,
  disableLinking = false,
}) => {
  const AssetContent = (
    <>
      <div className="flex items-center gap-2">
        {coinImageUrl && (
          <Image src={coinImageUrl} alt={coinDenom} height={32} width={32} />
        )}
        <span className="body2 max-w-[8.125rem] overflow-clip text-ellipsis whitespace-nowrap">
          {coinName}
        </span>
        <span className="caption text-osmoverse-400">{coinDenom}</span>
      </div>
      <div>{extraInfo}</div>
    </>
  );

  return disableLinking ? (
    <div className="flex items-center justify-between gap-4 rounded-lg p-2">
      {AssetContent}
    </div>
  ) : (
    <Link
      href={`/assets/${coinDenom}`}
      passHref
      className="flex items-center justify-between gap-4 rounded-lg p-2 transition-colors duration-200 ease-in-out hover:cursor-pointer hover:bg-osmoverse-850"
    >
      {AssetContent}
    </Link>
  );
};
