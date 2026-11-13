import { Transition } from "@headlessui/react";
import type {
  ChartPortfolioOverTimeResponse,
  Range,
} from "@osmosis-labs/server";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { PricePretty } from "@osmosis-labs/unit";
import { Dec, RatePretty } from "@osmosis-labs/unit";
import classNames from "classnames";
import dayjs from "dayjs";
import { AreaData, Time } from "lightweight-charts";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import { useMemo } from "react";
import { useLocalStorage } from "react-use";
import { useShallow } from "zustand/react/shallow";

import { Icon } from "~/components/assets";
import { CreditCardIcon } from "~/components/assets/credit-card-icon";
import {
  PortfolioHistoricalChart,
  PortfolioHistoricalChartMinimized,
  PortfolioHistoricalChartUnavailable,
} from "~/components/complex/portfolio/historical-chart";
import { PortfolioPerformance } from "~/components/complex/portfolio/performance";
import { DataPoint } from "~/components/complex/portfolio/types";
import { SkeletonLoader } from "~/components/loaders/skeleton-loader";
import { PrivateText } from "~/components/privacy";
import { Tooltip } from "~/components/tooltip";
import { CustomClasses } from "~/components/types";
import { Button } from "~/components/ui/button";
import { useTranslation, useWalletSelect, useWindowSize } from "~/hooks";
import { useBridgeStore } from "~/hooks/bridge";
import { useWallet } from "~/hooks/use-wallet";
import { api } from "~/utils/trpc";

const CHART_CONTAINER_HEIGHT = 468;

/** Returns undefined when there is no trustworthy baseline, so no change is shown. */
const calculatePortfolioPerformance = (
  data: ChartPortfolioOverTimeResponse[] | undefined,
  dataPoint: DataPoint
):
  | {
      selectedPercentageRatePretty: RatePretty;
      selectedDifferencePricePretty: PricePretty;
    }
  | undefined => {
  // No history (errored, loading or empty): never invent a change
  if (!data || data.length === 0) return undefined;

  // Check if all values are 0, for instance if a user created a new wallet and has no transactions
  const hasAllZeroValues = data.every((point) => point.value === 0);
  if (
    hasAllZeroValues &&
    (dataPoint?.value === 0 || dataPoint?.value === undefined)
  ) {
    return {
      selectedPercentageRatePretty: new RatePretty(new Dec(0)),
      selectedDifferencePricePretty: new PricePretty(
        DEFAULT_VS_CURRENCY,
        new Dec(0)
      ),
    };
  }

  const openingPrice = data[0]?.value;
  // A missing or zero opening value has no meaningful percentage change
  if (!openingPrice || dataPoint?.value === undefined) return undefined;

  const selectedDifference = dataPoint.value - openingPrice;
  const selectedPercentage = selectedDifference / openingPrice;

  return {
    selectedPercentageRatePretty: new RatePretty(new Dec(selectedPercentage)),
    selectedDifferencePricePretty: new PricePretty(
      DEFAULT_VS_CURRENCY,
      new Dec(selectedDifference)
    ),
  };
};

const timeToLocal = (originalTime: number) => {
  const d = new Date(originalTime * 1000);
  return (
    Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
      d.getMilliseconds()
    ) / 1000
  );
};

const getLocalizedPortfolioOverTimeData = (
  portfolioOverTimeData: ChartPortfolioOverTimeResponse[] | undefined
) => {
  if (!portfolioOverTimeData) return undefined;

  // If there is only one data point, add 15 more points to the array to create a more accurate line
  if (portfolioOverTimeData.length <= 1 && portfolioOverTimeData[0]) {
    const baseDataPoint = portfolioOverTimeData[0];
    const baseTime =
      baseDataPoint.value === 0 ? Date.now() / 1000 : baseDataPoint.time;
    const additionalPoints = Array.from({ length: 15 }, (_, index) => ({
      time: baseTime - 86400 * (index + 1),
      value: baseDataPoint.value,
    }));
    return [...additionalPoints, baseDataPoint]
      .sort((a, b) => a.time - b.time)
      .map((data) => ({
        time: timeToLocal(data.time),
        value: data.value,
      }));
  }

  return portfolioOverTimeData.map((data) => ({
    time: timeToLocal(data.time),
    value: data.value,
  }));
};

function getLastDataPoint(data: ChartPortfolioOverTimeResponse[] | undefined) {
  if (!data) {
    return {
      time: dayjs().unix() as Time,
      value: undefined,
    };
  }
  const lastDataPoint = data[data.length - 1];
  return {
    time: timeToLocal(lastDataPoint.time) as Time,
    value: lastDataPoint.value,
  };
}

export const AssetsOverview: FunctionComponent<
  {
    totalValue?: PricePretty;
    /** A held coin couldn't be priced, so the total is unknown rather than its sum. */
    isTotalValueUnknown?: boolean;
    /** The unpriced coins behind `isTotalValueUnknown`; `totalValue` sums the priced ones. */
    unpricedAssets?: { coinMinimalDenom: string; symbol?: string }[];
    isTotalValueFetched?: boolean;
  } & CustomClasses
> = ({
  totalValue,
  isTotalValueUnknown = false,
  unpricedAssets = [],
  isTotalValueFetched,
}) => {
  const { t } = useTranslation();
  const { startBridge, fiatRampSelection } = useBridgeStore(
    useShallow((state) => ({
      startBridge: state.startBridge,
      fiatRampSelection: state.fiatRampSelection,
    }))
  );
  const { isLoading: isWalletLoading } = useWalletSelect();
  const { isMobile } = useWindowSize();

  const { address: walletAddress, isWalletConnected } = useWallet();
  const address = walletAddress ?? "";

  const [showDate, setShowDate] = useState(false);

  const [dataPoint, setDataPoint] = useState<DataPoint>({
    time: dayjs().unix() as Time,
    value: undefined,
  });

  const [range, setRange] = useState<Range>("7d");

  // Create refs to always have access to latest values
  const portfolioDataRef = useRef<ChartPortfolioOverTimeResponse[] | undefined>(
    undefined
  );
  const totalValueRef = useRef<PricePretty | undefined>(undefined);

  const {
    data: portfolioOverTimeData,
    isFetched: isPortfolioOverTimeDataIsFetched,
    error,
    isFetching: isPortfolioOverTimeFetching,
    refetch: refetchPortfolioOverTime,
  } = api.local.portfolio.getPortfolioOverTime.useQuery(
    {
      address,
      range,
    },
    {
      enabled: Boolean(isWalletConnected && walletAddress),
      select: (data) => {
        if (totalValue && !isTotalValueUnknown && data.length > 0) {
          data[data.length - 1].value = +totalValue.toDec().toString();
        }
        return data;
      },
    }
  );

  useEffect(() => {
    // Set the data point to the last data point of the portfolio over time data
    if (portfolioOverTimeData && portfolioOverTimeData.length > 0) {
      // eslint-disable-next-line hooks-compat/set-state-in-effect -- moves the chart cursor to the latest point when data arrives; hovering moves it afterwards
      setDataPoint(getLastDataPoint(portfolioOverTimeData));
    }

    // Update refs whenever data changes
    portfolioDataRef.current = portfolioOverTimeData;
  }, [portfolioOverTimeData]);

  useEffect(() => {
    totalValueRef.current = totalValue;
  }, [totalValue]);

  const performance = calculatePortfolioPerformance(
    portfolioOverTimeData,
    dataPoint
  );

  const formattedDate =
    dataPoint.time && typeof dataPoint.time === "number"
      ? dayjs(dataPoint.time * 1000).format(
          range === "1d" || range === "7d" || range === "1mo" ? "lll" : "ll"
        )
      : undefined;

  // While not hovering a past point, an unknown total shows only what is priced:
  // the priced sum with a partial label, or "unavailable" if nothing is priced.
  const isPartialTotal =
    isTotalValueUnknown &&
    !showDate &&
    Boolean(totalValue?.toDec().isPositive());
  const totalDisplayValue =
    isTotalValueUnknown && !showDate
      ? isPartialTotal
        ? totalValue?.toString()
        : t("portfolio.pricesUnavailable")
      : dataPoint.value !== undefined
        ? new PricePretty(DEFAULT_VS_CURRENCY, new Dec(dataPoint.value))
        : totalValue?.toString();

  const [isChartMinimized_, setIsChartMinimized] = useLocalStorage(
    "is-portfolio-chart-minimized",
    true
  );
  // With no history to draw, the chart shrinks to a compact card. This is derived
  // state only: the saved preference is never written because of an error.
  const isHistoryError = Boolean(error) && !portfolioOverTimeData;
  const isChartMinimized = isChartMinimized_ || isHistoryError;

  const localizedPortfolioOverTimeData = useMemo(
    () => getLocalizedPortfolioOverTimeData(portfolioOverTimeData),
    [portfolioOverTimeData]
  );

  const getActiveRangeDateText = (range: Range) => {
    switch (range) {
      case "1d":
        return t("portfolio.last24h");
      case "7d":
        return t("portfolio.last7d");
      case "1mo":
        return t("portfolio.last30d");
      case "1y":
        return t("portfolio.last1y");
      case "all":
        return t("portfolio.allTime");
      default:
        return t("portfolio.last30d");
    }
  };

  return isWalletLoading ? null : (
    <div
      className={classNames(
        "relative flex w-full flex-col transition-all duration-[250ms]",
        { "delay-[250ms]": isChartMinimized }
      )}
      style={{
        marginBottom: isChartMinimized ? "" : `${CHART_CONTAINER_HEIGHT}px`,
      }}
    >
      {/* Up to lg the left column dissolves into a grid so the minimised chart
          takes the width left beside the balance and the buttons span the row
          below. Side by side, the buttons and a fixed-width card overflow. */}
      <header className="flex justify-between lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-x-4">
        <div className="mr-6 flex flex-col lg:contents">
          <div className="flex flex-col lg:col-start-1 lg:row-start-1">
            <span className="body1 text-osmoverse-300">
              {t("assets.totalBalance")}
            </span>
            <SkeletonLoader
              className={classNames(
                `mt-2 ${isTotalValueFetched ? "" : "h-14 w-48"}`
              )}
              isLoaded={isTotalValueFetched || totalDisplayValue === undefined}
            >
              {isMobile ? (
                <h4>
                  <PrivateText text={totalDisplayValue?.toString() ?? ""} />
                </h4>
              ) : (
                <h3>
                  <PrivateText text={totalDisplayValue?.toString() ?? ""} />
                </h3>
              )}
            </SkeletonLoader>
            <SkeletonLoader
              className={classNames(
                isPortfolioOverTimeDataIsFetched ? "mt-2" : "mt-2 h-6 w-16"
              )}
              isLoaded={isPortfolioOverTimeDataIsFetched}
            >
              {performance && (
                <PortfolioPerformance
                  selectedDifference={performance.selectedDifferencePricePretty}
                  selectedPercentage={performance.selectedPercentageRatePretty}
                  formattedDate={formattedDate}
                  showDate={showDate}
                />
              )}
            </SkeletonLoader>
            {isPartialTotal && unpricedAssets.length > 0 && (
              <Tooltip
                content={t("portfolio.unpricedAssetsTooltip", {
                  assets: unpricedAssets
                    .map((asset) => asset.symbol ?? asset.coinMinimalDenom)
                    .join(", "),
                })}
              >
                <span className="body2 mt-1 w-fit cursor-help text-osmoverse-300">
                  {t(
                    unpricedAssets.length === 1
                      ? "portfolio.unpricedAssets"
                      : "portfolio.unpricedAssets_plural",
                    { count: unpricedAssets.length.toString() }
                  )}
                </span>
              </Tooltip>
            )}
          </div>
          <div className="flex items-center gap-2 pt-6 lg:col-span-2 lg:row-start-2 lg:gap-1">
            <Button
              className="flex h-[48px] items-center gap-2 !rounded-full md:gap-1"
              size={isMobile ? "xsm" : undefined}
              onClick={() => startBridge({ direction: "deposit" })}
            >
              <Icon
                id="deposit"
                height={isMobile ? 12 : 16}
                width={isMobile ? 12 : 16}
              />
              <div className="subtitle1 md:subtitle2">
                {t("assets.table.depositButton")}
              </div>
            </Button>
            <Button
              className="group flex h-[48px] items-center gap-2 !rounded-full !bg-osmoverse-825 text-wosmongton-200 hover:bg-gradient-positive hover:text-black hover:shadow-[0px_0px_30px_4px_rgba(57,255,219,0.2)] md:gap-1"
              size={isMobile ? "xsm" : undefined}
              onClick={fiatRampSelection}
            >
              <CreditCardIcon
                isAnimated
                classes={{
                  container: isMobile ? "!h-4 !w-4" : undefined,
                  backCard: "group-hover:stroke-[2]",
                  frontCard:
                    "group-hover:fill-[#71B5EB] group-hover:stroke-[2]",
                }}
              />
              <span className="subtitle1 md:subtitle2">
                {t("portfolio.buy")}
              </span>
            </Button>
            <Button
              className="flex h-[48px] items-center gap-2 !rounded-full !bg-osmoverse-825 text-wosmongton-200 hover:!bg-osmoverse-800 md:gap-1"
              size={isMobile ? "xsm" : undefined}
              onClick={() => startBridge({ direction: "withdraw" })}
              disabled={!isTotalValueUnknown && totalValue?.toDec()?.isZero()}
            >
              <Icon
                id="withdraw"
                height={isMobile ? 12 : 16}
                width={isMobile ? 12 : 16}
              />
              <div className="subtitle1 md:subtitle2">
                {t("assets.table.withdrawButton")}
              </div>
            </Button>
          </div>
        </div>
        <Transition
          show={isChartMinimized}
          enter="transition ease-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition ease-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className={classNames(
            "mt-auto flex h-[156px] w-full flex-col items-end",
            "w-full max-w-[344px]",
            "xl:w-[383px] xl:max-w-[383px]",
            "lg:col-start-2 lg:row-start-1 lg:mt-0 lg:h-auto lg:min-h-[96px] lg:w-full lg:max-w-none lg:self-stretch"
          )}
          as="div"
        >
          {isHistoryError ? (
            <PortfolioHistoricalChartUnavailable
              isRetrying={isPortfolioOverTimeFetching}
              onRetry={() => void refetchPortfolioOverTime()}
            />
          ) : (
            <button
              className={classNames(
                "group relative my-3 flex h-full w-full cursor-pointer overflow-clip rounded-[1.25rem] bg-opacity-10 p-0 hover:bg-osmoverse-900 lg:my-0"
              )}
              onClick={() => setIsChartMinimized(false)}
            >
              <PortfolioHistoricalChartMinimized
                data={localizedPortfolioOverTimeData as AreaData<Time>[]}
                isFetched={isPortfolioOverTimeDataIsFetched}
              />
              <div className="absolute z-50 h-full w-full">
                <span className="body1 md:caption absolute top-2 right-3 text-osmoverse-400 md:top-1 md:right-2">
                  {getActiveRangeDateText(range)}
                </span>
                {/* Touch has no hover, so the expand hint always shows up to lg */}
                <Icon
                  id="resize-expand"
                  className="absolute bottom-4 right-4 text-osmoverse-200 opacity-0 transition-opacity duration-100 group-hover:opacity-100 lg:opacity-100 md:bottom-2 md:right-2"
                  height={16}
                  width={16}
                />
              </div>
            </button>
          )}
        </Transition>
      </header>

      <Transition
        show={!isChartMinimized}
        enter="ease-out duration-500 transition-opacity delay-[250ms]"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-out duration-[250ms] transition-opacity"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        as="div"
        unmount={false}
        appear={true}
        className="absolute top-full w-full"
      >
        <PortfolioHistoricalChart
          setIsChartMinimized={setIsChartMinimized}
          data={localizedPortfolioOverTimeData as AreaData<Time>[]}
          isFetched={isPortfolioOverTimeDataIsFetched}
          setDataPoint={setDataPoint}
          range={range}
          setRange={setRange}
          setShowDate={setShowDate}
          resetDataPoint={() => {
            // Use current ref values to ensure we have the latest data
            const currentPortfolioData = portfolioDataRef.current;
            const currentTotalValue = totalValueRef.current;

            if (currentPortfolioData && currentPortfolioData.length > 0) {
              setDataPoint(getLastDataPoint(currentPortfolioData));
            } else if (currentTotalValue) {
              setDataPoint({
                time: dayjs().unix() as Time,
                value: +currentTotalValue.toDec().toString(),
              });
            } else {
              setDataPoint({
                time: dayjs().unix() as Time,
                value: undefined,
              });
            }
            setShowDate(false);
          }}
        />
      </Transition>
    </div>
  );
};
