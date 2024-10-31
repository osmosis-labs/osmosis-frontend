import { Transition } from "@headlessui/react";
import { PricePretty } from "@keplr-wallet/unit";
import { Dec, RatePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import {
  ChartPortfolioOverTimeResponse,
  Range,
} from "@osmosis-labs/server/src/queries/complex/portfolio/portfolio";
import classNames from "classnames";
import dayjs from "dayjs";
import { AreaData, Time } from "lightweight-charts";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useState } from "react";
import { useMemo } from "react";
import { useLocalStorage } from "react-use";
import { useShallow } from "zustand/react/shallow";

import { Icon } from "~/components/assets";
import { CreditCardIcon } from "~/components/assets/credit-card-icon";
import {
  PortfolioHistoricalChart,
  PortfolioHistoricalChartMinimized,
} from "~/components/complex/portfolio/historical-chart";
import { PortfolioPerformance } from "~/components/complex/portfolio/performance";
import { DataPoint } from "~/components/complex/portfolio/types";
import { SkeletonLoader } from "~/components/loaders/skeleton-loader";
import { CustomClasses } from "~/components/types";
import { Button } from "~/components/ui/button";
import {
  Breakpoint,
  useTranslation,
  useWalletSelect,
  useWindowSize,
} from "~/hooks";
import { useBridgeStore } from "~/hooks/bridge";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

const CHART_CONTAINER_HEIGHT = 468;

const calculatePortfolioPerformance = (
  data: ChartPortfolioOverTimeResponse[] | undefined,
  dataPoint: DataPoint
): {
  selectedPercentageRatePretty: RatePretty;
  selectedDifferencePricePretty: PricePretty;
  totalPriceChange: number;
} => {
  // Check if all values are 0, for instance if a user created a new wallet and has no transactions
  const hasAllZeroValues = data?.every((point) => point.value === 0);
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
      totalPriceChange: 0,
    };
  }

  const openingPrice = data?.[0]?.value;
  const openingPriceWithFallback = !openingPrice ? 1 : openingPrice; // handle first value being 0 or undefined
  const selectedDifference = (dataPoint?.value ?? 0) - openingPriceWithFallback;
  const selectedPercentage = selectedDifference / openingPriceWithFallback;
  const selectedPercentageRatePretty = new RatePretty(
    new Dec(selectedPercentage)
  );

  const selectedDifferencePricePretty = new PricePretty(
    DEFAULT_VS_CURRENCY,
    new Dec(selectedDifference)
  );

  const closingPrice = data?.[data.length - 1]?.value;
  const closingPriceWithFallback = !closingPrice ? 1 : closingPrice; // handle last value being 0 or undefined

  const totalPriceChange = closingPriceWithFallback - openingPriceWithFallback;

  return {
    selectedPercentageRatePretty,
    selectedDifferencePricePretty,
    totalPriceChange,
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

export const AssetsOverview: FunctionComponent<
  {
    totalValue?: PricePretty;
    isTotalValueFetched?: boolean;
  } & CustomClasses
> = observer(({ totalValue, isTotalValueFetched }) => {
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const { t } = useTranslation();
  const { startBridge, fiatRampSelection } = useBridgeStore(
    useShallow((state) => ({
      startBridge: state.startBridge,
      fiatRampSelection: state.fiatRampSelection,
    }))
  );
  const { isLoading: isWalletLoading } = useWalletSelect();
  const { isMobile, width } = useWindowSize();

  const address = wallet?.address ?? "";

  const [showDate, setShowDate] = useState(false);

  const [dataPoint, setDataPoint] = useState<DataPoint>({
    time: dayjs().unix() as Time,
    value: undefined,
  });

  const [range, setRange] = useState<Range>("1d");

  const {
    data: portfolioOverTimeData,
    isFetched: isPortfolioOverTimeDataIsFetched,
    error,
  } = api.local.portfolio.getPortfolioOverTime.useQuery(
    {
      address,
      range,
    },
    {
      enabled: Boolean(wallet?.isWalletConnected && wallet?.address),
      onSuccess: (data) => {
        if (data && data.length > 0) {
          const lastDataPoint = data[data.length - 1];
          setDataPoint({
            time: timeToLocal(lastDataPoint.time) as Time,
            value: lastDataPoint.value,
          });
        }
      },
    }
  );

  const { selectedDifferencePricePretty, selectedPercentageRatePretty } =
    calculatePortfolioPerformance(portfolioOverTimeData, dataPoint);

  const formattedDate =
    dataPoint.time && typeof dataPoint.time === "number"
      ? dayjs(dataPoint.time * 1000).format(
          range === "1d" || range === "7d" || range === "1mo" ? "lll" : "ll"
        )
      : undefined;

  const totalDisplayValue =
    dataPoint.value !== undefined
      ? new PricePretty(DEFAULT_VS_CURRENCY, new Dec(dataPoint.value))
      : totalValue?.toString();

  const [isChartMinimized_, setIsChartMinimized] = useLocalStorage(
    "is-portfolio-chart-minimized",
    true
  );
  const isChartMinimized = isChartMinimized_ || width < Breakpoint.lg;

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
      <header className="flex justify-between">
        <div className="mr-6 flex flex-col">
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
              <h4>{totalDisplayValue?.toString()}</h4>
            ) : (
              <h3>{totalDisplayValue?.toString()}</h3>
            )}
          </SkeletonLoader>
          <SkeletonLoader
            className={classNames(
              isPortfolioOverTimeDataIsFetched ? "mt-2" : "mt-2 h-6 w-16"
            )}
            isLoaded={isPortfolioOverTimeDataIsFetched}
          >
            <PortfolioPerformance
              selectedDifference={selectedDifferencePricePretty}
              selectedPercentage={selectedPercentageRatePretty}
              formattedDate={formattedDate}
              showDate={showDate}
            />
          </SkeletonLoader>
          <div className="flex items-center gap-2 pt-6 lg:gap-1">
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
              disabled={totalValue && totalValue?.toDec()?.isZero()}
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
            "mt-auto flex h-[156px] w-full flex-col items-end lg:hidden",
            "w-full max-w-[344px]",
            "xl:w-[383px] xl:max-w-[383px]",
            "lg:w-[312px] lg:max-w-[312px]"
          )}
          as="div"
        >
          <button
            className={classNames(
              "group relative my-3 flex h-full w-full cursor-pointer overflow-clip rounded-[1.25rem] bg-opacity-10 p-0 hover:bg-osmoverse-900"
            )}
            onClick={() => setIsChartMinimized(false)}
          >
            <PortfolioHistoricalChartMinimized
              data={localizedPortfolioOverTimeData as AreaData<Time>[]}
              isFetched={isPortfolioOverTimeDataIsFetched}
              error={error}
            />
            <div className="absolute z-50 h-full w-full">
              <span className="body1 absolute top-2 right-3 text-osmoverse-400">
                {getActiveRangeDateText(range)}
              </span>
              <Icon
                id="resize-expand"
                className="absolute bottom-4 right-4 text-osmoverse-200 opacity-0 transition-opacity duration-100 group-hover:opacity-100"
                height={16}
                width={16}
              />
            </div>
          </button>
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
        className="absolute top-full w-full lg:hidden"
      >
        <PortfolioHistoricalChart
          setIsChartMinimized={setIsChartMinimized}
          data={localizedPortfolioOverTimeData as AreaData<Time>[]}
          isFetched={isPortfolioOverTimeDataIsFetched}
          setDataPoint={setDataPoint}
          range={range}
          setRange={setRange}
          error={error}
          setShowDate={setShowDate}
          resetDataPoint={() => {
            if (totalValue) {
              setDataPoint({
                time: dayjs().unix() as Time,
                value: +totalValue?.toDec()?.toString(),
              });
              setShowDate(false);
            }
          }}
        />
      </Transition>
    </div>
  );
});
