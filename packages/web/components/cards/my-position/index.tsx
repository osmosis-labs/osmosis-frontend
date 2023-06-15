import { Dec, PricePretty } from "@keplr-wallet/unit";
import { ObservableQueryLiquidityPositionById } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { FunctionComponent, ReactNode, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon, PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import { MyPositionStatus } from "~/components/cards/my-position/status";
import { useHistoricalAndLiquidityData } from "~/hooks/ui-config/use-historical-and-depth-data";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

import { MyPositionCardExpandedSection } from "./expanded";

/** User's concentrated liquidity position.  */
export const MyPositionCard: FunctionComponent<{
  position: ObservableQueryLiquidityPositionById;
}> = observer((props) => {
  const {
    position: {
      poolId,
      baseAsset,
      quoteAsset,
      lowerTick,
      upperTick,
      lowerPrices,
      upperPrices,
      isFullRange,
    },
  } = props;
  const t = useTranslation();
  const {
    chainStore: {
      osmosis: { chainId },
    },
    priceStore,
    queriesStore,
    queriesExternalStore,
  } = useStore();
  const [collapsed, setCollapsed] = useState(true);

  const queryPool = poolId
    ? queriesStore.get(chainId).osmosis!.queryPools.getPool(poolId)
    : undefined;

  const config = poolId
    ? useHistoricalAndLiquidityData(chainId, poolId)
    : undefined;

  const roi = undefined; // TODO: calculate APR (stretch)

  const baseAssetValue = baseAsset && priceStore.calculatePrice(baseAsset);
  const quoteAssetValue = quoteAsset && priceStore.calculatePrice(quoteAsset);
  const fiatCurrency =
    priceStore.supportedVsCurrencies[priceStore.defaultVsCurrency];
  const liquidityValue =
    baseAssetValue &&
    quoteAssetValue &&
    fiatCurrency &&
    new PricePretty(fiatCurrency, baseAssetValue.add(quoteAssetValue));

  const incentivesApr =
    poolId && lowerTick && upperTick
      ? queriesExternalStore.queryPositionsRangeApr.get(
          poolId,
          Number(lowerTick.toString()),
          Number(upperTick.toString())
        )?.apr
      : undefined;

  return (
    <div className="flex flex-col gap-8 overflow-hidden rounded-[20px] bg-osmoverse-800 p-8 sm:p-4">
      <div
        className="flex cursor-pointer place-content-between items-center gap-6 xl:flex-col"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-9 xl:w-full sm:flex-wrap sm:gap-3">
          <PoolAssetsIcon
            className="!w-[78px] sm:w-auto"
            assets={queryPool?.poolAssets.map((poolAsset) => ({
              coinImageUrl: poolAsset.amount.currency.coinImageUrl,
              coinDenom: poolAsset.amount.denom,
            }))}
          />

          <div className="flex flex-shrink-0 flex-grow flex-col gap-[6px] xl:flex-grow-0">
            <div className="flex items-center gap-[6px]">
              <PoolAssetsName
                size="md"
                assetDenoms={queryPool?.poolAssets.map(
                  (asset) => asset.amount.denom
                )}
              />
              <span className="px-2 py-1 text-subtitle1 text-osmoverse-100">
                {queryPool?.swapFee.toString()} {t("clPositions.fee")}
              </span>
            </div>
            {queryPool?.concentratedLiquidityPoolInfo?.currentSqrtPrice &&
              lowerPrices &&
              upperPrices && (
                <MyPositionStatus
                  currentPrice={
                    queryPool.concentratedLiquidityPoolInfo.currentPrice
                  }
                  lowerPrice={lowerPrices.price}
                  upperPrice={upperPrices.price}
                />
              )}
          </div>
        </div>
        <div className="flex gap-[52px] self-start xl:w-full xl:place-content-between xl:gap-0 sm:grid sm:grid-cols-2 sm:gap-2">
          {roi && (
            <PositionDataGroup label={t("clPositions.roi")} value={roi} />
          )}
          {lowerPrices && upperPrices && (
            <RangeDataGroup
              lowerPrice={lowerPrices.price}
              upperPrice={upperPrices.price}
              isFullRange={isFullRange}
            />
          )}
          {liquidityValue && (
            <PositionDataGroup
              label={t("clPositions.myLiquidity")}
              value={formatPretty(liquidityValue)}
            />
          )}
          {incentivesApr && (
            <PositionDataGroup
              label={t("clPositions.incentives")}
              value={`${formatPretty(incentivesApr.maxDecimals(0))} APR`}
            />
          )}
        </div>
      </div>
      {!collapsed && poolId && config && (
        <MyPositionCardExpandedSection
          poolId={poolId}
          chartConfig={config}
          position={props.position}
        />
      )}
    </div>
  );
});

const PositionDataGroup: FunctionComponent<{
  label: string;
  value: string | ReactNode;
}> = ({ label, value }) => (
  <div className="flex-grow-1 flex max-w-[12rem] flex-shrink-0 flex-col items-end gap-2 xl:items-start">
    <div className="text-subtitle1 text-osmoverse-400">{label}</div>
    {typeof value === "string" ? (
      <h6 className="text-white w-full truncate text-right xl:text-left">
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
  const t = useTranslation();
  return (
    <PositionDataGroup
      label={t("clPositions.selectedRange")}
      value={
        <div className="flex w-full justify-end gap-1 xl:justify-start sm:flex-wrap">
          <h6 title={lowerPrice.toString(2)}>
            {isFullRange
              ? "0"
              : formatPretty(lowerPrice, {
                  maximumFractionDigits: 2,
                  maximumSignificantDigits: undefined,
                })}
          </h6>
          <Icon id="left-right-arrow" className="flex-shrink-0" />
          <h6 title={lowerPrice.toString(2)}>
            {isFullRange
              ? "∞"
              : formatPretty(upperPrice, {
                  maximumFractionDigits: 2,
                  maximumSignificantDigits: undefined,
                })}
          </h6>
        </div>
      }
    />
  );
};
