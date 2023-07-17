import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { ObservableQueryLiquidityPositionById } from "@osmosis-labs/stores";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, ReactNode, useMemo, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon, PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import { MyPositionCardExpandedSection } from "~/components/cards/my-position/expanded";
import { MyPositionStatus } from "~/components/cards/my-position/status";
import { useHistoricalAndLiquidityData } from "~/hooks/ui-config/use-historical-and-depth-data";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

/** User's concentrated liquidity position.  */
export const MyPositionCard: FunctionComponent<{
  position: ObservableQueryLiquidityPositionById;
}> = observer((props) => {
  const {
    position: {
      id: positionId,
      poolId,
      baseAsset,
      quoteAsset,
      lowerTick,
      upperTick,
      lowerPrices,
      upperPrices,
      isFullRange,
      totalClaimableRewards,
    },
  } = props;
  const t = useTranslation();
  const {
    chainStore: {
      osmosis: { chainId },
    },
    priceStore,
    accountStore,
    queriesStore,
    derivedDataStore,
    queriesExternalStore,
  } = useStore();
  const [collapsed, setCollapsed] = useState(true);

  const account = accountStore.getWallet(chainId);
  const osmosisQueries = queriesStore.get(chainId).osmosis!;

  const queryPool = poolId
    ? queriesStore.get(chainId).osmosis!.queryPools.getPool(poolId)
    : undefined;
  const queryPositionPerformanceMetrics =
    queriesExternalStore.queryPositionsPerformaceMetrics.get(positionId);

  const derivedPoolData = poolId
    ? derivedDataStore.getForPool(poolId)
    : undefined;

  const config = poolId
    ? useHistoricalAndLiquidityData(chainId, poolId)
    : undefined;

  const userPositionAssets = useMemo(
    () =>
      [baseAsset, quoteAsset].filter((asset): asset is CoinPretty =>
        Boolean(asset)
      ),
    [baseAsset, quoteAsset]
  );
  const roi = queryPositionPerformanceMetrics.calculateReturnOnInvestment(
    userPositionAssets,
    totalClaimableRewards
  );

  const baseAssetValue = baseAsset && priceStore.calculatePrice(baseAsset);
  const quoteAssetValue = quoteAsset && priceStore.calculatePrice(quoteAsset);
  const fiatCurrency =
    priceStore.supportedVsCurrencies[priceStore.defaultVsCurrency];
  const liquidityValue =
    baseAssetValue &&
    quoteAssetValue &&
    fiatCurrency &&
    new PricePretty(fiatCurrency, baseAssetValue.add(quoteAssetValue));

  const superfluidDelegation =
    derivedPoolData?.superfluidPoolDetail.getDelegatedPositionInfo(positionId);

  const superfluidUndelegation =
    derivedPoolData?.superfluidPoolDetail.getUndelegatingPositionInfo(
      positionId
    );

  const incentivesApr =
    poolId && lowerTick && upperTick
      ? queriesExternalStore.queryPositionsRangeApr
          .get(
            poolId,
            Number(lowerTick.toString()),
            Number(upperTick.toString())
          )
          ?.apr?.add(superfluidDelegation?.superfluidApr ?? new Dec(0))
      : undefined;

  const isUnbonding =
    osmosisQueries.queryAccountsUnbondingPositions
      .get(account?.address ?? "")
      .getPositionUnbondingInfo(positionId) !== undefined;

  return (
    <div className="flex flex-col gap-8 overflow-hidden rounded-[20px] bg-osmoverse-800 p-8 sm:p-4">
      <div
        className="flex cursor-pointer place-content-between items-center gap-6 xl:flex-col"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-9 xl:w-full sm:flex-wrap sm:gap-3 xs:flex-col xs:items-start">
          <PoolAssetsIcon
            className="!w-[78px] sm:w-auto"
            assets={queryPool?.poolAssets.map((poolAsset) => ({
              coinImageUrl: poolAsset.amount.currency.coinImageUrl,
              coinDenom: poolAsset.amount.denom,
            }))}
          />

          <div className="flex flex-shrink-0 flex-grow flex-col gap-[6px] xl:flex-grow-0">
            <div className="flex items-center gap-[6px] xs:flex-col xs:items-start">
              <PoolAssetsName
                size="md"
                assetDenoms={queryPool?.poolAssets.map(
                  (asset) => asset.amount.denom
                )}
              />
              <span className="px-2 py-1 text-subtitle1 text-osmoverse-100 xs:px-0">
                {queryPool?.swapFee.toString() ?? ""}{" "}
                {t("clPositions.spreadFactor")}
              </span>
            </div>
            {queryPool?.concentratedLiquidityPoolInfo &&
              lowerPrices &&
              upperPrices && (
                <MyPositionStatus
                  currentPrice={
                    queryPool.concentratedLiquidityPoolInfo.currentPrice
                  }
                  lowerPrice={lowerPrices.price}
                  upperPrice={upperPrices.price}
                  fullRange={isFullRange}
                  isSuperfluid={Boolean(superfluidDelegation)}
                  isSuperfluidUnstaking={Boolean(superfluidUndelegation)}
                  isUnbonding={isUnbonding}
                />
              )}
          </div>
        </div>
        <div className="flex gap-[52px] self-start xl:w-full xl:place-content-between xl:gap-0 sm:grid sm:grid-cols-2 sm:gap-2">
          {roi && (
            <PositionDataGroup
              label={t("clPositions.roi")}
              value={roi.maxDecimals(0).toString()}
            />
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
              isSuperfluid={
                Boolean(superfluidDelegation) || Boolean(superfluidUndelegation)
              }
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
  const t = useTranslation();

  return (
    <PositionDataGroup
      label={t("clPositions.selectedRange")}
      value={
        <div className="flex w-full flex-wrap justify-end gap-1 xl:justify-start">
          <h6 title={lowerPrice.toString(2)} className="whitespace-nowrap">
            {isFullRange
              ? "0"
              : formatPretty(lowerPrice, {
                  maximumFractionDigits: 2,
                  maximumSignificantDigits: undefined,
                })}
          </h6>
          <Icon id="left-right-arrow" className="flex-shrink-0" />
          <h6 title={upperPrice.toString(2)} className="whitespace-nowrap">
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
