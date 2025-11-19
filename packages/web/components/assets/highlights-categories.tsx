import classNames from "classnames";
import Link from "next/link";
import { FunctionComponent, ReactNode } from "react";

import { PriceChange } from "~/components/assets/price";
import { SkeletonLoader } from "~/components/loaders/skeleton-loader";
import { EntityImage } from "~/components/ui/entity-image";
import { EventName } from "~/config";
import {
  Breakpoint,
  useAmplitudeAnalytics,
  useTranslation,
  useWindowSize,
} from "~/hooks";
import { api, RouterOutputs } from "~/utils/trpc";

import { CustomClasses } from "../types";

type PriceChange24hAsset =
  | RouterOutputs["edge"]["assets"]["getTopNewAssets"][number]
  | RouterOutputs["edge"]["assets"]["getTopGainerAssets"][number];

type UpcomingReleaseAsset =
  RouterOutputs["edge"]["assets"]["getTopUpcomingAssets"][number];

type Highlight = "new" | "topGainers" | "upcoming";

type HighlightsProps = {
  isCategorySelected: boolean;
  onSelectAllTopGainers: () => void;
} & CustomClasses;

export const HighlightsCategories: FunctionComponent<HighlightsProps> = (
  props
) => {
  if (props.isCategorySelected) return null;

  return <HighlightsGrid {...props} />;
};

/**
 * Checks if an upcoming asset has a specific enough launch date to be shown.
 * Returns true for dates with day, month, or quarter (e.g., "March 2024", "Q2 2024", "March 22, 2024").
 * Returns false for vague dates like "soon", "H1 2024" (half year), or just "2024" (year only).
 */
function hasSpecificLaunchDate(dateText: string | undefined): boolean {
  if (!dateText) return false;

  const lowerDate = dateText.toLowerCase().trim();

  // Explicit filler values
  if (lowerDate === "soon" || lowerDate === "tbd" || lowerDate === "tba") {
    return false;
  }

  // Half-year format (H1, H2)
  if (/^h[12]\s*\d{4}$/i.test(lowerDate)) {
    return false;
  }

  // Year only (just "2024", "2025", etc.)
  if (/^\d{4}$/.test(lowerDate)) {
    return false;
  }

  // Check for month names (full or abbreviated) - these are specific enough
  const hasMonth =
    /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(
      lowerDate
    );
  if (hasMonth) return true;

  // Check for quarter (Q1, Q2, Q3, Q4) - these are specific enough
  const hasQuarter = /q[1-4]\s*\d{4}/i.test(lowerDate);
  if (hasQuarter) return true;

  // Default to false for any other format
  return false;
}

const HighlightsGrid: FunctionComponent<HighlightsProps> = ({
  onSelectAllTopGainers,
  className,
}) => {
  const { t } = useTranslation();
  const { width } = useWindowSize();

  const isLargeTablet = width < Breakpoint.xl && width > Breakpoint.lg;

  const { data: topNewAssets, isLoading: isTopNewAssetsLoading } =
    api.edge.assets.getTopNewAssets.useQuery({
      topN: isLargeTablet ? 3 : undefined,
    });
  const { data: topGainerAssets, isLoading: isTopGainerAssetsLoading } =
    api.edge.assets.getTopGainerAssets.useQuery({
      topN: isLargeTablet ? 8 : undefined,
    });
  const { data: topUpcomingAssets, isLoading: isTopUpcomingAssetsLoading } =
    api.edge.assets.getTopUpcomingAssets.useQuery({
      topN: isLargeTablet ? 3 : undefined,
    });

  // Filter upcoming assets to only include those with specific launch dates
  const qualifyingUpcomingAssets = (topUpcomingAssets ?? []).filter((asset) =>
    hasSpecificLaunchDate(asset.estimatedLaunchDateUtc)
  );
  const hasQualifyingUpcomingAssets =
    !isTopUpcomingAssetsLoading && qualifyingUpcomingAssets.length > 0;

  return (
    <div
      className={classNames(
        "lg:no-scrollbar grid gap-6 xl:gap-8 lg:flex lg:snap-x lg:snap-mandatory lg:overflow-x-scroll",
        {
          // When Upcoming is hidden, use 2-column grid with Top Gainers spanning 2 rows
          "grid-cols-2 xl:grid-rows-2": !hasQualifyingUpcomingAssets,
          // When Upcoming is shown, use 3-column grid
          "grid-cols-3 xl:grid-cols-2 xl:grid-rows-2": hasQualifyingUpcomingAssets,
        },
        className
      )}
    >
      <AssetHighlights
        className="lg:w-[80%] lg:shrink-0 lg:snap-center"
        title={t("assets.highlights.new")}
        isLoading={isTopNewAssetsLoading}
        assets={(topNewAssets ?? []).map(highlightPrice24hChangeAsset)}
        highlight="new"
      />
      <AssetHighlights
        className="xl:row-span-2 lg:row-auto lg:w-[80%] lg:shrink-0 lg:snap-center"
        title={t("assets.highlights.topGainers")}
        subtitle="24h"
        isLoading={isTopGainerAssetsLoading}
        assets={(topGainerAssets ?? []).map(highlightPrice24hChangeAsset)}
        onClickSeeAll={onSelectAllTopGainers}
        highlight="topGainers"
      />
      {hasQualifyingUpcomingAssets && (
        <AssetHighlights
          className="lg:w-[80%] lg:shrink-0 lg:snap-center"
          title={t("assets.highlights.upcoming")}
          isLoading={isTopUpcomingAssetsLoading}
          assets={qualifyingUpcomingAssets.map(highlightUpcomingReleaseAsset)}
          highlight="upcoming"
        />
      )}
    </div>
  );
};

export function highlightPrice24hChangeAsset(asset: PriceChange24hAsset) {
  return {
    asset: {
      ...asset,
      href: `/assets/${asset.coinMinimalDenom}`,
    },
    extraInfo: asset.priceChange24h ? (
      <PriceChange
        priceChange={asset.priceChange24h}
        overrideTextClasses="body2"
        className="h-fit"
      />
    ) : null,
  };
}

function highlightUpcomingReleaseAsset(asset: UpcomingReleaseAsset) {
  // Format the date to "Est. MMM YYYY" format
  const formatDateText = (dateText: string | undefined) => {
    if (!dateText) return null;

    // Handle different date formats
    let formattedDate = dateText;

    // Convert month names to 3-letter codes with proper capitalization
    const monthMap: { [key: string]: string } = {
      January: "Jan",
      February: "Feb",
      March: "Mar",
      April: "Apr",
      May: "May",
      June: "Jun",
      July: "Jul",
      August: "Aug",
      September: "Sep",
      October: "Oct",
      November: "Nov",
      December: "Dec",
    };

    // Replace full month names with 3-letter codes (case-insensitive)
    Object.entries(monthMap).forEach(([full, short]) => {
      formattedDate = formattedDate.replace(
        new RegExp(`\\b${full}\\b`, "gi"),
        short
      );
    });

    return formattedDate;
  };

  return {
    asset: {
      coinDenom: asset.symbol,
      coinName: asset.assetName,
      coinImageUrl: asset.images[0].png ?? asset.images[0].svg,
      href: asset.socials?.website,
      externalLink: true,
    },
    extraInfo: asset.estimatedLaunchDateUtc ? (
      <div className="flex items-center gap-2 min-w-0">
        <span className="body2 text-osmoverse-400 whitespace-nowrap">
          Est. {formatDateText(asset.estimatedLaunchDateUtc)}
        </span>
      </div>
    ) : null,
  };
}

export const AssetHighlights: FunctionComponent<
  {
    title: string;
    subtitle?: string;
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
    highlight: Highlight;
    onClickAsset?: (asset: HighlightAsset) => void;
  } & CustomClasses
> = ({
  title,
  subtitle,
  onClickSeeAll,
  assets,
  isLoading = false,
  className,
  highlight,
  onClickAsset,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={classNames(
        "flex flex-col border-t border-osmoverse-700 py-3",
        className
      )}
    >
      <div className="flex place-content-between pt-1 pb-3">
        <h6>
          {title}{" "}
          {subtitle && (
            <span className="body1 text-osmoverse-400">{subtitle}</span>
          )}
        </h6>
        {onClickSeeAll && (
          <button className="body2 text-wosmongton-300" onClick={onClickSeeAll}>
            {t("assets.seeAll")}
          </button>
        )}
      </div>
      <div className={classNames("flex flex-col", { "gap-1": isLoading })}>
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
                highlight={highlight}
                onClick={onClickAsset}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

type HighlightAsset = {
  coinDenom: string;
  coinName: string;
  coinImageUrl?: string;
  href?: string;
  externalLink?: boolean;
};

const AssetHighlightRow: FunctionComponent<{
  asset: HighlightAsset;
  extraInfo: ReactNode;
  highlight: Highlight;
  onClick?: (asset: HighlightAsset) => void;
}> = ({ asset, extraInfo, highlight, onClick }) => {
  const { coinDenom, coinName, coinImageUrl, href, externalLink } = asset;
  const { logEvent } = useAmplitudeAnalytics();

  const AssetContent = (
    <>
      <div className="flex items-center gap-2">
        <EntityImage
          symbol={coinDenom}
          name={coinName}
          logoURIs={{
            png: coinImageUrl,
            svg: coinImageUrl,
          }}
          width={32}
          height={32}
        />
        <span className="body2 max-w-[7rem] overflow-clip text-ellipsis whitespace-nowrap">
          {coinName}
        </span>
        <span className="caption text-osmoverse-400">{coinDenom}</span>
      </div>
      <div>{extraInfo}</div>
    </>
  );

  return !href ? (
    <div
      className="-mx-2 flex items-center justify-between gap-4 rounded-lg p-2"
      onClick={() => onClick?.(asset)}
    >
      {AssetContent}
    </div>
  ) : (
    <Link
      href={href}
      passHref
      target={externalLink ? "_blank" : "_self"}
      className="-mx-2 flex items-center justify-between gap-4 rounded-lg p-2 transition-colors duration-200 ease-in-out hover:cursor-pointer hover:bg-osmoverse-850"
      onClick={() => {
        logEvent([EventName.Assets.assetClicked, { coinDenom, highlight }]);
        onClick?.(asset);
      }}
    >
      {AssetContent}
    </Link>
  );
};
