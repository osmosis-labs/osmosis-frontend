import { Category } from "@osmosis-labs/server";
import Image from "next/image";
import Link from "next/link";
import { FunctionComponent, ReactNode } from "react";

import { Icon } from "~/components/assets/icon";
import { PriceChange } from "~/components/assets/price-change";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { api, RouterOutputs } from "~/utils/trpc";

type PriceChange24hAsset =
  | RouterOutputs["edge"]["assets"]["getTopNewAssets"][number]
  | RouterOutputs["edge"]["assets"]["getTopGainerAssets"][number];

type UpcomingReleaseAsset =
  RouterOutputs["edge"]["assets"]["getTopUpcomingAssets"][number];

export const HighlightsCategories: FunctionComponent<{
  isCategorySelected: boolean;
  onSelectCategory: (category: Category) => void;
}> = ({ isCategorySelected, onSelectCategory }) => {
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
        title="New"
        isLoading={isTopNewAssetsLoading}
        assets={(topNewAssets ?? []).map(highlightPrice24hChangeAsset)}
        onClickSeeAll={() => onSelectCategory("new")}
      />
      <AssetHighlights
        title="Top gainers"
        isLoading={isTopGainerAssetsLoading}
        assets={(topGainerAssets ?? []).map(highlightPrice24hChangeAsset)}
      />
      <AssetHighlights
        title="Upcoming"
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
      <PriceChange priceChange={asset.priceChange24h} />
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
}) => (
  <div className="flex w-full flex-col border-t border-osmoverse-700">
    <div className="flex place-content-between py-3">
      <h6>{title}</h6>
      {onClickSeeAll && (
        <button className="body2 text-wosmongton-300" onClick={onClickSeeAll}>
          See All
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
}) =>
  disableLinking ? (
    <div className="flex items-center justify-between rounded-lg p-2">
      <div className="flex items-center gap-2">
        {coinImageUrl && (
          <Image src={coinImageUrl} alt={coinDenom} height={32} width={32} />
        )}
        <span className="body2">{coinName}</span>
        <span className="caption text-osmoverse-400">{coinDenom}</span>
      </div>
      <div>{extraInfo}</div>
    </div>
  ) : (
    <Link
      href={`/assets/${coinDenom}`}
      passHref
      className="flex items-center justify-between rounded-lg p-2 transition-colors duration-200 ease-in-out hover:cursor-pointer hover:bg-osmoverse-850"
    >
      <div className="flex items-center gap-2">
        {coinImageUrl && (
          <Image src={coinImageUrl} alt={coinDenom} height={32} width={32} />
        )}
        <span className="body2">{coinName}</span>
        <span className="caption text-osmoverse-400">{coinDenom}</span>
      </div>
      <div>{extraInfo}</div>
    </Link>
  );
