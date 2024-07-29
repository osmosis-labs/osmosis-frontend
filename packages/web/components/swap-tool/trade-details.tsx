import { Disclosure } from "@headlessui/react";
import { Dec, IntPretty, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { EmptyAmountError } from "@osmosis-labs/keplr-hooks";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import classNames from "classnames";
import { useEffect, useMemo, useState } from "react";
import { useMeasure } from "react-use";

import { Icon } from "~/components/assets/icon";
import { SkeletonLoader, Spinner } from "~/components/loaders";
import { RouteLane } from "~/components/swap-tool/split-route";
import { GenericDisclaimer } from "~/components/tooltip/generic-disclaimer";
import { RecapRow } from "~/components/ui/recap-row";
import { Skeleton } from "~/components/ui/skeleton";
import {
  useDisclosure,
  UseDisclosureReturn,
  usePreviousWhen,
  useSlippageConfig,
  useTranslation,
} from "~/hooks";
import { useSwap } from "~/hooks/use-swap";
import { formatPretty, getPriceExtendedFormatOptions } from "~/utils/formatter";
import { RouterOutputs } from "~/utils/trpc";

interface TradeDetailsProps {
  swapState: ReturnType<typeof useSwap>;
  slippageConfig: ReturnType<typeof useSlippageConfig>;
  type: "limit" | "market";
  outAmountLessSlippage?: IntPretty;
  outFiatAmountLessSlippage?: PricePretty;
  inPriceFetching?: boolean;
  treatAsStable?: string;
  makerFee?: Dec;
  isMakerFeeLoading?: boolean;
}

export const TradeDetails = ({
  swapState,
  inPriceFetching,
  treatAsStable,
  type,
  makerFee,
  isMakerFeeLoading,
}: Partial<TradeDetailsProps>) => {
  const { t } = useTranslation();

  const routesVisDisclosure = useDisclosure();

  const [outAsBase, setOutAsBase] = useState(true);

  const [details, { height: detailsHeight }] = useMeasure<HTMLDivElement>();

  const isInAmountEmpty = useMemo(
    () => swapState?.inAmountInput.error instanceof EmptyAmountError,
    [swapState?.inAmountInput.error]
  );

  const isLoading = useMemo(
    () =>
      (swapState?.isLoadingNetworkFee ||
        swapState?.isQuoteLoading ||
        swapState?.inAmountInput.isTyping) &&
      !Boolean(swapState.error),
    [
      swapState?.inAmountInput.isTyping,
      swapState?.isLoadingNetworkFee,
      swapState?.isQuoteLoading,
      swapState?.error,
    ]
  );

  const priceImpact = useMemo(
    () => swapState?.quote?.priceImpactTokenOut,
    [swapState?.quote?.priceImpactTokenOut]
  );

  const isPriceImpactHigh = useMemo(
    () => priceImpact?.toDec().abs().gt(new Dec(0.1)),
    [priceImpact]
  );

  const limitTotalFees = useMemo(() => {
    return formatPretty((makerFee ?? new Dec(0)).mul(new Dec(100)), {
      maxDecimals: 2,
      minimumFractionDigits: 2,
    });
  }, [makerFee]);

  return (
    <div className="flex w-full">
      <Disclosure>
        {({ open, close }) => (
          <div
            className="flex w-full flex-col transition-all"
            style={{
              height: open ? detailsHeight : 32,
            }}
          >
            <div ref={details} className="flex w-full flex-col">
              <Closer isInAmountEmpty={isInAmountEmpty} close={close} />
              <div className="flex w-full items-center justify-between">
                <SkeletonLoader
                  isLoaded={Boolean(swapState?.inBaseOutQuoteSpotPrice)}
                >
                  <GenericDisclaimer
                    title="What is expected rate?"
                    body="This is the price you are expected to receive. Prices are frequently changing, so if you wish to trade at a specific price, try a limit order instead."
                  >
                    <div className="flex items-center gap-2">
                      {isLoading && (
                        <Spinner className="!h-6 !w-6 text-wosmongton-500" />
                      )}
                      <span
                        onClick={() => setOutAsBase(!outAsBase)}
                        className={classNames("body2 text-osmoverse-300", {
                          "animate-pulse": inPriceFetching || isLoading,
                        })}
                      >
                        {swapState?.inBaseOutQuoteSpotPrice &&
                          ExpectedRate(swapState, outAsBase, treatAsStable)}
                      </span>
                    </div>
                  </GenericDisclaimer>
                </SkeletonLoader>
                <Disclosure.Button
                  className={classNames(
                    "relative flex items-center justify-between py-1 transition-opacity"
                  )}
                  disabled={isInAmountEmpty}
                >
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
              </div>
              <Disclosure.Panel className="body2 flex flex-col text-osmoverse-300">
                {type === "market" ? (
                  <RecapRow
                    left={
                      <GenericDisclaimer
                        title="What is price impact?"
                        body="This is the difference in value between what you pay and what you receive. Positive numbers mean the asset you’re buying is worth more, while negative numbers mean the asset you’re selling is worth more."
                      >
                        {t("assets.transfer.priceImpact")}
                      </GenericDisclaimer>
                    }
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
                ) : (
                  <RecapRow
                    left={<span>Trade fees (when order filled)</span>}
                    right={
                      <span className="text-bullish-400">
                        {t("transfer.free")}
                      </span>
                    }
                  />
                )}
                {type === "market" && (
                  <RecapRow
                    left={
                      <GenericDisclaimer
                        title="What are swap fees?"
                        body="This is the fee charged by the Osmosis protocol in order to reward liquidity providers and maintain the network."
                      >
                        {t("pools.aprBreakdown.swapFees")}
                      </GenericDisclaimer>
                    }
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
                )}
                <RecapRow
                  left={
                    <GenericDisclaimer
                      title="What are trade fees?"
                      body={
                        <span>
                          This is the fee charged by the Osmosis protocol at the
                          time of trade execution in order to reward liquidity
                          providers and maintain the network. <br />
                          <br /> Trade fees for limit orders are currently free.
                          <br />
                          <br />
                          Network fees are additional to every transaction.
                        </span>
                      }
                    >
                      Additional network fees
                    </GenericDisclaimer>
                  }
                  right={
                    swapState && (
                      <>
                        {!swapState.isLoadingNetworkFee ? (
                          <span
                            className={classNames(
                              "inline-flex items-center gap-1 text-osmoverse-100",
                              { "animate-pulse": isMakerFeeLoading }
                            )}
                          >
                            <Icon id="gas" width={16} height={16} />~
                            {type === "market"
                              ? swapState.networkFee?.gasUsdValueToPay &&
                                formatPretty(
                                  swapState.networkFee?.gasUsdValueToPay,
                                  {
                                    maxDecimals: 2,
                                  }
                                )
                              : limitTotalFees}
                          </span>
                        ) : (
                          <Skeleton className="h-5 w-16" />
                        )}
                      </>
                    )
                  }
                />
                {type === "market" && (
                  <Disclosure>
                    {({ open }) => {
                      const routes = swapState?.quote?.split;

                      return (
                        <>
                          <Disclosure.Button className="flex h-8 w-full items-center justify-between">
                            <GenericDisclaimer
                              title="What is a trade route?"
                              body={
                                <>
                                  If there’s no direct market between the assets
                                  you’re trading, Osmosis will try to make the
                                  trade happen by making a series of trades with
                                  other assets to get the best price at any
                                  given time.
                                  <br />
                                  <br />
                                  For optimal efficiency based on available
                                  liquidity, sometimes trades will be split into
                                  multiple routes with different assets.
                                </>
                              }
                            >
                              <span className="body2 text-osmoverse-300">
                                {t("swap.autoRouter")}
                              </span>
                            </GenericDisclaimer>
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
                )}
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

export function ExpectedRate(
  swapState: ReturnType<typeof useSwap>,
  outAsBase: boolean,
  treatAsStable: string | undefined = undefined
) {
  var inBaseOutQuoteSpotPrice =
    swapState?.inBaseOutQuoteSpotPrice?.toDec() ?? new Dec(0);

  var baseAsset;
  var quoteAsset;
  var inQuoteAssetPrice;
  var inFiatPrice = new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0));

  if (treatAsStable && treatAsStable == "in") {
    baseAsset = swapState.toAsset?.coinDenom;
    inQuoteAssetPrice = new Dec(1).quo(inBaseOutQuoteSpotPrice);

    return (
      <span>
        1 {baseAsset} ≈{" $"}
        {formatPretty(inQuoteAssetPrice, {
          ...getPriceExtendedFormatOptions(inQuoteAssetPrice),
        })}{" "}
      </span>
    );
  }

  if (treatAsStable && treatAsStable == "out") {
    baseAsset = swapState.fromAsset?.coinDenom;
    inQuoteAssetPrice = inBaseOutQuoteSpotPrice;

    return (
      <span>
        1 {baseAsset} ≈{" $"}
        {formatPretty(inQuoteAssetPrice, {
          ...getPriceExtendedFormatOptions(inQuoteAssetPrice),
        })}{" "}
      </span>
    );
  }

  if (outAsBase) {
    baseAsset = swapState.toAsset?.coinDenom;
    quoteAsset = swapState.fromAsset?.coinDenom;

    inQuoteAssetPrice = new Dec(1).quo(inBaseOutQuoteSpotPrice);

    if (
      swapState?.tokenOutFiatValue &&
      swapState?.quote?.amount?.toDec().gt(new Dec(0))
    ) {
      inFiatPrice = new PricePretty(
        DEFAULT_VS_CURRENCY,
        swapState.tokenOutFiatValue.quo(swapState.quote.amount.toDec())
      );
    } else {
      if (swapState.inAmountInput?.price) {
        inFiatPrice = swapState.inAmountInput?.price?.quo(
          inBaseOutQuoteSpotPrice
        );
      }
    }
  } else {
    baseAsset = swapState.fromAsset?.coinDenom;
    quoteAsset = swapState.toAsset?.coinDenom;

    inQuoteAssetPrice = inBaseOutQuoteSpotPrice;

    if (
      swapState.tokenOutFiatValue &&
      swapState.inAmountInput?.amount?.toDec().gt(new Dec(0))
    ) {
      inFiatPrice = swapState.tokenOutFiatValue.quo(
        swapState.inAmountInput.amount.toDec()
      );
    } else {
      inFiatPrice =
        swapState.inAmountInput.price ??
        new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0));
    }
  }

  return (
    <span>
      1 {baseAsset} ≈{" "}
      {formatPretty(inQuoteAssetPrice, {
        minimumSignificantDigits: 6,
        maximumSignificantDigits: 6,
        maxDecimals: 10,
        notation: "standard",
      })}{" "}
      {quoteAsset} (
      {formatPretty(inFiatPrice, {
        ...getPriceExtendedFormatOptions(inFiatPrice.toDec()),
      })}
      )
    </span>
  );
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
