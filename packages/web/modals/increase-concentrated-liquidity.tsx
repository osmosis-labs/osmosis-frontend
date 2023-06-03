import { Dec } from "@keplr-wallet/unit";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { FunctionComponent, useEffect } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import IconButton from "~/components/buttons/icon-button";
import { PriceChartHeader } from "~/components/chart/token-pair-historical";
import ChartButton from "~/components/chart-button";
import MyPositionStatus from "~/components/my-position-card/position-status";
import { useHistoricalAndLiquidityData } from "~/hooks/ui-config/use-historical-and-depth-data";

import { useConnectWalletModalRedirect } from "../hooks";
import { useStore } from "../stores";
import { ModalBase, ModalBaseProps } from "./base";
// import classNames from "classnames";
// import { InputBox } from "~/components/input";

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
  } & ModalBaseProps
> = observer((props) => {
  const { positionIds } = props;
  const {
    chainStore,
    accountStore,
    queriesStore,
    // priceStore,
    derivedDataStore,
  } = useStore();
  const t = useTranslation();

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getAccount(chainId);
  const isSendingMsg = account.txTypeInProgress !== "";

  const queryPositions =
    queriesStore.get(chainId).osmosis!.queryLiquidityPositions;

  const {
    priceRange,
    passive,
    poolId,
    baseAmount,
    baseDenom,
    quoteAmount,
    quoteDenom,
  } = queryPositions.getMergedPositions(positionIds);

  const [lowerPrice, upperPrice] = priceRange;

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

  // initialize pool data stores once root pool store is loaded
  const { poolDetail } = derivedDataStore.getForPool(poolId as string);
  const pool = poolDetail?.pool?.pool;
  const isConcLiq = pool?.type === "concentrated";
  const currentSqrtPrice =
    isConcLiq && (pool as ConcentratedLiquidityPool).currentSqrtPrice;
  const currentPrice = currentSqrtPrice
    ? currentSqrtPrice.mul(currentSqrtPrice)
    : new Dec(0);

  const {
    showModalBase,
    // accountActionButton
  } = useConnectWalletModalRedirect(
    {
      disabled: isSendingMsg,
      onClick: () => {},
      children: t("addLiquidity.title"),
    },
    props.onRequestClose
  );

  useEffect(() => {
    setRange([lowerPrice, upperPrice]);
  }, [lowerPrice.toString(), upperPrice.toString()]);

  if (pool?.type !== "concentrated") return null;

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
          {/* TODO: use translation */}
          Increase Liquidity
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
        <div className="flex flex-row justify-between">
          <div className="text-subtitle1 font-subtitle1">Your position</div>
          <MyPositionStatus
            currentPrice={currentPrice}
            lowerPrice={lowerPrice}
            upperPrice={upperPrice}
          />
        </div>
        <div className="mb-8 flex flex-row justify-between rounded-[12px] bg-osmoverse-700 py-3 px-5">
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
        <div className="flex flex-col">
          <div className="flex flex-row justify-between">
            <div className="text-subtitle1 font-subtitle1">Selected range</div>
            <div className="text-subtitle1 font-subtitle1">
              {`in ${baseDenom} per ${quoteDenom}`}
            </div>
          </div>
          <div className="flex flex-row gap-1">
            <div className="flex-shrink-1 flex h-[20.1875rem] w-0 flex-1 flex-col gap-[20px] rounded-l-2xl bg-osmoverse-700 py-7 pl-6">
              <PriceChartHeader
                historicalRange={historicalRange}
                setHistoricalRange={setHistoricalRange}
                baseDenom={baseDenom}
                quoteDenom={quoteDenom}
                hoverPrice={hoverPrice}
                decimal={priceDecimal}
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
                  xRange={xRange}
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
                <div className="mt-7 mr-2 flex h-6 flex-row gap-1">
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
                <div className="flex h-full flex-col justify-between py-4">
                  <PriceBox
                    currentValue={
                      passive ? "0" : upperPrice.toString(priceDecimal)
                    }
                    label={t("clPositions.maxPrice")}
                    infinity={passive}
                  />
                  <PriceBox
                    currentValue={
                      passive ? "0" : lowerPrice.toString(priceDecimal)
                    }
                    label={t("clPositions.minPrice")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-row justify-between">
          <div className="text-subtitle1 font-subtitle1">
            Add more liquidity
          </div>
        </div>
        <div className="flex flex-col">
          {/*<DepositAmountGroup*/}
          {/*  getFiatValue={() => null}*/}
          {/*  // coin={pool?.poolAssets[0]?.amount}*/}
          {/*  coinIsToken0={true}*/}
          {/*  onUpdate={() => null}*/}
          {/*  currentValue={baseDepositInput}*/}
          {/*  outOfRange={quoteDepositOnly}*/}
          {/*  percentage={Number(depositPercentages[0].toString())}*/}
          {/*/>*/}
          {/*<DepositAmountGroup*/}
          {/*  getFiatValue={getFiatValue}*/}
          {/*  coin={pool?.poolAssets[1]?.amount}*/}
          {/*  coinIsToken0={false}*/}
          {/*  onUpdate={useCallback(*/}
          {/*    (amount) => {*/}
          {/*      setAchorAsset("quote");*/}
          {/*      setQuoteDepositInput("" + amount);*/}
          {/*      setQuoteDepositAmountIn(amount);*/}
          {/*      calculateBaseDeposit(amount);*/}
          {/*    },*/}
          {/*    [calculateBaseDeposit, setQuoteDepositAmountIn]*/}
          {/*  )}*/}
          {/*  currentValue={quoteDepositInput}*/}
          {/*  outOfRange={baseDepositOnly}*/}
          {/*  percentage={Number(depositPercentages[1].toString())}*/}
          {/*/>*/}
        </div>
      </div>
    </ModalBase>
  );
});

// const DepositAmountGroup: FunctionComponent<{
//   getFiatValue?: (coin: CoinPretty) => PricePretty | undefined;
//   coin?: CoinPretty;
//   coinIsToken0: boolean;
//   onUpdate: (amount: number) => void;
//   currentValue: string;
//   percentage: number;
//   outOfRange?: boolean;
// }> = observer(
//   ({
//     getFiatValue,
//     coin,
//     percentage,
//     onUpdate,
//     coinIsToken0,
//     currentValue,
//     outOfRange,
//   }) => {
//     const { chainStore, queriesStore, accountStore } = useStore();
//     const t = useTranslation();
//     const { chainId } = chainStore.osmosis;
//     const { bech32Address } = accountStore.getAccount(chainId);
//
//     const fiatPer = coin && getFiatValue ? getFiatValue(coin) : 0;
//
//     const walletBalance = coin?.currency
//       ? queriesStore
//           .get(chainId)
//           .queryBalances.getQueryBech32Address(bech32Address)
//           .getBalanceFromCurrency(coin.currency)
//       : null;
//
//     const updateValue = useCallback(
//       (val: string) => {
//         const newVal = Number(val);
//         onUpdate(newVal);
//       },
//       [onUpdate]
//     );
//
//     if (outOfRange) {
//       return (
//         <div className="flex flex-1 flex-shrink-0 flex-row items-center gap-3 rounded-[20px] bg-osmoverse-700 px-6 py-7">
//           <Image
//             className="flex-shrink-0 flex-grow"
//             alt=""
//             src="/icons/lock.svg"
//             height={24}
//             width={24}
//           />
//           <div className="flex-shrink-1 caption w-0 flex-1 text-osmoverse-300">
//             {t("addConcentratedLiquidity.outOfRangeWarning")}
//           </div>
//         </div>
//       );
//     }
//
//     return (
//       <div className="flex flex-1 flex-shrink-0 flex-row items-center rounded-[20px] bg-osmoverse-700 p-6">
//         <div className="flex w-full flex-row items-center">
//           <div
//             className={classNames(
//               "flex overflow-clip rounded-full border-4 p-1",
//               coinIsToken0 ? "border-wosmongton-500" : "border-bullish-500"
//             )}
//           >
//             {coin?.currency.coinImageUrl && (
//               <Image
//                 alt=""
//                 src={coin?.currency.coinImageUrl}
//                 height={58}
//                 width={58}
//               />
//             )}
//           </div>
//           <div className="ml-[.75rem] mr-[2.75rem] flex flex-col">
//             <h6>{coin?.denom ?? ""}</h6>
//             <span className="subtitle1 text-osmoverse-400">
//               {Math.round(percentage).toFixed(0)}%
//             </span>
//           </div>
//           <div className="relative flex flex-1 flex-col gap-0.5">
//             <span className="caption absolute right-0 top-[-16px] mb-[2px] text-right text-wosmongton-300">
//               {walletBalance ? walletBalance.toString() : ""}
//             </span>
//             <div className="flex h-16 w-[158px] flex-col items-end justify-center self-end rounded-[12px] bg-osmoverse-800">
//               <InputBox
//                 className="border-0 bg-transparent text-h5 font-h5"
//                 inputClassName="!leading-4"
//                 type="number"
//                 currentValue={currentValue}
//                 onInput={updateValue}
//                 rightEntry
//               />
//               <div className="caption pr-3 text-osmoverse-400">
//                 {fiatPer && `~${fiatPer.toString()}`}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }
// );

function PriceBox(props: {
  label: string;
  currentValue: string;
  infinity?: boolean;
}) {
  return (
    <div className="flex w-full max-w-[9.75rem] flex-col gap-1">
      <span className="pt-2 text-caption text-osmoverse-400">
        {props.label}
      </span>
      {props.infinity ? (
        <div className="flex h-[41px] flex-row items-center">
          <Image
            alt="infinity"
            src="/icons/infinity.svg"
            width={16}
            height={16}
          />
        </div>
      ) : (
        <h6 className="overflow-hidden text-ellipsis border-0 bg-transparent text-subtitle1 leading-tight">
          {props.currentValue}
        </h6>
      )}
    </div>
  );
}
