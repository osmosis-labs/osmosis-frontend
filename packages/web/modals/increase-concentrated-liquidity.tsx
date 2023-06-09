import { Dec } from "@keplr-wallet/unit";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import { ObservableQueryLiquidityPositionById } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { FunctionComponent, useCallback, useEffect } from "react";
import { useTranslation } from "react-multi-lang";

import { ChartButton } from "~/components/buttons";
import { MyPositionStatus } from "~/components/cards/my-position/status";
import { PriceChartHeader } from "~/components/chart/token-pair-historical";
import { DepositAmountGroup } from "~/components/cl-deposit-input-group";
import { tError } from "~/components/localization";
import { useHistoricalAndLiquidityData } from "~/hooks/ui-config/use-historical-and-depth-data";

import {
  useAddConcentratedLiquidityConfig,
  useConnectWalletModalRedirect,
} from "../hooks";
import { useStore } from "../stores";
import { ModalBase, ModalBaseProps } from "./base";

const ConcentratedLiquidityDepthChart = dynamic(
  () => import("~/components/chart/concentrated-liquidity-depth"),
  { ssr: false }
);
const TokenPairHistoricalChart = dynamic(
  () => import("~/components/chart/token-pair-historical"),
  { ssr: false }
);

export const IncreaseConcentratedLiquidityModal: FunctionComponent<
  {
    poolId: string;
    position: ObservableQueryLiquidityPositionById;
  } & ModalBaseProps
> = observer((props) => {
  const {
    poolId,
    position: { lowerPrices, upperPrices, baseAsset, quoteAsset, isFullRange },
  } = props;
  const {
    chainStore,
    accountStore,
    derivedDataStore,
    priceStore,
    queriesStore,
  } = useStore();
  const t = useTranslation();

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getAccount(chainId);
  const isSendingMsg = account.txTypeInProgress !== "";

  const {
    historicalChartData,
    historicalRange,
    xRange,
    yRange,
    setHoverPrice,
    lastChartData,
    depthChartData,
    setZoom,
    zoomIn,
    zoomOut,
    range,
    priceDecimal,
    setHistoricalRange,
    hoverPrice,
    setPriceRange,
  } = useHistoricalAndLiquidityData(chainId, poolId);

  const { config, increaseLiquidity } = useAddConcentratedLiquidityConfig(
    chainStore,
    chainId,
    poolId,
    queriesStore
  );

  // initialize pool data stores once root pool store is loaded
  const { poolDetail } = derivedDataStore.getForPool(poolId as string);
  const pool = poolDetail?.pool;
  const clPool = poolDetail?.pool?.pool as ConcentratedLiquidityPool;
  const isConcLiq = pool?.type === "concentrated";
  const currentSqrtPrice = isConcLiq && clPool.currentSqrtPrice;
  const currentPrice = currentSqrtPrice
    ? currentSqrtPrice.mul(currentSqrtPrice)
    : new Dec(0);

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled: config.error !== undefined || isSendingMsg,
      onClick: () => {
        increaseLiquidity(props.position.id).finally(() =>
          props.onRequestClose()
        );
      },
      children: config.error
        ? t(...tError(config.error))
        : t("clPositions.addMoreLiquidity"),
    },
    props.onRequestClose
  );

  const getFiatValue = useCallback(
    (coin) => priceStore.calculatePrice(coin),
    [priceStore]
  );

  useEffect(() => {
    if (lowerPrices?.price && upperPrices?.price) {
      setPriceRange([lowerPrices.price, upperPrices.price]);
      config.setMinRange(lowerPrices.price);
      config.setMaxRange(upperPrices.price);
    }
  }, [config, setPriceRange, lowerPrices, upperPrices]);

  return (
    <ModalBase
      {...props}
      isOpen={props.isOpen && showModalBase}
      title={t("clPositions.increaseLiquidity")}
      className="!max-w-[500px]"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="pl-4 text-subtitle1 font-subtitle1">
            {t("clPositions.yourPosition")}
          </div>
          {lowerPrices && upperPrices && (
            <MyPositionStatus
              currentPrice={currentPrice}
              lowerPrice={lowerPrices.price}
              upperPrice={upperPrices.price}
              negative
            />
          )}
        </div>
        <div className="mb-2 flex justify-between rounded-[12px] bg-osmoverse-700 py-3 px-5 text-osmoverse-100">
          {baseAsset && (
            <div className="flex items-center gap-2 text-subtitle1 font-subtitle1">
              {baseAsset.currency.coinImageUrl && (
                <Image
                  alt="base currency"
                  src={baseAsset.currency.coinImageUrl}
                  height={24}
                  width={24}
                />
              )}
              <span>{baseAsset?.trim(true).toString() ?? ""}</span>
            </div>
          )}
          {quoteAsset && (
            <div className="flex items-center gap-2 text-subtitle1 font-subtitle1">
              {quoteAsset.currency.coinImageUrl && (
                <Image
                  alt="base currency"
                  src={quoteAsset.currency.coinImageUrl}
                  height={24}
                  width={24}
                />
              )}
              <span>{quoteAsset?.trim(true).toString() ?? ""}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 pl-4">
            <div className="text-subtitle1 font-subtitle1">
              {t("clPositions.selectedRange")}
            </div>
            <div className="text-subtitle1 font-subtitle1 text-osmoverse-300">
              {t("addConcentratedLiquidity.basePerQuote", {
                base: config.baseDepositAmountIn.sendCurrency.coinDenom,
                quote: config.quoteDepositAmountIn.sendCurrency.coinDenom,
              })}
            </div>
          </div>
          <div className="flex gap-1">
            <div className="flex-shrink-1 flex h-[20.1875rem] w-0 flex-1 flex-col gap-[20px] rounded-l-2xl bg-osmoverse-700 py-6 pl-6">
              <PriceChartHeader
                classes={{
                  priceHeaderClass: "text-h5 font-h5 text-osmoverse-200",
                }}
                historicalRange={historicalRange}
                setHistoricalRange={setHistoricalRange}
                baseDenom={config.baseDepositAmountIn.sendCurrency.coinDenom}
                quoteDenom={config.quoteDepositAmountIn.sendCurrency.coinDenom}
                hoverPrice={hoverPrice}
                decimal={priceDecimal}
                hideButtons
              />
              <TokenPairHistoricalChart
                data={historicalChartData}
                annotations={
                  isFullRange
                    ? [
                        new Dec((yRange[0] || 0) * 1.05),
                        new Dec((yRange[1] || 0) * 0.95),
                      ]
                    : range || []
                }
                domain={yRange}
                onPointerHover={setHoverPrice}
                onPointerOut={
                  lastChartData
                    ? () => setHoverPrice(lastChartData.close)
                    : undefined
                }
              />
            </div>
            <div className="flex-shrink-1 relative flex h-[20.1875rem] w-0 flex-1 rounded-r-2xl bg-osmoverse-700">
              <div className="mt-[84px] flex flex-1 flex-col">
                <ConcentratedLiquidityDepthChart
                  yRange={yRange}
                  xRange={[xRange[0], xRange[1] * 1.1]}
                  data={depthChartData}
                  annotationDatum={{
                    price: lastChartData?.close || 0,
                    depth: xRange[1],
                  }}
                  rangeAnnotation={[
                    {
                      price: Number(lowerPrices?.price.toString() ?? 0),
                      depth: xRange[1],
                    },
                    {
                      price: Number(upperPrices?.price.toString() ?? 0),
                      depth: xRange[1],
                    },
                  ]}
                  offset={{ top: 0, right: 32, bottom: 24 + 24, left: 0 }}
                  horizontal
                  fullRange={isFullRange}
                />
              </div>
              <div className="flex h-full flex-col">
                <div className="mt-[25px] mr-[22px] flex h-6 gap-1">
                  <ChartButton
                    alt="refresh"
                    src="/icons/refresh-ccw.svg"
                    selected={false}
                    onClick={() => setZoom(1)}
                  />
                  <ChartButton
                    alt="zoom in"
                    src="/icons/zoom-in.svg"
                    selected={false}
                    onClick={zoomIn}
                  />
                  <ChartButton
                    alt="zoom out"
                    src="/icons/zoom-out.svg"
                    selected={false}
                    onClick={zoomOut}
                  />
                </div>
                {lowerPrices && upperPrices && (
                  <div className="mr-[22px] mb-4 flex h-full flex-col items-end justify-between py-4 ">
                    <PriceBox
                      currentValue={
                        isFullRange ? "0" : upperPrices.price.toString()
                      }
                      label={t("clPositions.maxPrice")}
                      infinity={isFullRange}
                    />
                    <PriceBox
                      currentValue={
                        isFullRange ? "0" : lowerPrices.price.toString()
                      }
                      label={t("clPositions.minPrice")}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-3">
        <div className="pl-4 text-subtitle1 font-subtitle1">
          {t("clPositions.addMoreLiquidity")}
        </div>
        <div className="flex flex-col gap-2">
          <DepositAmountGroup
            className="mt-4 bg-transparent !p-0"
            outOfRangeClassName="!bg-osmoverse-900"
            priceInputClass="!bg-osmoverse-900 !w-full"
            getFiatValue={getFiatValue}
            coin={pool?.poolAssets[0]?.amount}
            coinIsToken0={true}
            onUpdate={useCallback(
              (amount) => {
                config.setAnchorAsset("base");
                config.baseDepositAmountIn.setAmount(amount.toString());
              },
              [config]
            )}
            currentValue={config.baseDepositAmountIn.amount}
            outOfRange={config.quoteDepositOnly}
            percentage={config.depositPercentages[0]}
          />
          <DepositAmountGroup
            className="mt-4 bg-transparent !px-0"
            priceInputClass="!bg-osmoverse-900 !w-full"
            outOfRangeClassName="!bg-osmoverse-900"
            getFiatValue={getFiatValue}
            coin={pool?.poolAssets[1]?.amount}
            coinIsToken0={false}
            onUpdate={useCallback(
              (amount) => {
                config.setAnchorAsset("quote");
                config.quoteDepositAmountIn.setAmount(amount.toString());
              },
              [config]
            )}
            currentValue={config.quoteDepositAmountIn.amount}
            outOfRange={config.baseDepositOnly}
            percentage={config.depositPercentages[1]}
          />
        </div>
        {accountActionButton}
      </div>
    </ModalBase>
  );
});

const PriceBox: FunctionComponent<{
  label: string;
  currentValue: string;
  infinity?: boolean;
}> = ({ label, currentValue, infinity }) => (
  <div className="flex max-w-[6.25rem] flex-col gap-1">
    <span className="pt-2 text-body2 font-body2 text-osmoverse-300">
      {label}
    </span>
    {infinity ? (
      <div className="flex h-5 items-center">
        <Image
          alt="infinity"
          src="/icons/infinity.svg"
          width={16}
          height={16}
        />
      </div>
    ) : (
      <h6 className="overflow-hidden text-ellipsis border-0 bg-transparent text-subtitle1 font-subtitle1 leading-tight">
        {currentValue}
      </h6>
    )}
  </div>
);
