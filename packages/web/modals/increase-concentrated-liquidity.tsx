import { Dec } from "@keplr-wallet/unit";
import {
  ObservableAddConcentratedLiquidityConfig,
  ObservableQueryLiquidityPositionById,
} from "@osmosis-labs/stores";
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
import {
  useAddConcentratedLiquidityConfig,
  useConnectWalletModalRedirect,
} from "~/hooks";
import { useHistoricalAndLiquidityData } from "~/hooks/ui-config/use-historical-and-depth-data";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { ObservableHistoricalAndLiquidityData } from "~/stores/derived-data";
import { formatPretty } from "~/utils/formatter";

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
  const { poolId, position: positionConfig } = props;
  const { chainStore, accountStore, priceStore, queriesStore } = useStore();
  const t = useTranslation();

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);
  const isSendingMsg = Boolean(account?.txTypeInProgress);

  const osmosisQueries = queriesStore.get(chainStore.osmosis.chainId).osmosis!;

  const chartConfig = useHistoricalAndLiquidityData(chainId, poolId);
  const {
    xRange,
    yRange,
    lastChartData,
    depthChartData,
    resetZoom,
    zoomIn,
    zoomOut,
    setPriceRange,
  } = chartConfig;

  const { lowerPrices, upperPrices, baseAsset, quoteAsset, isFullRange } =
    positionConfig;

  const { config, increaseLiquidity } = useAddConcentratedLiquidityConfig(
    chainStore,
    chainId,
    poolId
  );

  // initialize pool data stores once root pool store is loaded
  const queryPool = osmosisQueries.queryPools.getPool(poolId);

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
      config.setMinRange(lowerPrices.price.toString());
      config.setMaxRange(upperPrices.price.toString());
    }
  }, [config, setPriceRange, lowerPrices, upperPrices]);

  return (
    <ModalBase
      {...props}
      isOpen={props.isOpen && showModalBase}
      className="max-h-[95vh] !max-w-[500px] overflow-auto"
      title={t("clPositions.increaseLiquidity")}
    >
      <div className="flex flex-col gap-3 pt-8">
        <div className="flex items-center justify-between">
          <div className="pl-4 text-subtitle1 font-subtitle1 xs:pl-0">
            {t("clPositions.yourPosition")}
          </div>
          {lowerPrices && upperPrices && (
            <MyPositionStatus
              currentPrice={config.currentPriceWithDecimals}
              lowerPrice={lowerPrices.price}
              upperPrice={upperPrices.price}
              negative
              className="xs:px-0"
            />
          )}
        </div>
        <div className="mb-2 flex justify-between rounded-[12px] bg-osmoverse-700 py-3 px-5 text-osmoverse-100 xs:flex-wrap xs:gap-y-2 xs:px-3">
          {baseAsset && (
            <div className="flex items-center gap-2 text-subtitle1 font-subtitle1 xs:text-body2">
              {baseAsset.currency.coinImageUrl && (
                <Image
                  alt="base currency"
                  src={baseAsset.currency.coinImageUrl}
                  height={24}
                  width={24}
                />
              )}
              <span>{formatPretty(baseAsset, { maxDecimals: 2 })}</span>
            </div>
          )}
          {quoteAsset && (
            <div className="flex items-center gap-2 text-subtitle1 font-subtitle1 xs:text-body2">
              {quoteAsset.currency.coinImageUrl && (
                <Image
                  alt="base currency"
                  src={quoteAsset.currency.coinImageUrl}
                  height={24}
                  width={24}
                />
              )}
              <span>{formatPretty(quoteAsset, { maxDecimals: 2 })}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 pl-4 xs:pl-1">
            <div className="text-subtitle1 font-subtitle1">
              {t("clPositions.selectedRange")}
            </div>
            <div className="text-subtitle1 font-subtitle1 text-osmoverse-300 xs:text-body2">
              {t("addConcentratedLiquidity.basePerQuote", {
                base: config.baseDepositAmountIn.sendCurrency.coinDenom,
                quote: config.quoteDepositAmountIn.sendCurrency.coinDenom,
              })}
            </div>
          </div>
          <div className="flex gap-1">
            <div className="flex-shrink-1 flex h-[20.1875rem] w-0 flex-1 flex-col gap-[20px] rounded-l-2xl bg-osmoverse-700 py-6 pl-6 xs:hidden">
              <ChartHeader
                chartConfig={chartConfig}
                addLiquidityConfig={config}
              />
              <Chart
                chartConfig={chartConfig}
                positionConfig={positionConfig}
              />
            </div>
            <div className="flex-shrink-1 relative flex h-[20.1875rem] w-0 flex-1 rounded-r-2xl bg-osmoverse-700 xs:rounded-l-2xl">
              <div className="mt-[76px] flex flex-1 flex-col">
                <ConcentratedLiquidityDepthChart
                  yRange={yRange}
                  xRange={[xRange[0], xRange[1]]}
                  data={depthChartData}
                  annotationDatum={{
                    price:
                      Number(config.currentPriceWithDecimals.toString()) ??
                      lastChartData?.close ??
                      0,
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
                  offset={{ top: 0, right: 10, bottom: 24 + 24, left: 0 }}
                  horizontal
                  fullRange={isFullRange}
                />
              </div>
              <div className="flex h-full flex-col">
                <div className="absolute right-0 mt-[25px] mr-[8px] flex h-6 gap-1">
                  <ChartButton
                    alt="refresh"
                    icon="refresh-ccw"
                    selected={false}
                    onClick={() => resetZoom()}
                  />
                  <ChartButton
                    alt="zoom out"
                    icon="zoom-out"
                    selected={false}
                    onClick={zoomOut}
                  />
                  <ChartButton
                    alt="zoom in"
                    icon="zoom-in"
                    selected={false}
                    onClick={zoomIn}
                  />
                </div>
                {lowerPrices && upperPrices && (
                  <div className="mr-[8px] mt-[55px] mb-4 flex h-full flex-col items-end justify-between py-4 ">
                    <PriceBox
                      currentValue={
                        isFullRange
                          ? "0"
                          : formatPretty(upperPrices.price).toString()
                      }
                      label={t("clPositions.maxPrice")}
                      infinity={isFullRange}
                    />
                    <PriceBox
                      currentValue={
                        isFullRange
                          ? "0"
                          : formatPretty(lowerPrices.price).toString()
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
        <div className="pl-4 text-subtitle1 font-subtitle1 xs:pl-1">
          {t("clPositions.addMoreLiquidity")}
        </div>
        <div className="flex flex-col gap-1">
          <DepositAmountGroup
            className="mt-4 bg-transparent !p-0"
            outOfRangeClassName="!bg-osmoverse-900"
            priceInputClass="!bg-osmoverse-900 !w-full"
            getFiatValue={getFiatValue}
            currency={queryPool?.poolAssets[0]?.amount?.currency}
            onUpdate={useCallback(
              (amount) => {
                config.setAnchorAsset("base");
                config.baseDepositAmountIn.setAmount(amount.toString());
              },
              [config]
            )}
            onMax={config.setBaseDepositAmountMax}
            currentValue={config.baseDepositAmountIn.amount}
            outOfRange={config.quoteDepositOnly}
            percentage={config.depositPercentages[0]}
          />
          <DepositAmountGroup
            className=" bg-transparent !px-0"
            priceInputClass="!bg-osmoverse-900 !w-full"
            outOfRangeClassName="!bg-osmoverse-900"
            getFiatValue={getFiatValue}
            currency={queryPool?.poolAssets[1]?.amount?.currency}
            onUpdate={useCallback(
              (amount) => {
                config.setAnchorAsset("quote");
                config.quoteDepositAmountIn.setAmount(amount.toString());
              },
              [config]
            )}
            onMax={config.setQuoteDepositAmountMax}
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

/**
 * Create a nested component to prevent unnecessary re-renders whenever the hover price changes.
 */
const ChartHeader: FunctionComponent<{
  addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
  chartConfig: ObservableHistoricalAndLiquidityData;
}> = observer(({ chartConfig, addLiquidityConfig }) => {
  const { historicalRange, priceDecimal, setHistoricalRange, hoverPrice } =
    chartConfig;

  const { baseDepositAmountIn, quoteDepositAmountIn } = addLiquidityConfig;

  return (
    <PriceChartHeader
      classes={{
        priceHeaderClass: "text-h5 font-h5 text-osmoverse-200",
      }}
      historicalRange={historicalRange}
      setHistoricalRange={setHistoricalRange}
      baseDenom={baseDepositAmountIn.sendCurrency.coinDenom}
      quoteDenom={quoteDepositAmountIn.sendCurrency.coinDenom}
      hoverPrice={hoverPrice}
      decimal={priceDecimal}
      hideButtons
    />
  );
});

/**
 * Create a nested component to prevent unnecessary re-renders whenever the hover price changes.
 */
const Chart: FunctionComponent<{
  chartConfig: ObservableHistoricalAndLiquidityData;
  positionConfig: ObservableQueryLiquidityPositionById;
}> = observer(({ chartConfig, positionConfig }) => {
  const { historicalChartData, yRange, setHoverPrice, lastChartData, range } =
    chartConfig;
  const { isFullRange } = positionConfig;

  return (
    <TokenPairHistoricalChart
      data={historicalChartData}
      annotations={
        isFullRange
          ? [new Dec((yRange[0] || 0) * 1.05), new Dec((yRange[1] || 0) * 0.95)]
          : range || []
      }
      domain={yRange}
      onPointerHover={setHoverPrice}
      onPointerOut={
        lastChartData ? () => setHoverPrice(lastChartData.close) : undefined
      }
    />
  );
});
