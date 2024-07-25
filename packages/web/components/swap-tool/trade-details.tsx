import { Disclosure } from "@headlessui/react";
import { Dec, IntPretty, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { EmptyAmountError } from "@osmosis-labs/keplr-hooks";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import classNames from "classnames";
import { useEffect, useMemo, useState } from "react";
import { useMeasure } from "react-use";

import { Icon } from "~/components/assets";
import { SkeletonLoader, Spinner } from "~/components/loaders";
import { RouteLane } from "~/components/swap-tool/split-route";
import {
  useDisclosure,
  UseDisclosureReturn,
  usePreviousWhen,
  useSlippageConfig,
  useTranslation,
} from "~/hooks";
import { useSwap } from "~/hooks/use-swap";
import { RecapRow } from "~/modals/review-limit-order";
import { formatPretty, getPriceExtendedFormatOptions } from "~/utils/formatter";
import { RouterOutputs } from "~/utils/trpc";

interface TradeDetailsProps {
  swapState: ReturnType<typeof useSwap>;
  slippageConfig: ReturnType<typeof useSlippageConfig>;
  outAmountLessSlippage?: IntPretty;
  outFiatAmountLessSlippage?: PricePretty;
  inPriceFetching?: boolean;
  treatAsStable?: string;
}

export const TradeDetails = ({
  swapState,
  inPriceFetching,
  treatAsStable,
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
              <span
                className={classNames(
                  "relative flex w-full items-center justify-between py-3.5 transition-opacity"
                )}
              >
                <SkeletonLoader
                  isLoaded={Boolean(swapState?.inBaseOutQuoteSpotPrice)}
                >
                  <span
                    onClick={() => setOutAsBase(!outAsBase)}
                    className={classNames(
                      "body2 text-osmoverse-300 transition-opacity",
                      {
                        "opacity-0": open,
                        "animate-pulse": inPriceFetching,
                      }
                    )}
                  >
                    {swapState?.inBaseOutQuoteSpotPrice &&
                      ExpectedRate(swapState, outAsBase, treatAsStable)}
                  </span>
                </SkeletonLoader>
                <span
                  className={classNames("absolute transition-opacity", {
                    "opacity-100": open,
                    "opacity-0": !open,
                  })}
                >
                  {t("limitOrders.tradeDetails")}
                </span>
                <Disclosure.Button
                  className={classNames(
                    "relative flex items-end justify-between transition-opacity"
                  )}
                  disabled={isInAmountEmpty}
                >
                  <div
                    className={classNames(
                      "absolute right-0 flex items-end gap-2 transition-opacity",
                      { "opacity-0": !isLoading }
                    )}
                  >
                    <Spinner className="!h-6 !w-6 text-wosmongton-500" />
                    <span className="body2 text-osmoverse-400">
                      {t("limitOrders.estimatingFees")}
                    </span>
                  </div>
                  <div
                    className={classNames(
                      "flex items-center gap-2 transition-all",
                      {
                        "opacity-0": isInAmountEmpty || isLoading,
                      }
                    )}
                  >
                    <span className="body2 text-osmoverse-300">
                      {open ? t("swap.hideDetails") : t("swap.showDetails")}
                    </span>
                    <Icon
                      id="chevron-down"
                      width={16}
                      height={16}
                      className={classNames(
                        "text-osmoverse-300 transition-transform",
                        {
                          "rotate-180": open,
                        }
                      )}
                    />
                  </div>
                </Disclosure.Button>
              </span>
              <Disclosure.Panel className="body2 flex flex-col gap-1 text-osmoverse-300">
                <RecapRow
                  left={t("limitOrders.expectedRate")}
                  right={
                    swapState?.inBaseOutQuoteSpotPrice && (
                      <span onClick={() => setOutAsBase(!outAsBase)}>
                        {ExpectedRate(swapState, outAsBase, treatAsStable)}
                      </span>
                    )
                  }
                />
                <RecapRow
                  left={t("swap.priceImpact")}
                  right={
                    <span
                      className={classNames({
                        "text-rust-400": priceImpact
                          ?.toDec()
                          .abs()
                          .gt(new Dec(0.1)),
                      })}
                    >
                      -{formatPretty(priceImpact ?? new Dec(0))}
                    </span>
                  }
                />
                <RecapRow
                  left={`${t("pools.aprBreakdown.swapFees")}`}
                  right={
                    <>
                      {swapState?.tokenInFeeAmountFiatValue && (
                        <span>
                          <span className="text-osmoverse-100">
                            ~
                            {formatPretty(
                              swapState?.tokenInFeeAmountFiatValue ??
                                new Dec(0),
                              {
                                maxDecimals: 2,
                              }
                            )}
                          </span>
                          {swapState?.quote?.swapFee
                            ? ` (${swapState?.quote?.swapFee})`
                            : ""}
                        </span>
                      )}
                    </>
                  }
                />

                <span className="subtitle1 py-3 text-white-full">
                  {t("limitOrders.swapRoute")}
                </span>

                <div className="flex w-full">
                  <RecapRow
                    left=""
                    className="!h-auto flex-col !items-start gap-2.5"
                    right={
                      <div className="flex w-full flex-col gap-2">
                        <RoutesTaken
                          {...routesVisDisclosure}
                          split={swapState?.quote?.split ?? []}
                          isLoading={swapState?.isQuoteLoading}
                        />
                      </div>
                    }
                  />
                </div>
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
