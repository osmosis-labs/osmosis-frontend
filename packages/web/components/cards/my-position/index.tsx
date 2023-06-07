import { Dec, PricePretty } from "@keplr-wallet/unit";
import { ObservableQueryLiquidityPositionById } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { FunctionComponent, ReactNode, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
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
    position: { poolId, baseAsset, quoteAsset, lowerPrices, upperPrices },
  } = props;
  const t = useTranslation();
  const {
    chainStore: {
      osmosis: { chainId },
    },
    priceStore,
    queriesStore,
  } = useStore();
  const [collapsed, setCollapsed] = useState(true);

  const queryPool = poolId
    ? queriesStore.get(chainId).osmosis!.queryGammPools.getPool(poolId)
    : undefined;

  const config = poolId
    ? useHistoricalAndLiquidityData(chainId, poolId)
    : undefined;

  const baseAssetValue = baseAsset && priceStore.calculatePrice(baseAsset);

  const quoteAssetValue = quoteAsset && priceStore.calculatePrice(quoteAsset);

  const fiatCurrency =
    priceStore.supportedVsCurrencies[priceStore.defaultVsCurrency];

  const liquidityValue =
    baseAssetValue &&
    quoteAssetValue &&
    fiatCurrency &&
    new PricePretty(fiatCurrency, baseAssetValue.add(quoteAssetValue));

  return (
    <div className="flex flex-col gap-8 overflow-hidden rounded-[20px] bg-osmoverse-800 p-8">
      <div
        className="flex cursor-pointer items-center gap-[52px]"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div>
          <PoolAssetsIcon
            className="!w-[78px]"
            assets={queryPool?.poolAssets.map((poolAsset) => ({
              coinImageUrl: poolAsset.amount.currency.coinImageUrl,
              coinDenom: poolAsset.amount.currency.coinDenom,
            }))}
          />
        </div>
        <div className="flex flex-shrink-0 flex-grow flex-col gap-[6px]">
          <div className="flex flex-shrink-0 flex-grow flex-col gap-[6px]">
            <div className="flex items-center gap-[6px]">
              <PoolAssetsName
                size="md"
                assetDenoms={queryPool?.poolAssets.map(
                  (asset) => asset.amount.currency.coinDenom
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
                  currentPrice={queryPool.concentratedLiquidityPoolInfo.currentSqrtPrice.mul(
                    queryPool.concentratedLiquidityPoolInfo.currentSqrtPrice
                  )}
                  lowerPrice={lowerPrices.price}
                  upperPrice={upperPrices.price}
                />
              )}
          </div>
        </div>
        <div className="flex gap-[52px] self-start">
          <PositionDataGroup label={t("clPositions.roi")} value="-" />
          {lowerPrices && upperPrices && (
            <RangeDataGroup
              lowerPrice={lowerPrices.price}
              upperPrice={upperPrices.price}
            />
          )}
          <PositionDataGroup
            label={t("clPositions.myLiquidity")}
            value={liquidityValue ? formatPretty(liquidityValue) : "$0"}
          />
          <PositionDataGroup label={t("clPositions.incentives")} value="-" />
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
  <div className="flex-grow-1 flex max-w-[12rem] flex-shrink-0 flex-col items-end gap-2">
    <div className="text-subtitle1 text-osmoverse-400">{label}</div>
    {typeof value === "string" ? (
      <h6 className="text-white w-full truncate text-right">{value}</h6>
    ) : (
      value
    )}
  </div>
);

const RangeDataGroup: FunctionComponent<{
  lowerPrice: Dec;
  upperPrice: Dec;
}> = ({ lowerPrice, upperPrice }) => {
  const t = useTranslation();
  return (
    <PositionDataGroup
      label={t("clPositions.selectedRange")}
      value={
        <div className="flex w-full justify-end gap-1 overflow-hidden">
          <h6>{lowerPrice.toString()}</h6>
          <img alt="" src="/icons/left-right-arrow.svg" className="h-6 w-6" />
          <h6>{upperPrice.toString()}</h6>
        </div>
      }
    />
  );
};
