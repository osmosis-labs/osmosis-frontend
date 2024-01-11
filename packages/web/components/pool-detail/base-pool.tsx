import { CoinPretty, Dec, IntPretty, RatePretty } from "@keplr-wallet/unit";
import { BasePool, RoutablePool } from "@osmosis-labs/pools";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { useState } from "react";
import { useMeasure } from "react-use";

import TokenPairHistoricalChart, {
  ChartUnavailable,
  PriceChartHeader,
} from "~/components/chart/token-pair-historical";
import Spinner from "~/components/spinner";
import { useTranslation } from "~/hooks";
import { useHistoricalAndLiquidityData } from "~/hooks/ui-config/use-historical-and-depth-data";
import { useStore } from "~/stores";
import { ObservableHistoricalAndLiquidityData } from "~/stores/derived-data";

import { Icon, PoolAssetsIcon } from "../assets";
import { Button, ChartButton } from "../buttons";
import { AssetBreakdownChart } from "../chart";

export const BasePoolDetails: FunctionComponent<{
  pool: BasePool & RoutablePool;
}> = observer(({ pool }) => {
  const { chainStore, priceStore } = useStore();
  const { t } = useTranslation();

  const [showPoolDetails, setShowPoolDetails] = useState(true);
  const osmosisChain = chainStore.getChain(chainStore.osmosis.chainId);

  const chartConfig = useHistoricalAndLiquidityData(
    chainStore.osmosis.chainId,
    pool.id
  );

  const { resetZoom, zoomIn, zoomOut } = chartConfig;

  const poolCurrencies = pool.poolAssetDenoms.map((denom) => {
    return osmosisChain.forceFindCurrency(denom);
  });
  const poolCoins = poolCurrencies.map((currency, index) => {
    return new CoinPretty(currency, pool.poolAssets[index].amount);
  });
  const poolName = poolCurrencies.map((asset) => asset.coinDenom).join(" / ");
  const poolValue = priceStore.calculateTotalPrice(poolCoins);

  const [poolDetailsContainerRef, { y: poolDetailsContainerOffset }] =
    useMeasure<HTMLDivElement>();
  const [poolHeaderRef, { height: poolHeaderHeight }] =
    useMeasure<HTMLDivElement>();
  const [poolBreakdownRef, { height: poolBreakdownHeight }] =
    useMeasure<HTMLDivElement>();

  return (
    <main className="m-auto flex min-h-screen max-w-container flex-col gap-8 bg-osmoverse-900 px-8 py-4 md:gap-4 md:p-4">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-4xl bg-osmoverse-1000 pb-4">
          <div
            ref={poolDetailsContainerRef}
            className={classNames(
              "flex flex-col gap-3 overflow-hidden px-8 pt-8 transition-height duration-300 ease-inOutBack md:px-5 md:pt-7"
            )}
            style={{
              height: showPoolDetails
                ? poolHeaderHeight +
                    poolDetailsContainerOffset +
                    poolBreakdownHeight +
                    12 ?? // gap between header and breakdown
                  178
                : poolHeaderHeight + poolDetailsContainerOffset ?? 100,
            }}
          >
            <div
              ref={poolHeaderRef}
              className="flex place-content-between items-start gap-2 xl:flex-col"
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <PoolAssetsIcon
                    assets={poolCurrencies.map((currency) => ({
                      coinDenom: currency.coinDenom,
                      coinImageUrl: currency.coinImageUrl,
                    }))}
                    size="sm"
                  />
                  <h5>{poolName}</h5>
                </div>
              </div>
              <div className="flex items-center gap-10 xl:w-full xl:place-content-between lg:w-fit lg:flex-col lg:items-start lg:gap-3">
                <div className="space-y-2">
                  <span className="body2 gap-2 text-osmoverse-400">
                    {t("pool.liquidity")}
                  </span>
                  <h4 className="text-osmoverse-100">
                    {poolValue?.toString() ?? ""}
                  </h4>
                </div>
                <div className="space-y-2">
                  <span className="body2 gap-2 text-osmoverse-400">
                    {t("pool.swapFee")}
                  </span>
                  <h4 className="text-osmoverse-100">
                    {new RatePretty(pool.swapFee).maxDecimals(2).toString()}
                  </h4>
                </div>
              </div>
            </div>

            <div className="flex h-[340px] flex-row">
              <div className="flex-shrink-1 flex w-0 flex-1 flex-col gap-[20px] py-7 sm:py-3">
                {chartConfig.queryTokenPairPrice.isFetching ? (
                  <Spinner className="m-auto" />
                ) : !chartConfig.historicalChartUnavailable ? (
                  <>
                    <ChartHeader config={chartConfig} />
                    <Chart config={chartConfig} />
                  </>
                ) : (
                  <ChartUnavailable />
                )}
              </div>

              <div className="flex-shrink-1 relative flex w-[229px] flex-col">
                <div className="mt-7 flex h-6 justify-end gap-1 pr-8 sm:pr-0">
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
              </div>
            </div>

            <div ref={poolBreakdownRef}>
              <AssetBreakdownChart
                assets={poolCoins.map((coin) => ({
                  weight: new IntPretty(
                    new Dec(1).quo(new Dec(pool.poolAssets.length))
                  ).maxDecimals(0),
                  amount: coin,
                }))}
                totalWeight={new IntPretty(pool.poolAssets.length)}
              />
            </div>
          </div>
          <Button
            mode="text"
            className="subtitle2 mx-auto gap-1"
            onClick={() => {
              setShowPoolDetails(!showPoolDetails);
            }}
          >
            <span>
              {showPoolDetails
                ? t("pool.collapseDetails")
                : t("pool.showDetails")}
            </span>
            <div
              className={classNames("flex items-center transition-transform", {
                "rotate-180": showPoolDetails,
              })}
            >
              <Icon id="chevron-down" width="14" height="8" />
            </div>
          </Button>
        </div>
      </section>
    </main>
  );
});

/**
 * Create a nested component to prevent unnecessary re-rendering whenever the hover price changes.
 */
const ChartHeader: FunctionComponent<{
  config: ObservableHistoricalAndLiquidityData;
}> = observer(({ config }) => {
  const {
    historicalRange,
    priceDecimal,
    setHistoricalRange,
    baseDenom,
    quoteDenom,
    hoverPrice,
  } = config;

  return (
    <PriceChartHeader
      historicalRange={historicalRange}
      setHistoricalRange={setHistoricalRange}
      baseDenom={baseDenom}
      quoteDenom={quoteDenom}
      hoverPrice={hoverPrice}
      decimal={priceDecimal}
      classes={{
        buttons: "sm:hidden",
        pricesHeaderContainerClass: "sm:flex-col",
      }}
    />
  );
});

/**
 * Create a nested component to prevent unnecessary re-rendering whenever the hover price changes.
 */
const Chart: FunctionComponent<{
  config: ObservableHistoricalAndLiquidityData;
}> = observer(({ config }) => {
  const { historicalChartData, yRange, setHoverPrice, lastChartData } = config;

  return (
    <TokenPairHistoricalChart
      data={historicalChartData}
      annotations={[]}
      domain={yRange}
      onPointerHover={setHoverPrice}
      onPointerOut={() => {
        if (lastChartData) {
          setHoverPrice(Number(lastChartData.close));
        }
      }}
    />
  );
});
