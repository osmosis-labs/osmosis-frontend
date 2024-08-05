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
import { PortfolioHistoricalChart } from "~/components/complex/portfolio/historical-chart";
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

const initialDataPoint = {
  time: dayjs().unix() as Time,
  value: 0,
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
  const { startBridge, fiatRampSelection } = useBridge();
  const { isLoading: isWalletLoading } = useWalletSelect();
  const { isMobile } = useWindowSize();
  const formatDate = useFormatDate();

  const address = wallet?.address ?? "";

  const [dataPoint, setDataPoint] = useState<{
    time?: Time;
    value?: number;
  }>(initialDataPoint);

  console.log("dataPoint: ", dataPoint);

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

  if (isWalletLoading) return null;

  const totalDisplayValue =
    new PricePretty(DEFAULT_VS_CURRENCY, new Dec(dataPoint.value || 0)) ||
    totalValue?.toString();

  return (
    <div className="flex w-full flex-col gap-4">
      {wallet && wallet.isWalletConnected && wallet.address ? (
        <>
          <div className="flex flex-col gap-2">
            <span className="body1 md:caption text-osmoverse-300">
              {t("assets.totalBalance")}
            </span>

            <SkeletonLoader
              className={classNames(isTotalValueFetched ? null : "h-14 w-48")}
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
              />
            </SkeletonLoader>
          </div>
          <div className="flex items-center gap-3 py-3">
            <Button
              className="flex items-center gap-2 !rounded-full"
              onClick={() => startBridge({ direction: "deposit" })}
            >
              <Icon id="deposit" className=" h-4 w-4" height={16} width={16} />
              <div className="subtitle1">{t("assets.table.depositButton")}</div>
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

          <PortfolioHistoricalChart
            data={portfolioOverTimeData as AreaData<Time>[]}
            isFetched={isPortfolioOverTimeDataIsFetched}
            setDataPoint={setDataPoint}
            range={range}
            setRange={setRange}
            totalPriceChange={totalPriceChange}
            error={error}
            totalValue={totalValue}
            resetDataPoint={() => setDataPoint(initialDataPoint)}
          />
        </>
      ) : (
        <GetStartedWithOsmosis />
      )}
    </div>
  );
});
