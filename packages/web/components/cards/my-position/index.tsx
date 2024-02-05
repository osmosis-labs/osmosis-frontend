import { Dec } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, ReactNode, useState } from "react";

import { Icon, PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import { MyPositionCardExpandedSection } from "~/components/cards/my-position/expanded";
import { MyPositionStatus } from "~/components/cards/my-position/status";
import { EventName } from "~/config";
import { useTranslation } from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks";
import type { UserPosition } from "~/server/queries/complex/concentrated-liquidity";
import { formatPretty } from "~/utils/formatter";

/** User's concentrated liquidity position.  */
export const MyPositionCard: FunctionComponent<{
  showLinkToPool?: boolean;
  position: UserPosition;
}> = observer((props) => {
  const {
    showLinkToPool = false,
    position: {
      poolId,
      spreadFactor,
      status,
      currentCoins,
      currentValue,
      priceRange: [lowerPrice, upperPrice],
      isFullRange,
      rangeApr,
      roi,
      isPoolSuperfluid,
    },
  } = props;
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(true);

  const { logEvent } = useAmplitudeAnalytics();

  return (
    <div
      className={classNames(
        "flex flex-col gap-8 overflow-hidden rounded-2xl bg-osmoverse-800 px-8 py-5 transition-colors sm:p-4",
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
              <span className="px-2 py-1 text-subtitle1 text-osmoverse-100 xs:px-0">
                {spreadFactor.toString() ?? ""} {t("clPositions.spreadFactor")}
              </span>
            </div>
            <MyPositionStatus status={status} />
          </div>
        </div>
        <div className="flex gap-4 self-start xl:w-full xl:place-content-between xl:gap-0 sm:grid sm:grid-cols-2 sm:gap-2">
          <PositionDataGroup
            label={t("clPositions.roi")}
            value={roi.maxDecimals(0).toString()}
          />
          <RangeDataGroup
            lowerPrice={lowerPrice}
            upperPrice={upperPrice}
            isFullRange={isFullRange}
          />
          <PositionDataGroup
            label={t("clPositions.myLiquidity")}
            value={formatPretty(currentValue)}
          />
          {rangeApr && (
            <PositionDataGroup
              label={t("pool.APR")}
              value={formatPretty(rangeApr, {
                maxDecimals: 1,
              })}
              isSuperfluid={isPoolSuperfluid}
            />
          )}
        </div>
      </div>
      {!collapsed && (
        <MyPositionCardExpandedSection
          poolId={poolId}
          position={props.position}
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
