import type { UserPosition } from "@osmosis-labs/server";
import { Dec } from "@osmosis-labs/unit";
import classNames from "classnames";
import { FunctionComponent, ReactNode, useState } from "react";

import { Icon, PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import { MyPositionCardExpandedSection } from "~/components/cards/my-position/expanded";
import { MyPositionStatus } from "~/components/cards/my-position/status";
import { SkeletonLoader } from "~/components/loaders/skeleton-loader";
import { PrivateText } from "~/components/privacy";
import { useTranslation } from "~/hooks";
import { useWallet } from "~/hooks/use-wallet";
import {
  formatPretty,
  formatPriceWithUserPrecision,
  getFullPrecisionPrice,
} from "~/utils/formatter";
import { api } from "~/utils/trpc";

/** User's concentrated liquidity position.  */
export const MyPositionCard: FunctionComponent<{
  showLinkToPool?: boolean;
  position: UserPosition;
  showSelectedRange?: boolean;
}> = (props) => {
  const { address } = useWallet();
  const { showLinkToPool = false, position, showSelectedRange } = props;
  const {
    poolId,
    currentCoins,
    currentValue,
    priceRange: [lowerPrice, upperPrice],
    isFullRange,
  } = position;
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(true);

  const { data: positionPerformance } =
    api.local.concentratedLiquidity.getPositionHistoricalPerformance.useQuery(
      {
        position: position.position,
      },
      {
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );

  const {
    data: positionDetails,
    isLoading: isLoadingPositionDetails,
    isError: hasPositionDetailsError,
  } = api.local.concentratedLiquidity.getPositionDetails.useQuery(
    {
      position: position.position,
      userOsmoAddress: address ?? "",
    },
    {
      enabled: Boolean(address),

      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  return (
    <div
      className={classNames(
        "flex flex-col gap-8 overflow-hidden rounded-[20px] bg-osmoverse-800 px-8 py-5 transition-colors sm:p-4",
        {
          "cursor-pointer hover:bg-osmoverse-700": collapsed,
        }
      )}
      onClick={() => {
        setCollapsed(false);
      }}
    >
      {/* Phones: a grid with the logos and liquidity value on the top row,
          name/status beside the APR, and the selected range full width. The
          wrapper divs dissolve (`contents`) so their children sit in it. The
          name column is sized to fit the pool name first, so the right-hand
          column (labels wrap) gives way before the name has to. */}
      <div
        className={classNames(
          "flex place-content-between items-center gap-6 xl:flex-col sm:grid sm:grid-cols-[fit-content(100%)_minmax(min-content,1fr)] sm:items-start sm:gap-x-3 sm:gap-y-3",
          { "cursor-pointer": !collapsed }
        )}
        onClick={(e) => {
          if (!collapsed) e.stopPropagation();
          setCollapsed(true);
        }}
      >
        <div className="flex items-center gap-9 xl:w-full sm:contents">
          <PoolAssetsIcon
            className="!w-[78px] sm:col-start-1 sm:row-start-1 sm:w-auto"
            assets={currentCoins.map((poolAsset) => ({
              coinImageUrl: poolAsset.currency.coinImageUrl,
              coinDenom: poolAsset.denom,
              coinMinimalDenom: poolAsset.currency.coinMinimalDenom,
            }))}
          />

          <div className="flex flex-shrink-0 flex-grow flex-col gap-[6px] xl:flex-grow-0 sm:col-start-1 sm:row-start-2 sm:min-w-0">
            {/* The pool name wraps only as a last resort. On phones the
                spread factor always takes its own line, so it doesn't widen
                the name column. */}
            <div className="flex flex-wrap items-center gap-x-[6px] sm:flex-col sm:items-start">
              <PoolAssetsName
                size="md"
                assetDenoms={currentCoins.map(({ denom, currency }) => ({
                  minDenom: currency.coinMinimalDenom,
                  symbol: denom,
                }))}
                withAssetInfoLink={false}
              />
              <SkeletonLoader isLoaded={!isLoadingPositionDetails}>
                {!hasPositionDetailsError && (
                  <span className="px-2 py-1 text-subtitle1 text-osmoverse-100 xs:px-0">
                    {positionDetails?.spreadFactor.toString() ?? ""}{" "}
                    <span className="whitespace-nowrap">
                      {t("clPositions.spreadFactor")}
                    </span>
                  </span>
                )}
              </SkeletonLoader>
            </div>
            <SkeletonLoader
              isLoaded={!isLoadingPositionDetails}
              className={classNames(
                isLoadingPositionDetails && "min-h-[2rem] max-w-[7rem]"
              )}
            >
              {positionDetails?.status && (
                <MyPositionStatus status={positionDetails.status} />
              )}
            </SkeletonLoader>
          </div>
        </div>
        <div className="flex gap-4 self-start xl:w-full xl:place-content-between xl:gap-0 sm:contents">
          {showSelectedRange && (
            <RangeDataGroup
              lowerPrice={lowerPrice}
              upperPrice={upperPrice}
              isFullRange={isFullRange}
            />
          )}
          <PositionDataGroup
            // Phones: top right, beside the logos.
            className="sm:col-start-2 sm:row-start-1 sm:items-end"
            label={t("clPositions.myLiquidity")}
            value={currentValue ? formatPretty(currentValue) : "–"}
            isPrivate
          />
          <SkeletonLoader
            // Phones: pulled up so it sits just under My Liquidity rather
            // than a full grid row gap below it.
            className="sm:col-start-2 sm:row-start-2 sm:-mt-2 sm:justify-self-end"
            isLoaded={!isLoadingPositionDetails}
          >
            {!hasPositionDetailsError && (
              <PositionDataGroup
                label={t("pool.APR")}
                value={
                  positionDetails?.rangeApr
                    ? formatPretty(positionDetails.rangeApr, {
                        maxDecimals: 1,
                      })
                    : "–"
                }
                isSuperfluid={
                  Boolean(positionDetails?.superfluidData) &&
                  positionDetails?.status !== "outOfRange"
                }
              />
            )}
          </SkeletonLoader>
        </div>
      </div>
      {!collapsed && (
        <MyPositionCardExpandedSection
          poolId={poolId}
          position={props.position}
          isLoadingPositionDetails={isLoadingPositionDetails}
          positionDetails={positionDetails}
          positionPerformance={positionPerformance}
          showLinkToPool={showLinkToPool}
          hasPositionDetailsError={hasPositionDetailsError}
        />
      )}
    </div>
  );
};

const PositionDataGroup: FunctionComponent<{
  label: string;
  value: string | ReactNode;
  isSuperfluid?: boolean;
  className?: string;
  /** Mask the value when the user has enabled "Hide balances". */
  isPrivate?: boolean;
}> = ({ label, value, isSuperfluid = false, className, isPrivate = false }) => (
  <div
    className={classNames(
      "flex-grow-1 flex max-w-[17rem] flex-shrink-0 flex-col items-end gap-2 xl:max-w-none xl:items-start",
      className
    )}
  >
    <div className="text-subtitle1 text-osmoverse-400">{label}</div>
    {typeof value === "string" ? (
      <h6
        className={classNames(
          "text-white w-full truncate text-right xl:text-left sm:text-right",
          {
            "text-superfluid-gradient": isSuperfluid,
          }
        )}
      >
        {isPrivate ? <PrivateText text={value} /> : value}
      </h6>
    ) : (
      value
    )}
  </div>
);

const RangeDataGroup: FunctionComponent<{
  lowerPrice: Dec;
  upperPrice: Dec;
  isFullRange: boolean;
}> = ({ lowerPrice, upperPrice, isFullRange }) => {
  const { t } = useTranslation();

  return (
    <PositionDataGroup
      className="sm:col-span-2 sm:row-start-3"
      label={t("clPositions.selectedRange")}
      value={
        <div className="flex w-full shrink-0 justify-end gap-1 xl:justify-start">
          <h6
            title={getFullPrecisionPrice(lowerPrice)}
            className="whitespace-nowrap"
          >
            {isFullRange ? "0" : formatPriceWithUserPrecision(lowerPrice)}
          </h6>
          <Icon id="left-right-arrow" className="flex-shrink-0" />
          <h6
            title={getFullPrecisionPrice(upperPrice)}
            className="whitespace-nowrap"
          >
            {isFullRange ? "∞" : formatPriceWithUserPrecision(upperPrice)}
          </h6>
        </div>
      }
    />
  );
};
