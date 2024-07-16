import { Disclosure } from "@headlessui/react";
import { Dec, IntPretty, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { EmptyAmountError } from "@osmosis-labs/keplr-hooks";
import classNames from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import AutosizeInput from "react-input-autosize";
import { useMeasure } from "react-use";

import { Icon } from "~/components/assets";
import { Spinner } from "~/components/loaders";
import { RouteLane } from "~/components/swap-tool/split-route";
import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useDisclosure,
  UseDisclosureReturn,
  usePreviousWhen,
  useSlippageConfig,
  useTranslation,
} from "~/hooks";
import { useSwap } from "~/hooks/use-swap";
import { RecapRow } from "~/modals/review-limit-order";
import { formatPretty } from "~/utils/formatter";
import { RouterOutputs } from "~/utils/trpc";

interface TradeDetailsProps {
  swapState: ReturnType<typeof useSwap>;
  slippageConfig: ReturnType<typeof useSlippageConfig>;
  outAmountLessSlippage?: IntPretty;
  outFiatAmountLessSlippage?: PricePretty;
  baseSpotPrice: Dec;
}

export const TradeDetails = ({
  swapState,
  slippageConfig,
  outAmountLessSlippage,
  outFiatAmountLessSlippage,
  baseSpotPrice,
}: Partial<TradeDetailsProps>) => {
  const { logEvent } = useAmplitudeAnalytics();
  const { t } = useTranslation();

  const routesVisDisclosure = useDisclosure();

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

  const [manualSlippage, setManualSlippage] = useState("");
  const handleManualSlippageChange = useCallback(
    (value: string) => {
      if (value.length > 3) return;

      setManualSlippage(value);
      slippageConfig?.setManualSlippage(new Dec(+value).toString());
    },
    [slippageConfig]
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
                <span
                  className={classNames(
                    "body2 text-osmoverse-300 transition-opacity",
                    {
                      "opacity-0": open,
                    }
                  )}
                >
                  {swapState?.fromAsset?.coinDenom}{" "}
                  {t("assets.table.price").toLowerCase()} ≈{" "}
                  {swapState?.toAsset &&
                    formatPretty(
                      baseSpotPrice ??
                        swapState.inBaseOutQuoteSpotPrice ??
                        new Dec(0),
                      {
                        maxDecimals: baseSpotPrice
                          ? 2
                          : Math.min(swapState.toAsset.coinDecimals, 8),
                      }
                    )}
                </span>
                <span
                  className={classNames("absolute transition-opacity", {
                    "opacity-100": open,
                    "opacity-0": !open,
                  })}
                >
                  {t("limitOrders.tradeDetails")}
                </span>
                <div
                  className={classNames(
                    "absolute right-0 flex items-center gap-2 transition-opacity",
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
                    ~${formatPretty(swapState?.totalFee ?? new Dec(0))}{" "}
                    {t("limitOrders.fees")}
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
                  left={`${t("pools.aprBreakdown.swapFees")} ${
                    swapState?.quote?.swapFee
                      ? `(${swapState?.quote?.swapFee})`
                      : ""
                  }`}
                  right={
                    <>
                      {swapState?.tokenInFeeAmountFiatValue && (
                        <span>
                          <span className="text-osmoverse-100">
                            ~
                            {formatPretty(
                              swapState?.tokenInFeeAmountFiatValue ?? new Dec(0)
                            )}
                          </span>{" "}
                          (
                          {formatPretty(
                            swapState?.tokenInFeeAmountFiatValue.toDec()
                          )}{" "}
                          USDC)
                        </span>
                      )}
                    </>
                  }
                />
                <hr className="my-2 w-full text-osmoverse-700" />
                {outAmountLessSlippage &&
                  outFiatAmountLessSlippage &&
                  swapState?.toAsset && (
                    <RecapRow
                      left={t("limitOrders.receiveEstimated")}
                      right={
                        <span>
                          <span className="text-osmoverse-100">
                            {formatPretty(outAmountLessSlippage, {
                              maxDecimals: 8,
                            })}{" "}
                            {swapState?.toAsset.coinDenom}
                          </span>{" "}
                          {outFiatAmountLessSlippage && (
                            <span className="text-osmoverse-300">
                              (~{formatPretty(outFiatAmountLessSlippage)})
                            </span>
                          )}
                        </span>
                      }
                    />
                  )}
                <span className="subtitle1 py-3 text-white-full">
                  {t("limitOrders.moreDetails")}
                </span>
                {slippageConfig && (
                  <RecapRow
                    left={t("swap.settings.slippage")}
                    right={
                      <div className="flex items-center justify-end">
                        {slippageConfig?.selectableSlippages.map((props) => (
                          <SlippageButton
                            key={`slippage-${props.index}`}
                            {...props}
                            onSelect={() => {
                              slippageConfig.select(props.index);

                              logEvent([
                                EventName.Swap.slippageToleranceSet,
                                {
                                  percentage:
                                    slippageConfig.slippage.toString(),
                                  page: "Swap Page",
                                },
                              ]);
                            }}
                          />
                        ))}
                        <div
                          className={classNames(
                            "flex w-fit items-center justify-center overflow-hidden rounded-3xl py-1.5 px-2 text-center transition-colors hover:bg-osmoverse-825",
                            {
                              "bg-osmoverse-825":
                                slippageConfig?.isManualSlippage,
                            }
                          )}
                        >
                          <AutosizeInput
                            type="number"
                            minWidth={30}
                            placeholder={t("pool.custom")}
                            className="w-fit bg-transparent px-0"
                            inputClassName="!bg-transparent text-center placeholder:text-osmoverse-300 w-[30px] transition-all"
                            value={manualSlippage}
                            onFocus={() =>
                              slippageConfig?.setIsManualSlippage(true)
                            }
                            autoFocus={slippageConfig?.isManualSlippage}
                            onChange={(e) => {
                              handleManualSlippageChange(e.target.value);

                              logEvent([
                                EventName.Swap.slippageToleranceSet,
                                {
                                  fromToken: swapState?.fromAsset?.coinDenom,
                                  toToken: swapState?.toAsset?.coinDenom,
                                  // isOnHome: page === "Swap Page",
                                  isOnHome: true,
                                  percentage:
                                    slippageConfig?.slippage.toString(),
                                  page: "Swap Page",
                                },
                              ]);
                            }}
                          />
                          {manualSlippage !== "" && <span>%</span>}
                        </div>
                      </div>
                    }
                  />
                )}
                <div className="flex w-full">
                  <RecapRow
                    left={t("limitOrders.swapRoute")}
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

function SlippageButton({
  slippage,
  selected,
  onSelect,
}: {
  slippage: RatePretty;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={classNames(
        "flex w-fit items-center justify-center rounded-3xl py-1.5 px-2 transition-colors hover:bg-osmoverse-825",
        { "bg-osmoverse-825": selected }
      )}
    >
      {formatPretty(slippage)}
    </button>
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
