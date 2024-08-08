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
import { Fragment, FunctionComponent, useState } from "react";

import { Icon } from "~/components/assets";
import { CreditCardIcon } from "~/components/assets/credit-card-icon";
import { GetStartedWithOsmosis } from "~/components/complex/portfolio/get-started-with-osmosis";
import {
  PortfolioHistoricalChart,
  PortfolioHistoricalChartMinimized,
} from "~/components/complex/portfolio/historical-chart";
import { PortfolioPerformance } from "~/components/complex/portfolio/performance";
import { DataPoint } from "~/components/complex/portfolio/types";
import { SkeletonLoader } from "~/components/loaders/skeleton-loader";
import { useFormatDate } from "~/components/transactions/transaction-utils";
import { CustomClasses } from "~/components/types";
import { IconButton } from "~/components/ui/button";
import { Button } from "~/components/ui/button";
import { useTranslation, useWalletSelect, useWindowSize } from "~/hooks";
import { useBridge } from "~/hooks/bridge";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

const calculatePortfolioPerformance = (
  data: ChartPortfolioOverTimeResponse[] | undefined,
  dataPoint: DataPoint
): {
  selectedPercentageRatePretty: RatePretty;
  selectedDifferencePricePretty: PricePretty;
  totalPriceChange: number;
} => {
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

export const AssetsOverview: FunctionComponent<
  {
    totalValue: PricePretty;
    isTotalValueFetched?: boolean;
    isChartMinimized: boolean;
    setIsChartMinimized: React.Dispatch<React.SetStateAction<boolean>>;
  } & CustomClasses
> = observer(
  ({
    totalValue,
    isTotalValueFetched,
    isChartMinimized,
    setIsChartMinimized,
  }) => {
    const { accountStore } = useStore();
    const wallet = accountStore.getWallet(accountStore.osmosisChainId);
    const { t } = useTranslation();
    const { startBridge, fiatRampSelection } = useBridge();
    const { isLoading: isWalletLoading } = useWalletSelect();
    const { isMobile } = useWindowSize();
    const formatDate = useFormatDate();

    const address = wallet?.address ?? "";

    const [showDate, setShowDate] = useState(false);

    const [dataPoint, setDataPoint] = useState<DataPoint>({
      time: dayjs().unix() as Time,
      value: 0,
    });

    const [range, setRange] = useState<Range>("1mo");

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
            const lastItem = data[data.length - 1];
            setDataPoint({
              time: lastItem.time as Time,
              value: lastItem.value,
            });
          }
        },
      }
    );

    const {
      selectedDifferencePricePretty,
      selectedPercentageRatePretty,
      totalPriceChange,
    } = calculatePortfolioPerformance(portfolioOverTimeData, dataPoint);

    const formattedDate = dataPoint.time
      ? formatDate(dayjs.unix(dataPoint.time as number).format("YYYY-MM-DD"))
      : undefined;

    const totalDisplayValue =
      new PricePretty(DEFAULT_VS_CURRENCY, new Dec(dataPoint.value || 0)) ||
      totalValue?.toString();

    const [isHovering, setIsHovering] = useState(false);

    if (isWalletLoading) return null;
    return (
      <div className="flex w-full flex-col gap-4">
        {wallet && wallet.isWalletConnected && wallet.address ? (
          <>
            <div className="flex justify-between">
              <div className="flex flex-col gap-2">
                <span className="body1 md:caption text-osmoverse-300">
                  {t("assets.totalBalance")}
                </span>

                <SkeletonLoader
                  className={classNames(
                    isTotalValueFetched ? null : "h-14 w-48"
                  )}
                  isLoaded={isTotalValueFetched}
                >
                  {isMobile ? (
                    <h5>{totalDisplayValue?.toString()}</h5>
                  ) : (
                    <h3>{totalDisplayValue?.toString()}</h3>
                  )}
                </SkeletonLoader>
                <SkeletonLoader
                  className={classNames(
                    isPortfolioOverTimeDataIsFetched ? null : "h-6 w-16"
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
                <div className="flex items-center gap-3 py-3">
                  <Button
                    className="flex items-center gap-2 !rounded-full"
                    onClick={() => startBridge({ direction: "deposit" })}
                  >
                    <Icon
                      id="deposit"
                      className=" h-4 w-4"
                      height={16}
                      width={16}
                    />
                    <div className="subtitle1">
                      {t("assets.table.depositButton")}
                    </div>
                  </Button>
                  <Button
                    className="group flex items-center gap-2 !rounded-full !bg-osmoverse-825 text-wosmongton-200 hover:bg-gradient-positive hover:text-black hover:shadow-[0px_0px_30px_4px_rgba(57,255,219,0.2)]"
                    onClick={fiatRampSelection}
                  >
                    <CreditCardIcon
                      isAnimated
                      classes={{
                        backCard: "group-hover:stroke-[2]",
                        frontCard:
                          "group-hover:fill-[#71B5EB] group-hover:stroke-[2]",
                      }}
                    />
                    <span className="subtitle1">{t("portfolio.buy")}</span>
                  </Button>
                  <Button
                    className="flex items-center gap-2 !rounded-full !bg-osmoverse-825 text-wosmongton-200"
                    onClick={() => startBridge({ direction: "withdraw" })}
                    disabled={totalValue && totalValue.toDec().isZero()}
                  >
                    <Icon id="withdraw" height={16} width={16} />
                    <div className="subtitle1">
                      {t("assets.table.withdrawButton")}
                    </div>
                  </Button>
                </div>
              </div>
              <Transition
                show={isChartMinimized}
                enter="transition ease-out duration-300"
                enterFrom="opacity-0 translate-x-full"
                enterTo="opacity-100 translate-x-0"
                leave="transition ease-out duration-300"
                leaveFrom="opacity-100 translate-x-0"
                leaveTo="opacity-0 translate-x-full"
              >
                <div
                  className="group relative h-full w-[320px] rounded-[20px] bg-osmoverse-850 bg-opacity-10"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <div className="absolute top-3 left-3">
                    <PortfolioPerformance
                      selectedDifference={selectedDifferencePricePretty}
                      selectedPercentage={selectedPercentageRatePretty}
                      formattedDate={formattedDate}
                      showDate={showDate}
                    />
                  </div>
                  <PortfolioHistoricalChartMinimized
                    showScales={false}
                    data={portfolioOverTimeData as AreaData<Time>[]}
                    isFetched={isPortfolioOverTimeDataIsFetched}
                    setDataPoint={setDataPoint}
                    totalPriceChange={totalPriceChange}
                    error={error}
                    setShowDate={setShowDate}
                    resetDataPoint={() => {
                      setDataPoint({
                        time: dayjs().unix() as Time,
                        value: +totalValue.toDec().toString(),
                      });
                      setShowDate(false);
                    }}
                  />
                  <Transition
                    show={isHovering}
                    enter="transition-opacity ease-out duration-100"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    as="div"
                  >
                    <IconButton
                      className="absolute bottom-2 right-2 z-50 bg-osmoverse-850 py-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-label="Open main menu dropdown"
                      icon={
                        <Icon
                          id="resize-expand"
                          className="text-osmoverse-200"
                          height={16}
                          width={16}
                        />
                      }
                      onClick={() => setIsChartMinimized(false)}
                    />
                  </Transition>
                </div>
              </Transition>
            </div>

            <Transition
              show={!isChartMinimized}
              enter="transition-all ease-out duration-300"
              enterFrom="h-0 opacity-0"
              enterTo="h-[400px] opacity-100"
              leave="transition-all ease-out duration-300"
              leaveFrom="h-[400px] opacity-100"
              leaveTo="h-0 opacity-0"
              as="div"
            >
              {(ref) => (
                <PortfolioHistoricalChart
                  isChartMinimized={isChartMinimized}
                  heightClassname="h-[400px]"
                  ref={ref}
                  setIsChartMinimized={setIsChartMinimized}
                  data={portfolioOverTimeData as AreaData<Time>[]}
                  isFetched={isPortfolioOverTimeDataIsFetched}
                  setDataPoint={setDataPoint}
                  range={range}
                  setRange={setRange}
                  totalPriceChange={totalPriceChange}
                  error={error}
                  setShowDate={setShowDate}
                  resetDataPoint={() => {
                    setDataPoint({
                      time: dayjs().unix() as Time,
                      value: +totalValue.toDec().toString(),
                    });
                    setShowDate(false);
                  }}
                />
              )}
            </Transition>
          </>
        ) : (
          <GetStartedWithOsmosis />
        )}
      </div>
    );
  }
);
