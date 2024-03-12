import { Dec } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, ReactNode, useState } from "react";

import { Icon, PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import { MyPositionCardExpandedSection } from "~/components/cards/my-position/expanded";
import { MyPositionStatus } from "~/components/cards/my-position/status";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { EventName } from "~/config";
import { useFeatureFlags, useTranslation } from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks";
import type { UserPosition } from "~/server/queries/complex/concentrated-liquidity";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";

/** User's concentrated liquidity position.  */
export const MyPositionCard: FunctionComponent<{
  showLinkToPool?: boolean;
  position: UserPosition;
}> = observer((props) => {
  const { accountStore, chainStore } = useStore();
  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);
  const {
    showLinkToPool = false,
    position: {
      id,
      poolId,
      currentCoins,
      currentValue,
      priceRange: [lowerPrice, upperPrice],
      isFullRange,
    },
  } = props;
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(true);
  const featureFlags = useFeatureFlags();

  const { data: positionPerformance } =
    api.local.concentratedLiquidity.getPositionHistoricalPerformance.useQuery(
      {
        positionId: id,
      },
      {
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );

  const { data: positionDetails, isLoading: isLoadingPositionDetails } =
    api.local.concentratedLiquidity.getPositionDetails.useQuery(
      {
        positionId: id,
        userOsmoAddress: account?.address ?? "",
      },
      {
        enabled: Boolean(account?.address),

        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );

  const { logEvent } = useAmplitudeAnalytics();

  return (
    <div
      className={classNames(
        "flex flex-col gap-8 overflow-hidden rounded-[20px] bg-osmoverse-800 px-8 py-5 transition-colors sm:p-4",
        {
          "cursor-pointer hover:bg-osmoverse-700": collapsed,
        }
      )}
      onClick={() => {
        if (collapsed)
          logEvent([EventName.ConcentratedLiquidity.positionDetailsExpanded]);
        setCollapsed(false);
      }}
    >
      <div
        className={classNames(
          "flex place-content-between items-center gap-6 xl:flex-col",
          { "cursor-pointer": !collapsed }
        )}
        onClick={(e) => {
          if (!collapsed) e.stopPropagation();
          setCollapsed(true);
        }}
      >
        <div className="flex items-center gap-9 xl:w-full sm:flex-wrap sm:gap-3 xs:flex-col xs:items-start">
          <PoolAssetsIcon
            className="!w-[78px] sm:w-auto"
            assets={currentCoins.map((poolAsset) => ({
              coinImageUrl: poolAsset.currency.coinImageUrl,
              coinDenom: poolAsset.denom,
            }))}
          />

          <div className="flex flex-shrink-0 flex-grow flex-col gap-[6px] xl:flex-grow-0">
            <div className="flex items-center gap-[6px] xs:flex-col xs:items-start">
              <PoolAssetsName
                size="md"
                assetDenoms={currentCoins.map((asset) => asset.denom)}
              />
              <SkeletonLoader isLoaded={!isLoadingPositionDetails}>
                <span className="px-2 py-1 text-subtitle1 text-osmoverse-100 xs:px-0">
                  {positionDetails?.spreadFactor.toString() ?? ""}{" "}
                  {t("clPositions.spreadFactor")}
                </span>
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
        <div className="flex gap-4 self-start xl:w-full xl:place-content-between xl:gap-0 sm:grid sm:grid-cols-2 sm:gap-2">
          {positionPerformance && featureFlags.positionRoi && (
            <PositionDataGroup
              label={t("clPositions.roi")}
              value={positionPerformance.roi.maxDecimals(0).toString()}
            />
          )}
          <RangeDataGroup
            lowerPrice={lowerPrice}
            upperPrice={upperPrice}
            isFullRange={isFullRange}
          />
          <PositionDataGroup
            label={t("clPositions.myLiquidity")}
            value={formatPretty(currentValue)}
          />
          <SkeletonLoader isLoaded={!isLoadingPositionDetails}>
            <PositionDataGroup
              label={t("pool.APR")}
              value={formatPretty(positionDetails?.rangeApr ?? new Dec(0), {
                maxDecimals: 1,
              })}
              isSuperfluid={
                Boolean(positionDetails?.superfluidData) &&
                positionDetails?.status !== "outOfRange"
              }
            />
          </SkeletonLoader>
        </div>
      </div>
      {!collapsed && (
        <MyPositionCardExpandedSection
          poolId={poolId}
          position={props.position}
          positionDetails={positionDetails}
          positionPerformance={positionPerformance}
          showLinkToPool={showLinkToPool}
        />
      )}
    </div>
  );
});

const PositionDataGroup: FunctionComponent<{
  label: string;
  value: string | ReactNode;
  isSuperfluid?: boolean;
}> = ({ label, value, isSuperfluid = false }) => (
  <div className="flex-grow-1 flex max-w-[17rem] flex-shrink-0 flex-col items-end gap-2 xl:max-w-none xl:items-start">
    <div className="text-subtitle1 text-osmoverse-400">{label}</div>
    {typeof value === "string" ? (
      <h6
        className={classNames(
          "text-white w-full truncate text-right xl:text-left",
          {
            "text-superfluid-gradient": isSuperfluid,
          }
        )}
      >
        {value}
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
      label={t("clPositions.selectedRange")}
      value={
        <div className="flex w-full shrink-0 justify-end gap-1 xl:justify-start">
          <h6 title={lowerPrice.toString(2)} className="whitespace-nowrap">
            {isFullRange
              ? "0"
              : formatPretty(lowerPrice, {
                  scientificMagnitudeThreshold: 4,
                })}
          </h6>
          <Icon id="left-right-arrow" className="flex-shrink-0" />
          <h6 title={upperPrice.toString(2)} className="whitespace-nowrap">
            {isFullRange
              ? "∞"
              : formatPretty(upperPrice, {
                  scientificMagnitudeThreshold: 4,
                })}
          </h6>
        </div>
      }
    />
  );
};
