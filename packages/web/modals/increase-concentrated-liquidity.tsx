import { Dec } from "@keplr-wallet/unit";
import type { UserPosition, UserPositionDetails } from "@osmosis-labs/server";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
} from "react";

import { MyPositionStatus } from "~/components/cards/my-position/status";
import { PriceChartHeader } from "~/components/chart/price-historical";
import { DepositAmountGroup } from "~/components/cl-deposit-input-group";
import { tError } from "~/components/localization";
import { ChartButton } from "~/components/ui/button";
import {
  ObservableAddConcentratedLiquidityConfig,
  useAddConcentratedLiquidityConfig,
  useConnectWalletModalRedirect,
  useTranslation,
} from "~/hooks";
import {
  ObservableHistoricalAndLiquidityData,
  useHistoricalAndLiquidityData,
} from "~/hooks/ui-config/use-historical-and-depth-data";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { formatPretty, getPriceExtendedFormatOptions } from "~/utils/formatter";

const ConcentratedLiquidityDepthChart = dynamic(
  () =>
    import("~/components/chart/concentrated-liquidity-depth").then(
      (module) => module.ConcentratedLiquidityDepthChart
    ),
  { ssr: false }
);
const HistoricalPriceChart = dynamic(
  () =>
    import("~/components/chart/price-historical").then(
      (module) => module.HistoricalPriceChart
    ),
  { ssr: false }
);

export const IncreaseConcentratedLiquidityModal: FunctionComponent<
  {
    poolId: string;
    position: UserPosition;
    status: UserPositionDetails["status"];
  } & ModalBaseProps
> = observer((props) => {
  const { poolId, position, status } = props;
  const { chainStore, accountStore } = useStore();
  const { t } = useTranslation();

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);
  const isSendingMsg = Boolean(account?.txTypeInProgress);

  const chartConfig = useHistoricalAndLiquidityData(poolId);
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

  const {
    id,
    priceRange: [lowerPrice, upperPrice],
    currentCoins: [baseCoin, quoteCoin],
    isFullRange,
  } = position;

  const { config, increaseLiquidity } = useAddConcentratedLiquidityConfig(
    chainStore,
    chainId,
    poolId
  );

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled: config.error !== undefined || isSendingMsg,
      onClick: () => increaseLiquidity(id).then(() => props.onRequestClose()),
      children: config.error
        ? t(...tError(config.error))
        : t("clPositions.addMoreLiquidity"),
    },
    props.onRequestClose
  );

  useEffect(() => {
    setPriceRange([lowerPrice, upperPrice]);
    config.setMinRange(lowerPrice.toString());
    config.setMaxRange(upperPrice.toString());
  }, [config, setPriceRange, lowerPrice, upperPrice]);

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
          <MyPositionStatus className="xs:px-0" status={status} negative />
        </div>
        <div className="mb-2 flex justify-between rounded-[12px] bg-osmoverse-700 px-5 py-3 text-osmoverse-100 xs:flex-wrap xs:gap-y-2 xs:px-3">
          <div className="flex items-center gap-2 text-subtitle1 font-subtitle1 xs:text-body2">
            {baseCoin.currency.coinImageUrl && (
              <Image
                alt="base currency"
                src={baseCoin.currency.coinImageUrl}
                height={24}
                width={24}
              />
            )}
            <span>{formatPretty(baseCoin, { maxDecimals: 2 })}</span>
          </div>
          <div className="flex items-center gap-2 text-subtitle1 font-subtitle1 xs:text-body2">
            {quoteCoin.currency.coinImageUrl && (
              <Image
                alt="base currency"
                src={quoteCoin.currency.coinImageUrl}
                height={24}
                width={24}
              />
            )}
            <span>{formatPretty(quoteCoin, { maxDecimals: 2 })}</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 pl-4 xs:pl-1">
            <div className="text-subtitle1 font-subtitle1">
              {t("clPositions.selectedRange")}
            </div>
            <div className="text-subtitle1 font-subtitle1 text-osmoverse-300 xs:text-body2">
              {t("addConcentratedLiquidity.basePerQuote", {
                base: baseCoin.denom,
                quote: quoteCoin.denom,
              })}
            </div>
          </div>
          <div className="flex gap-1">
            <div className="flex-shrink-1 flex h-[20.1875rem] w-0 flex-1 flex-col gap-[20px] rounded-l-2xl bg-osmoverse-700 py-6 pl-6 xs:hidden">
              <ChartHeader
                chartConfig={chartConfig}
                addLiquidityConfig={config}
              />
              <Chart chartConfig={chartConfig} position={position} />
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
                      price: Number(lowerPrice.toString() ?? 0),
                      depth: xRange[1],
                    },
                    {
                      price: Number(upperPrice.toString() ?? 0),
                      depth: xRange[1],
                    },
                  ]}
                  offset={{ top: 0, right: 10, bottom: 24 + 24, left: 0 }}
                  horizontal
                  fullRange={isFullRange}
                />
              </div>
              <div className="flex h-full flex-col">
                <div className="absolute right-0 mr-[8px] mt-[25px] flex h-6 gap-1">
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
                <div className="mb-4 mr-[8px] mt-[55px] flex h-full flex-col items-end justify-between py-4 ">
                  <PriceBox
                    currentValue={formatPretty(upperPrice).toString()}
                    label={t("clPositions.maxPrice")}
                    infinity={isFullRange}
                  />
                  <PriceBox
                    currentValue={
                      isFullRange ? "0" : formatPretty(lowerPrice).toString()
                    }
                    label={t("clPositions.minPrice")}
                  />
                </div>
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
            currency={baseCoin.currency}
            onUpdate={useCallback(
              (amount) => {
                config.setAnchorAsset("base");
                config.baseDepositAmountIn.setAmount(amount);
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
            currency={quoteCoin.currency}
            onUpdate={useCallback(
              (amount) => {
                config.setAnchorAsset("quote");
                config.quoteDepositAmountIn.setAmount(amount);
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

  const formatOpts = useMemo(
    () => getPriceExtendedFormatOptions(new Dec(hoverPrice)),
    [hoverPrice]
  );

  return (
    <PriceChartHeader
      classes={{
        priceHeaderClass: "text-h5 font-h5 text-osmoverse-200",
      }}
      formatOpts={formatOpts}
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
  position: UserPosition;
}> = observer(({ chartConfig, position: { isFullRange } }) => {
  const { historicalChartData, yRange, setHoverPrice, lastChartData, range } =
    chartConfig;

  return (
    <HistoricalPriceChart
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
