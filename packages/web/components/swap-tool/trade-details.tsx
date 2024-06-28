import { Disclosure } from "@headlessui/react";
import { Dec, RatePretty } from "@keplr-wallet/unit";
import { EmptyAmountError } from "@osmosis-labs/keplr-hooks";
import classNames from "classnames";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo } from "react";
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
} from "~/hooks";
import { useSwap } from "~/hooks/use-swap";
import { RecapRow } from "~/modals/review-limit-order";
import { formatPretty } from "~/utils/formatter";
import { api, RouterOutputs } from "~/utils/trpc";

interface TradeDetailsProps {
  isLoading: boolean;
  swapState: ReturnType<typeof useSwap>;
  slippageConfig: ReturnType<typeof useSlippageConfig>;
}

export const TradeDetails = ({
  swapState,
  slippageConfig,
}: Partial<TradeDetailsProps>) => {
  const { logEvent } = useAmplitudeAnalytics();

  const routesVisDisclosure = useDisclosure();
  const [queryToFallbackDenom] = useQueryState(
    "to",
    parseAsString.withDefault("ATOM")
  );

  const [ref] = useMeasure<HTMLDivElement>();
  const [swapRouteRef, { height: swapRouteHeight }] =
    useMeasure<HTMLDivElement>();

  const isInAmountEmpty = useMemo(
    () => swapState?.inAmountInput.error instanceof EmptyAmountError,
    [swapState?.inAmountInput.error]
  );

  const isLoading = useMemo(
    () =>
      swapState?.isLoadingNetworkFee ||
      swapState?.isQuoteLoading ||
      swapState?.inAmountInput.isTyping,
    [
      swapState?.inAmountInput.isTyping,
      swapState?.isLoadingNetworkFee,
      swapState?.isQuoteLoading,
    ]
  );

  const priceImpact = useMemo(
    () => swapState?.quote?.priceImpactTokenOut,
    [swapState?.quote?.priceImpactTokenOut]
  );

  const { data: toAssetFiatValue, isLoading: isLoadingToAssetFiatValue } =
    api.edge.assets.getAssetPrice.useQuery({
      coinMinimalDenom: swapState?.toAsset?.coinDenom ?? queryToFallbackDenom,
    });

  return (
    <div className="flex w-full">
      <Disclosure>
        {({ open, close }) => (
          <div
            className="flex w-full flex-col transition-all"
            style={{
              height: open ? 301 + swapRouteHeight : 48,
            }}
          >
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
                {swapState?.fromAsset?.coinDenom} price ≈{" "}
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
                  : "0"}{" "}
              </span>
              <span
                className={classNames("absolute transition-opacity", {
                  "opacity-100": open,
                  "opacity-0": !open,
                })}
              >
                Trade Details
              </span>
              <div
                className={classNames(
                  "absolute right-0 flex items-center gap-2 transition-opacity",
                  { "opacity-0": !isLoading }
                )}
              >
                <Spinner className="!h-6 !w-6 text-wosmongton-500" />
                <span className="body2 text-osmoverse-400">
                  Estimating fees
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
                  ~${formatPretty(swapState?.totalFee ?? new Dec(0))} fees
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
                left="Expected rate"
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
                left="Price impact"
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
                left={`Swap fees (${swapState?.quote?.swapFee})`}
                right={
                  <span>
                    <span className="text-osmoverse-100">
                      ~
                      {formatPretty(
                        swapState?.tokenInFeeAmountFiatValue ?? new Dec(0)
                      )}
                    </span>{" "}
                    (
                    {formatPretty(
                      swapState?.tokenInFeeAmountFiatValue ?? new Dec(0)
                    )}{" "}
                    USDC)
                  </span>
                }
              />
              <hr className="my-2 w-full text-osmoverse-700" />
              <RecapRow
                left="Receive (estimated)"
                right={
                  <span className="inline-flex items-center gap-1">
                    {swapState?.quote?.amount && (
                      <span className="text-osmoverse-100">
                        {formatPretty(swapState?.quote?.amount)}
                      </span>
                    )}{" "}
                    {!isLoadingToAssetFiatValue && (
                      <>(~ {formatPretty(toAssetFiatValue ?? new Dec(0))})</>
                    )}
                  </span>
                }
              />
              <span className="subtitle1 py-3 text-white-full">
                More details
              </span>
              <RecapRow
                left="Slippage tolerance"
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
                              percentage: slippageConfig.slippage.toString(),
                              page: "Swap Page",
                            },
                          ]);
                        }}
                      />
                    ))}
                    <div
                      className={classNames(
                        "flex w-fit items-center justify-center overflow-hidden rounded-3xl py-1.5 px-2 text-center transition-colors hover:bg-osmoverse-825",
                        { "bg-osmoverse-825": slippageConfig?.isManualSlippage }
                      )}
                    >
                      <AutosizeInput
                        type="number"
                        minWidth={30}
                        placeholder="Custom"
                        className="w-fit bg-transparent px-0"
                        inputClassName="!bg-transparent text-center placeholder:text-osmoverse-300 w-[30px]"
                        value={slippageConfig?.manualSlippageStr}
                        onFocus={() =>
                          slippageConfig?.setIsManualSlippage(true)
                        }
                        autoFocus={slippageConfig?.isManualSlippage}
                        onChange={(e) => {
                          if (e.target.value.trim() === "") {
                            slippageConfig?.setManualSlippage("0");
                          } else {
                            slippageConfig?.setManualSlippage(e.target.value);
                          }

                          logEvent([
                            EventName.Swap.slippageToleranceSet,
                            {
                              fromToken: swapState?.fromAsset?.coinDenom,
                              toToken: swapState?.toAsset?.coinDenom,
                              // isOnHome: page === "Swap Page",
                              isOnHome: true,
                              percentage: slippageConfig?.slippage.toString(),
                              page: "Swap Page",
                            },
                          ]);
                        }}
                      />
                      <span>%</span>
                    </div>
                  </div>
                }
              />
              <div ref={swapRouteRef} className="flex w-full">
                <RecapRow
                  left="Swap route"
                  className="!h-auto flex-col !items-start gap-2.5"
                  right={
                    <div ref={ref} className="flex w-full flex-col gap-2">
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
        )}
      </Disclosure>
    </div>
  );
};

function Closer({
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
