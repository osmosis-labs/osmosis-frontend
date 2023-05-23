import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, {
  FunctionComponent,
  ReactElement,
  ReactNode,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";

import { PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import MyPositionCardExpandedSection from "~/components/my-position-card/expanded";
import { useHistoricalAndLiquidityData } from "~/hooks/ui-config/use-historical-and-depth-data";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

export type Asset = {
  amount: string;
  denom: string;
};

export type PositionWithAssets = {
  asset0: Asset;
  asset1: Asset;
  position: {
    address: string;
    join_time: string;
    liquidity: string;
    lower_tick: string;
    pool_id: string;
    position_id: string;
    upper_tick: string;
  };
};

const MyPositionCard: FunctionComponent<{
  positionIds: string[];
}> = observer(({ positionIds }) => {
  const t = useTranslation();
  const { chainStore, priceStore, queriesStore } = useStore();
  const [collapsed, setCollapsed] = useState(true);

  const { chainId } = chainStore.osmosis;
  const queryPositions =
    queriesStore.get(chainId).osmosis!.queryLiquidityPositions;

  const { poolId, baseAmount, quoteAmount, priceRange } =
    queryPositions.getMergedPositions(positionIds);

  const config = useHistoricalAndLiquidityData(chainId, poolId);

  const { pool, quoteCurrency, baseCurrency, priceDecimal } = config;

  const [lowerPrice, upperPrice] = priceRange;

  const fiatBase =
    baseCurrency &&
    priceStore.calculatePrice(new CoinPretty(baseCurrency, baseAmount));

  const fiatQuote =
    quoteCurrency &&
    priceStore.calculatePrice(new CoinPretty(quoteCurrency, quoteAmount));

  const fiatCurrency =
    priceStore.supportedVsCurrencies[priceStore.defaultVsCurrency];

  const liquidityValue =
    fiatBase &&
    fiatQuote &&
    fiatCurrency &&
    new PricePretty(fiatCurrency, fiatBase.add(fiatQuote));

  const clPool = pool?.pool as ConcentratedLiquidityPool;

  if (!clPool) return null;

  const currentSqrtPrice = clPool.currentSqrtPrice;
  const currentPrice = currentSqrtPrice.mul(currentSqrtPrice);

  const inRange = lowerPrice.lt(currentPrice) && upperPrice.gt(currentPrice);

  const diff = new Dec(
    Math.min(
      Number(currentPrice.sub(lowerPrice).toString()),
      Number(upperPrice.sub(currentPrice).toString())
    )
  );

  const diffPercentage = diff.quo(currentPrice).mul(new Dec(100));

  return (
    <div
      className={classNames(
        "flex cursor-pointer flex-col gap-8 overflow-hidden rounded-[20px] bg-osmoverse-800 p-8"
      )}
      onClick={() => setCollapsed(!collapsed)}
    >
      <div className="flex flex-row items-center gap-[52px]">
        <div>
          <PoolAssetsIcon
            className="!w-[78px]"
            assets={pool?.poolAssets.map((poolAsset) => ({
              coinImageUrl: poolAsset.amount.currency.coinImageUrl,
              coinDenom: poolAsset.amount.currency.coinDenom,
            }))}
          />
        </div>
        <div className="flex flex-shrink-0 flex-grow flex-col gap-[6px]">
          <div className="flex flex-row items-center gap-[6px]">
            <PoolAssetsName
              size="md"
              assetDenoms={pool?.poolAssets.map(
                (asset) => asset.amount.currency.coinDenom
              )}
            />
            <span className="px-2 py-1 text-subtitle1 text-osmoverse-100">
              {pool?.swapFee.toString()} Fee
            </span>
          </div>
          <MyPositionStatus
            status={
              inRange
                ? diffPercentage.lte(new Dec(10))
                  ? PositionStatus.NearBounds
                  : PositionStatus.InRange
                : PositionStatus.outOfRange
            }
          />
        </div>
        <div className="flex flex-row gap-[52px] self-start">
          {/* TODO: use actual ROI */}
          <PositionDataGroup label={t("clPositions.roi")} value="0.18%" />
          <RangeDataGroup
            lowerPrice={
              quoteCurrency &&
              new CoinPretty(
                quoteCurrency,
                lowerPrice.mul(new Dec(10 ** quoteCurrency.coinDecimals))
              )
            }
            upperPrice={
              quoteCurrency &&
              new CoinPretty(
                quoteCurrency,
                upperPrice.mul(new Dec(10 ** quoteCurrency.coinDecimals))
              )
            }
            decimal={priceDecimal}
          />
          <PositionDataGroup
            label={t("clPositions.myLiquidity")}
            value={liquidityValue ? formatPretty(liquidityValue) : "$0"}
          />
          <PositionDataGroup
            label={t("clPositions.incentives")}
            value="25% APR"
          />
        </div>
      </div>
      {!collapsed && (
        <MyPositionCardExpandedSection
          chartConfig={config}
          positionIds={positionIds}
        />
      )}
    </div>
  );
});

export default MyPositionCard;

function PositionDataGroup(props: {
  label: string;
  value: string | ReactNode;
}): ReactElement {
  return (
    <div className="flex-grow-1 flex max-w-[12rem] flex-shrink-0 flex-col items-end gap-2">
      <div className="text-subtitle1 text-osmoverse-400">{props.label}</div>
      {typeof props.value === "string" ? (
        <h6 className="text-white w-full truncate text-right">{props.value}</h6>
      ) : (
        props.value
      )}
    </div>
  );
}

function RangeDataGroup(props: {
  lowerPrice?: CoinPretty;
  upperPrice?: CoinPretty;
  decimal: number;
}): ReactElement {
  const t = useTranslation();
  const { decimal, lowerPrice, upperPrice } = props;
  return (
    <PositionDataGroup
      label={t("clPositions.selectedRange")}
      value={
        <div className="flex w-full flex-row justify-end gap-1 overflow-hidden">
          <h6>
            {lowerPrice &&
              formatPretty(lowerPrice, {
                maximumFractionDigits: decimal,
                maximumSignificantDigits: decimal,
                maxDecimals: decimal,
                hideCoinDenom: true,
              })}
          </h6>
          <img alt="" src="/icons/left-right-arrow.svg" className="h-6 w-6" />
          <h6>
            {upperPrice &&
              formatPretty(upperPrice, {
                maximumFractionDigits: decimal,
                maximumSignificantDigits: decimal,
                maxDecimals: decimal,
                hideCoinDenom: true,
              })}
          </h6>
        </div>
      }
    />
  );
}

enum PositionStatus {
  InRange,
  NearBounds,
  outOfRange,
}
function MyPositionStatus(props: { status: PositionStatus }): ReactElement {
  const t = useTranslation();
  let label = t("clPositions.inRange");
  if (props.status === PositionStatus.NearBounds)
    label = t("clPositions.nearBounds");
  if (props.status === PositionStatus.outOfRange)
    label = t("clPositions.outOfRange");

  return (
    <div
      className={classNames(
        "flex w-fit flex-row items-center gap-[10px] rounded-[12px] px-3 py-1",
        {
          "bg-bullish-600/30": props.status === PositionStatus.InRange,
          "bg-ammelia-600/30": props.status === PositionStatus.NearBounds,
          "bg-rust-600/30": props.status === PositionStatus.outOfRange,
        }
      )}
    >
      <div
        className={classNames("h-3 w-3 rounded-full", {
          "bg-bullish-500": props.status === PositionStatus.InRange,
          "bg-ammelia-600": props.status === PositionStatus.NearBounds,
          "bg-rust-500": props.status === PositionStatus.outOfRange,
        })}
      />
      <div className="text-subtitle1">{label}</div>
    </div>
  );
}
