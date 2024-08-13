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
import { Button } from "~/components/ui/button";
import { useTranslation, useWalletSelect, useWindowSize } from "~/hooks";
import { useBridge } from "~/hooks/bridge";
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
  } & CustomClasses
> = observer(({ totalValue, isTotalValueFetched }) => {
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const { t } = useTranslation();
  const { isLoading: isWalletLoading } = useWalletSelect();
  const { startBridge, fiatRampSelection } = useBridge();
  const { isMobile } = useWindowSize();
  const formatDate = useFormatDate();

  const address = wallet?.address ?? "";

  const [showDate, setShowDate] = useState(false);

  const [dataPoint, setDataPoint] = useState<DataPoint>({
    time: dayjs().unix() as Time,
    value: 0,
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
          const lastItem = data[data.length - 1];
          setDataPoint({
            time: lastItem.time as Time,
            value: lastItem.value,
          });
        }
      },
    }
  );

  const { selectedDifferencePricePretty, selectedPercentageRatePretty } =
    calculatePortfolioPerformance(portfolioOverTimeData, dataPoint);

  const formattedDate = dataPoint.time
    ? formatDate(dayjs.unix(dataPoint.time as number).format("YYYY-MM-DD"))
    : undefined;

  const totalDisplayValue =
    new PricePretty(DEFAULT_VS_CURRENCY, new Dec(dataPoint.value || 0)) ||
    totalValue?.toString();

  const [isChartMinimized, setIsChartMinimized] = useState(true);

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
      {wallet && wallet.isWalletConnected && wallet.address ? (
        <>
          <header className="flex justify-between">
            <div className="mr-6 flex flex-col">
              <span className="body1 md:caption text-osmoverse-300">
                {t("assets.totalBalance")}
              </span>

              <SkeletonLoader
                className={classNames(
                  `mt-2 ${isTotalValueFetched ? "" : "h-14 w-48"}`
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
              <div className="flex items-center gap-3 pt-6">
                <Button
                  className="flex items-center gap-2 !rounded-full"
                  onClick={() => startBridge({ direction: "deposit" })}
                >
                  <Icon id="deposit" height={16} width={16} />
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
                  className="flex items-center gap-2 !rounded-full !bg-osmoverse-825 text-wosmongton-200 hover:!bg-osmoverse-800"
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
              enter="transition ease-out duration-500"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition ease-out duration-500"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              className="max-w-[20rem] grow"
              as="div"
            >
              <button
                className="group relative flex h-[12.5rem] w-full cursor-pointer flex-col overflow-hidden rounded-[1.25rem] bg-opacity-10 pt-3 hover:bg-osmoverse-900"
                onClick={() => setIsChartMinimized(false)}
              >
                <PortfolioHistoricalChartMinimized
                  data={portfolioOverTimeData as AreaData<Time>[]}
                  isFetched={isPortfolioOverTimeDataIsFetched}
                  error={error}
                />
                <div className="absolute z-50 h-full w-full">
                  <Icon
                    id="resize-expand"
                    className="absolute top-4 right-4 text-osmoverse-200 opacity-0 transition-opacity duration-100 group-hover:opacity-100"
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
            leaveTo=" opacity-0"
            as="div"
            unmount={false}
            appear={true}
            className="absolute top-full w-full"
          >
            <PortfolioHistoricalChart
              setIsChartMinimized={setIsChartMinimized}
              data={portfolioOverTimeData as AreaData<Time>[]}
              isFetched={isPortfolioOverTimeDataIsFetched}
              setDataPoint={setDataPoint}
              range={range}
              setRange={setRange}
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
          </Transition>
        </>
      ) : (
        <GetStartedWithOsmosis />
      )}
    </div>
  );
});
