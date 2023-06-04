import { CoinPretty, Dec } from "@keplr-wallet/unit";
import {
  calculateDepositAmountForBase,
  calculateDepositAmountForQuote,
} from "@osmosis-labs/math";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import IconButton from "~/components/buttons/icon-button";
import { PriceChartHeader } from "~/components/chart/token-pair-historical";
import ChartButton from "~/components/chart-button";
import { DepositAmountGroup } from "~/components/cl-deposit-input-group";
import { tError } from "~/components/localization";
import MyPositionStatus from "~/components/my-position-card/position-status";
import { useHistoricalAndLiquidityData } from "~/hooks/ui-config/use-historical-and-depth-data";
import { formatPretty } from "~/utils/formatter";

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
    positionIds: string[];
    baseAmount: Dec;
    quoteAmount: Dec;
    lowerPrice: Dec;
    upperPrice: Dec;
    passive: boolean;
  } & ModalBaseProps
> = observer((props) => {
  const { lowerPrice, upperPrice, poolId, baseAmount, quoteAmount, passive } =
    props;
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
    quoteCurrency,
    baseCurrency,
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
    setRange,
  } = useHistoricalAndLiquidityData(chainId, poolId);

  const [baseDepositInput, setBaseDepositInput] = useState("0");
  const [quoteDepositInput, setQuoteDepositInput] = useState("0");
  const [anchorAsset, setAchorAsset] = useState<"base" | "quote" | "">("");

  const { config, addLiquidity } = useAddConcentratedLiquidityConfig(
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
        return addLiquidity().finally(() => props.onRequestClose());
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

  const calculateQuoteDeposit = useCallback(
    (amount: number) => {
      const amt = new Dec(amount);
      let quoteDeposit: Dec;

      const [lowerTick, upperTick] = config.tickRange;
      quoteDeposit = calculateDepositAmountForQuote(
        currentPrice,
        lowerTick,
        upperTick,
        amt
      );

      config.setQuoteDepositAmountIn(quoteDeposit);
      setQuoteDepositInput(quoteDeposit.toString());
    },
    [
      currentPrice,
      config.tickRange,
      config.setQuoteDepositAmountIn,
      config.fullRange,
    ]
  );

  const calculateBaseDeposit = useCallback(
    (amount: number) => {
      const amt = new Dec(amount);
      const [lowerTick, upperTick] = config.tickRange;
      const baseDeposit = calculateDepositAmountForBase(
        currentPrice,
        lowerTick,
        upperTick,
        amt
      );

      config.setBaseDepositAmountIn(baseDeposit);
      setBaseDepositInput(baseDeposit.toString());
    },
    [
      currentPrice,
      config.tickRange,
      config.setBaseDepositAmountIn,
      config.fullRange,
    ]
  );

  const rangeMin = Number(config.range[0].toString());
  const rangeMax = Number(config.range[1].toString());

  useEffect(() => {
    if (anchorAsset === "base") {
      calculateQuoteDeposit(+config.baseDepositAmountIn.amount);
    }
  }, [
    rangeMin,
    rangeMax,
    anchorAsset,
    config.baseDepositAmountIn,
    calculateQuoteDeposit,
  ]);

  useEffect(() => {
    if (anchorAsset === "quote") {
      calculateBaseDeposit(+config.quoteDepositAmountIn.amount);
    }
  }, [
    rangeMin,
    rangeMax,
    anchorAsset,
    config.quoteDepositAmountIn,
    calculateBaseDeposit,
  ]);

  useEffect(() => {
    setRange([lowerPrice, upperPrice]);
    config.setMinRange(lowerPrice);
    config.setMaxRange(upperPrice);
  }, [lowerPrice.toString(), upperPrice.toString()]);

  if (pool?.type !== "concentrated" || !baseCurrency) return null;

  return (
    <ModalBase
      {...props}
      isOpen={props.isOpen && showModalBase}
      hideCloseButton
      className="!max-w-[500px]"
    >
      <div className="align-center relative mb-8 flex flex-row">
        <div className="absolute left-0 flex h-full items-center text-sm" />
        <h6 className="flex-1 text-center">
          {t("clPositions.increaseLiquidity")}
        </h6>
        <div className="absolute right-0">
          <IconButton
            aria-label="Close"
            mode="unstyled"
            size="unstyled"
            className="!p-0"
            icon={
              <Icon
                id="close-thin"
                className="text-wosmongton-400 hover:text-wosmongton-100"
                height={24}
                width={24}
              />
            }
            onClick={props.onRequestClose}
          />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-center justify-between">
          <div className="pl-4 text-subtitle1 font-subtitle1">
            {t("clPositions.yourPosition")}
          </div>
          <MyPositionStatus
            currentPrice={currentPrice}
            lowerPrice={lowerPrice}
            upperPrice={upperPrice}
            negative
          />
        </div>
        <div className="mb-8 flex flex-row justify-between rounded-[12px] bg-osmoverse-700 py-3 px-5 text-osmoverse-100">
          {baseCurrency && (
            <div className="flex flex-row items-center gap-2 text-subtitle1 font-subtitle1">
              <img
                className="h-[1.5rem] w-[1.5rem]"
                src={baseCurrency.coinImageUrl}
              />
              <span>
                {baseAmount.toString(
                  baseCurrency.coinMinimalDenom
                    ? 2
                    : Number(baseCurrency.coinMinimalDenom)
                )}
              </span>
              <span>{baseCurrency.coinDenom}</span>
            </div>
          )}
          {quoteCurrency && (
            <div className="flex flex-row items-center gap-2 text-subtitle1 font-subtitle1">
              <img
                className="h-[1.5rem] w-[1.5rem]"
                src={quoteCurrency.coinImageUrl}
              />
              <span>
                {quoteAmount.toString(
                  quoteCurrency.coinMinimalDenom
                    ? 2
                    : Number(quoteCurrency.coinMinimalDenom)
                )}
              </span>
              <span>{quoteCurrency.coinDenom}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-row gap-2 pl-4">
            <div className="text-subtitle1 font-subtitle1">
              {t("clPositions.selectedRange")}
            </div>
            <div className="text-subtitle1 font-subtitle1 text-osmoverse-300">
              {t("addConcentratedLiquidity.basePerQuote", {
                base: baseCurrency?.coinDenom || "",
                quote: quoteCurrency?.coinDenom || "",
              })}
            </div>
          </div>
          <div className="flex flex-row gap-1">
            <div className="flex-shrink-1 flex h-[20.1875rem] w-0 flex-1 flex-col gap-[20px] rounded-l-2xl bg-osmoverse-700 py-6 pl-6">
              <PriceChartHeader
                priceHeaderClass="text-h5 font-h5 text-osmoverse-200"
                historicalRange={historicalRange}
                setHistoricalRange={setHistoricalRange}
                baseDenom={baseCurrency?.coinDenom || ""}
                quoteDenom={quoteCurrency?.coinDenom || ""}
                hoverPrice={hoverPrice}
                decimal={priceDecimal}
                hideButtons
              />
              <TokenPairHistoricalChart
                data={historicalChartData}
                annotations={
                  passive
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
            <div className="flex-shrink-1 relative flex h-[20.1875rem] w-0 flex-1 flex-row rounded-r-2xl bg-osmoverse-700">
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
                      price: Number(lowerPrice.toString()),
                      depth: xRange[1],
                    },
                    {
                      price: Number(upperPrice.toString()),
                      depth: xRange[1],
                    },
                  ]}
                  offset={{ top: 0, right: 32, bottom: 24 + 28, left: 0 }}
                  horizontal
                  fullRange={passive}
                />
              </div>
              <div className="absolute right-0 top-0 mb-8 flex h-full flex-col">
                <div className="mt-[25px] mr-[22px] flex h-6 flex-row gap-1">
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
                <div className="mr-[22px] mb-4 flex h-full flex-col items-end justify-between py-4 ">
                  <PriceBox
                    currentValue={
                      passive
                        ? "0"
                        : formatPretty(
                            new CoinPretty(
                              baseCurrency,
                              upperPrice.mul(
                                new Dec(10 ** baseCurrency.coinDecimals)
                              )
                            ),
                            { hideCoinDenom: true }
                          )
                    }
                    label={t("clPositions.maxPrice")}
                    infinity={passive}
                  />
                  <PriceBox
                    currentValue={
                      passive
                        ? "0"
                        : formatPretty(
                            new CoinPretty(
                              baseCurrency,
                              lowerPrice.mul(
                                new Dec(10 ** baseCurrency.coinDecimals)
                              )
                            ),
                            { hideCoinDenom: true }
                          )
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
        <div className="flex flex-row justify-between">
          <div className="pl-4 text-subtitle1 font-subtitle1">
            {t("clPositions.addMoreLiquidity")}
          </div>
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
                setAchorAsset("base");
                setBaseDepositInput("" + amount);
                config.setBaseDepositAmountIn(amount);
                calculateQuoteDeposit(amount);
              },
              [calculateQuoteDeposit, config.setBaseDepositAmountIn]
            )}
            currentValue={baseDepositInput}
            outOfRange={config.quoteDepositOnly}
            percentage={Number(config.depositPercentages[0].toString())}
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
                setAchorAsset("quote");
                setQuoteDepositInput("" + amount);
                config.setQuoteDepositAmountIn(amount);
                calculateBaseDeposit(amount);
              },
              [calculateBaseDeposit, config.setQuoteDepositAmountIn]
            )}
            currentValue={quoteDepositInput}
            outOfRange={config.baseDepositOnly}
            percentage={Number(config.depositPercentages[1].toString())}
          />
        </div>
        {accountActionButton}
      </div>
    </ModalBase>
  );
});

function PriceBox(props: {
  label: string;
  currentValue: string;
  infinity?: boolean;
}) {
  return (
    <div className="flex max-w-[6.25rem] flex-col gap-1">
      <span className="pt-2 text-body2 font-body2 text-osmoverse-300">
        {props.label}
      </span>
      {props.infinity ? (
        <div className="flex h-[20px] flex-row items-center">
          <Image
            alt="infinity"
            src="/icons/infinity.svg"
            width={16}
            height={16}
          />
        </div>
      ) : (
        <h6 className="overflow-hidden text-ellipsis border-0 bg-transparent text-subtitle1 font-subtitle1 leading-tight">
          {props.currentValue}
        </h6>
      )}
    </div>
  );
}
