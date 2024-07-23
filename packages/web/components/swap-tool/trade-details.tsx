import { Disclosure } from "@headlessui/react";
import {
  CoinPretty,
  Dec,
  IntPretty,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
import { EmptyAmountError } from "@osmosis-labs/keplr-hooks";
import classNames from "classnames";
import { useEffect, useMemo } from "react";
import { useMeasure } from "react-use";

import { Icon } from "~/components/assets/icon";
import { SkeletonLoader } from "~/components/loaders";
import { RouteLane } from "~/components/swap-tool/split-route";
import { GenericDisclaimer } from "~/components/tooltip/generic-disclaimer";
import { RecapRow } from "~/components/ui/recap-row";
import {
  useDisclosure,
  UseDisclosureReturn,
  usePreviousWhen,
  useSlippageConfig,
  useTranslation,
} from "~/hooks";
import { useSwap } from "~/hooks/use-swap";
import { formatPretty } from "~/utils/formatter";
import { RouterOutputs } from "~/utils/trpc";

interface TradeDetailsProps {
  swapState: ReturnType<typeof useSwap>;
  slippageConfig: ReturnType<typeof useSlippageConfig>;
  outAmountLessSlippage?: IntPretty;
  outFiatAmountLessSlippage?: PricePretty;
  inDenom?: string;
  inPrice?: CoinPretty | PricePretty;
  inPriceFetching?: boolean;
}

export const TradeDetails = ({
  swapState,
  inDenom,
  inPrice,
  inPriceFetching,
}: Partial<TradeDetailsProps>) => {
  const { t } = useTranslation();

  const routesVisDisclosure = useDisclosure();

  const [details, { height: detailsHeight }] = useMeasure<HTMLDivElement>();

  const isInAmountEmpty = useMemo(
    () => swapState?.inAmountInput.error instanceof EmptyAmountError,
    [swapState?.inAmountInput.error]
  );

  // const isLoading = useMemo(
  //   () =>
  //     (swapState?.isLoadingNetworkFee ||
  //       swapState?.isQuoteLoading ||
  //       swapState?.inAmountInput.isTyping) &&
  //     !Boolean(swapState.error),
  //   [
  //     swapState?.inAmountInput.isTyping,
  //     swapState?.isLoadingNetworkFee,
  //     swapState?.isQuoteLoading,
  //     swapState?.error,
  //   ]
  // );

  const priceImpact = useMemo(
    () => swapState?.quote?.priceImpactTokenOut,
    [swapState?.quote?.priceImpactTokenOut]
  );

  const isPriceImpactHigh = useMemo(
    () => priceImpact?.toDec().abs().gt(new Dec(0.1)),
    [priceImpact]
  );

  return (
    <div className="flex w-full">
      <Disclosure>
        {({ open, close }) => (
          <div
            className="flex w-full flex-col transition-all"
            style={{
              height: open ? detailsHeight : 48,
            }}
          >
            <div ref={details} className="flex w-full flex-col">
              <Closer isInAmountEmpty={isInAmountEmpty} close={close} />
              <Disclosure.Button
                className={classNames(
                  "relative flex w-full items-center justify-between py-3.5 transition-opacity"
                )}
                disabled={isInAmountEmpty}
              >
                <SkeletonLoader isLoaded={Boolean(inPrice)}>
                  <span
                    className={classNames("body2 text-osmoverse-300", {
                      "animate-pulse": inPriceFetching,
                    })}
                  >
                    {inDenom} {t("assets.table.price").toLowerCase()} ≈{" "}
                    {inPrice &&
                      formatPretty(inPrice ?? inPrice ?? new Dec(0), {
                        maxDecimals: inPrice
                          ? 2
                          : Math.min(swapState?.toAsset?.coinDecimals ?? 8, 8),
                      })}
                  </span>
                </SkeletonLoader>
                <GenericDisclaimer
                  title="High price impact"
                  body="With a trade of this size, you may receive a significantly lower value due to low liquidity between the selected assets"
                  disabled={!isPriceImpactHigh}
                >
                  <div
                    className={classNames(
                      "flex items-center gap-2 transition-opacity",
                      {
                        "opacity-0": isInAmountEmpty,
                      }
                    )}
                  >
                    {isPriceImpactHigh && (
                      <Icon id="alert-circle-filled" width={16} height={16} />
                    )}
                    <span className="body2 text-wosmongton-300">
                      {open ? t("swap.hideDetails") : t("swap.showDetails")}
                    </span>
                  </div>
                </GenericDisclaimer>
              </Disclosure.Button>
              <Disclosure.Panel className="body2 flex flex-col gap-1 text-osmoverse-300">
                <RecapRow
                  left={t("limitOrders.expectedRate")}
                  right={
                    <span>
                      1 {swapState?.fromAsset?.coinDenom} ≈{" "}
                      {swapState?.toAsset
                        ? formatPretty(
                            swapState.inBaseOutQuoteSpotPrice ?? new Dec(0),
                            {
                              maxDecimals: Math.min(
                                swapState.toAsset.coinDecimals,
                                8
                              ),
                            }
                          )
                        : "0"}
                    </span>
                  }
                />
                <RecapRow
                  left={t("assets.transfer.priceImpact")}
                  right={
                    <GenericDisclaimer
                      title="High price impact"
                      body="With a trade of this size, you may receive a significantly lower value due to low liquidity between the selected assets"
                      disabled={!isPriceImpactHigh}
                    >
                      <div className="inline-flex items-center gap-1">
                        {isPriceImpactHigh && (
                          <Icon
                            id="alert-circle-filled"
                            width={16}
                            height={16}
                          />
                        )}
                        <span
                          className={classNames({
                            "text-rust-400": isPriceImpactHigh,
                            "text-bullish-400": !isPriceImpactHigh,
                          })}
                        >
                          -{formatPretty(priceImpact ?? new Dec(0))}
                        </span>
                      </div>
                    </GenericDisclaimer>
                  }
                />
                <RecapRow
                  left={`${t("pools.aprBreakdown.swapFees")}`}
                  right={
                    <>
                      {swapState?.tokenInFeeAmountFiatValue && (
                        <>
                          {swapState?.tokenInFeeAmountFiatValue
                            .toDec()
                            .gt(new Dec(0)) ? (
                            <span>
                              <span className="text-osmoverse-100">
                                ~
                                {formatPretty(
                                  swapState?.tokenInFeeAmountFiatValue,
                                  {
                                    maxDecimals: 2,
                                  }
                                )}
                              </span>
                              <span className="text-osmoverse-500">
                                {swapState?.quote?.swapFee
                                  ? ` (${swapState?.quote?.swapFee})`
                                  : ""}
                              </span>
                            </span>
                          ) : (
                            <span className="text-bullish-400">
                              {t("transfer.free")}
                            </span>
                          )}
                        </>
                      )}
                    </>
                  }
                />
                <Disclosure>
                  {({ open }) => {
                    const routes = swapState?.quote?.split;

                    return (
                      <>
                        <Disclosure.Button className="flex h-8 w-full items-center justify-between">
                          <span className="body2 text-osmoverse-300">
                            {t("swap.autoRouter")}
                          </span>
                          <div className="flex items-center gap-1 text-wosmongton-300">
                            <span className="body2">
                              {routes?.length}{" "}
                              {routes?.length === 1 ? "route" : "routes"}
                            </span>
                            <Icon
                              id="chevron-down"
                              width={16}
                              height={16}
                              className={classNames("transition-transform", {
                                "rotate-180": open,
                              })}
                            />
                          </div>
                        </Disclosure.Button>
                        <Disclosure.Panel className="flex w-full flex-col gap-2">
                          <RoutesTaken
                            {...routesVisDisclosure}
                            split={routes ?? []}
                            isLoading={swapState?.isQuoteLoading}
                          />
                        </Disclosure.Panel>
                      </>
                    );
                  }}
                </Disclosure>
              </Disclosure.Panel>
            </div>
          </div>
        )}
      </Disclosure>
    </div>
  );
};

export function Closer({
  close,
  isInAmountEmpty,
}: {
  isInAmountEmpty: boolean;
  close: () => void;
}) {
  useEffect(() => {
    if (isInAmountEmpty) {
      close();
    }
  }, [close, isInAmountEmpty]);

  return <></>;
}

type Split =
  RouterOutputs["local"]["quoteRouter"]["routeTokenOutGivenIn"]["split"];
type Route = Split[number];
type RouteWithPercentage = Route & { percentage?: RatePretty };

function RoutesTaken({
  split,
  isLoading,
}: { split: Split } & Pick<UseDisclosureReturn, "isOpen" | "onToggle"> & {
    isLoading?: boolean;
  }) {
  // hold on to a ref of the last split to use while we're loading the next one
  // this prevents whiplash in the UI
  const latestSplitRef = usePreviousWhen(split, (s) => s.length > 0);

  split = isLoading ? latestSplitRef ?? split : split;

  const tokenInTotal = useMemo(
    () =>
      split.reduce(
        (sum, { initialAmount }) => sum.add(new Dec(initialAmount)),
        new Dec(0)
      ),
    [split]
  );

  const splitWithPercentages: RouteWithPercentage[] = useMemo(() => {
    if (split.length === 1) return split;

    return split.map((route) => {
      const percentage = new RatePretty(
        new Dec(route.initialAmount).quo(tokenInTotal).mul(new Dec(100))
      ).moveDecimalPointLeft(2);

      return {
        ...route,
        percentage,
      };
    });
  }, [split, tokenInTotal]);

  return (
    <div className="flex flex-col gap-2">
      {splitWithPercentages.map((route) => (
        <RouteLane
          key={route.pools.map(({ id }) => id).join()} // pool IDs are unique
          route={route}
        />
      ))}
    </div>
  );
}
