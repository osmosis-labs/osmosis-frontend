import { Tab } from "@headlessui/react";
import { PricePretty } from "@keplr-wallet/unit";
import { Dec, RatePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { Range } from "@osmosis-labs/server/src/queries/complex/portfolio/portfolio";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent, useCallback, useState } from "react";

import { Icon } from "~/components/assets";
import { PriceChange } from "~/components/assets/price";
import { DataPoint } from "~/components/complex/portfolio/portfolio-page-types";
import { AssetBalancesTable } from "~/components/table/asset-balances";
import { useFormatDate } from "~/components/transactions/transaction-utils";
import {
  useDimension,
  useTranslation,
  useWalletSelect,
  useWindowSize,
} from "~/hooks";
import { useBridge } from "~/hooks/bridge";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { CreditCardIcon } from "../../assets/credit-card-icon";
import { Spinner } from "../../loaders";
import { SkeletonLoader } from "../../loaders/skeleton-loader";
import { RecentTransfers } from "../../transactions/recent-transfers";
import { CustomClasses } from "../../types";
import { Button } from "../../ui/button";
import { MyPoolsCardsGrid } from "../my-pools-card-grid";
import { MyPositionsSection } from "../my-positions-section";
import { PortfolioHistoricalChart } from "./portfolio-historical-chart";

export const PortfolioPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { bridgeAsset } = useBridge();
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const { isLoading: isWalletLoading } = useWalletSelect();

  const { data: totalValueData, isFetched: isTotalValueFetched } =
    api.edge.assets.getUserAssetsTotal.useQuery(
      {
        userOsmoAddress: wallet?.address ?? "",
      },
      {
        enabled: Boolean(wallet?.isWalletConnected && wallet?.address),
        select: ({ value }) => value,

        // expensive query
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );
  const userHasNoAssets = totalValueData && totalValueData.toDec().isZero();

  const [overviewRef, { height: overviewHeight }] =
    useDimension<HTMLDivElement>();
  const [tabsRef, { height: tabsHeight }] = useDimension<HTMLDivElement>();

  const onDeposit = useCallback(
    (coinMinimalDenom: string) => {
      bridgeAsset({ anyDenom: coinMinimalDenom, direction: "deposit" });
    },
    [bridgeAsset]
  );
  const onWithdraw = useCallback(
    (coinMinimalDenom: string) => {
      bridgeAsset({ anyDenom: coinMinimalDenom, direction: "withdraw" });
    },
    [bridgeAsset]
  );

  const address = wallet?.address ?? "";

  const [dataPoint, setDataPoint] = useState<DataPoint>({
    time: "0", // TODO set initial time
    value: 0,
  });

  const [range, setRange] = useState<Range>("1mo");

  const {
    data: portfolioOverTimeData,
    isFetched: portfolioOverTimeDataIsFetched,
  } = api.edge.portfolio.getPortfolioOverTime.useQuery(
    {
      address,
      range,
    },
    {
      enabled: Boolean(wallet?.isWalletConnected && wallet?.address),
    }
  );

  const firstValue = portfolioOverTimeData?.[1].value;

  const firstValueWithFallback = !firstValue ? 1 : firstValue; // handle first value being 0 or undefined

  const difference = (dataPoint?.value ?? 0) - firstValueWithFallback;

  const percentage = difference / firstValueWithFallback;

  const percentageRatePretty = new RatePretty(new Dec(percentage));

  const formatDate = useFormatDate();

  const differenceRatePretty = new PricePretty(
    DEFAULT_VS_CURRENCY,
    new Dec(difference)
  );

  return (
    <main className="mx-auto flex w-full max-w-container flex-col gap-8 bg-osmoverse-900 p-8 pt-4 md:gap-8 md:p-4">
      <section className="flex gap-5" ref={overviewRef}>
        <AssetsOverview
          totalValue={totalValueData}
          isTotalValueFetched={isTotalValueFetched}
          portfolioPerformance={
            <PortfolioPerformance
              value={differenceRatePretty}
              percentage={percentageRatePretty}
              date={formatDate(dataPoint.time as string)}
            />
          }
        />
      </section>

      <section>
        <PortfolioHistoricalChart
          data={portfolioOverTimeData}
          isFetched={portfolioOverTimeDataIsFetched}
          dataPoint={dataPoint}
          setDataPoint={setDataPoint}
          range={range}
          setRange={setRange}
        />
      </section>

      <section className="w-full py-3">
        {wallet && wallet.isWalletConnected && wallet.address ? (
          <Tab.Group>
            <Tab.List className="flex gap-6" ref={tabsRef}>
              <Tab disabled={userHasNoAssets} className="disabled:opacity-80">
                {({ selected }) => (
                  <h6 className={!selected ? "text-osmoverse-500" : undefined}>
                    {t("portfolio.yourAssets")}
                  </h6>
                )}
              </Tab>
              <Tab disabled={userHasNoAssets} className="disabled:opacity-80">
                {({ selected }) => (
                  <h6 className={!selected ? "text-osmoverse-500" : undefined}>
                    {t("portfolio.yourPositions")}
                  </h6>
                )}
              </Tab>
              <Tab disabled={userHasNoAssets} className="disabled:opacity-80">
                {({ selected }) => (
                  <h6 className={!selected ? "text-osmoverse-500" : undefined}>
                    {t("portfolio.recentTransfers")}
                  </h6>
                )}
              </Tab>
            </Tab.List>
            {!isTotalValueFetched ? (
              <div className="mx-auto my-6 w-fit">
                <Spinner />
              </div>
            ) : userHasNoAssets ? (
              <UserZeroBalanceTableSplash />
            ) : (
              <Tab.Panels className="py-6">
                <Tab.Panel>
                  <AssetBalancesTable
                    tableTopPadding={overviewHeight + tabsHeight}
                    onDeposit={onDeposit}
                    onWithdraw={onWithdraw}
                  />
                </Tab.Panel>
                <Tab.Panel>
                  <UserPositionsSection address={wallet.address} />
                </Tab.Panel>
                <Tab.Panel>
                  <section>
                    <RecentTransfers />
                  </section>
                </Tab.Panel>
              </Tab.Panels>
            )}
          </Tab.Group>
        ) : isWalletLoading ? null : (
          <WalletDisconnectedSplash />
        )}
      </section>
    </main>
  );
};

const PortfolioPerformance: FunctionComponent<{
  value: PricePretty;
  percentage: RatePretty;
  date?: string;
}> = ({ value, percentage, date }) => {
  return (
    <div className="body1 md:caption flex text-bullish-400">
      <PriceChange className="ml-2" priceChange={percentage} value={value} />
      <span className="ml-2 text-osmoverse-400">{date}</span>
    </div>
  );
};

const AssetsOverview: FunctionComponent<
  {
    totalValue?: PricePretty;
    isTotalValueFetched?: boolean;
    portfolioPerformance: React.ReactNode;
  } & CustomClasses
> = observer(({ totalValue, isTotalValueFetched, portfolioPerformance }) => {
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const { t } = useTranslation();
  const { startBridge, fiatRampSelection } = useBridge();
  const { isLoading: isWalletLoading } = useWalletSelect();
  const { isMobile } = useWindowSize();

  if (isWalletLoading) return null;

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
                <h5>{totalValue?.toString()}</h5>
              ) : (
                <h3>{totalValue?.toString()}</h3>
              )}
            </SkeletonLoader>
            {portfolioPerformance}
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
        </>
      ) : (
        <GetStartedWithOsmosis />
      )}
    </div>
  );
});

const UserPositionsSection: FunctionComponent<{ address?: string }> = ({
  address,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    hasPositions,
    hasPools,
    isLoading: isLoadingPositions,
  } = useUserPositionsData(address);

  if (isLoadingPositions) {
    return (
      <section className="mx-auto my-6 w-fit">
        <Spinner />
      </section>
    );
  }

  if (hasPositions || hasPools)
    return (
      <>
        {hasPositions && (
          <section>
            <span className="body2 text-osmoverse-200">
              {t("portfolio.yourSuperchargedPositions")}
            </span>
            <MyPositionsSection />
          </section>
        )}
        {hasPools && (
          <section>
            <span className="body2 text-osmoverse-200">
              {t("portfolio.yourLiquidityPools")}
            </span>
            <MyPoolsCardsGrid />
          </section>
        )}
      </>
    );

  return (
    <div className="mx-auto my-6 flex max-w-35 flex-col gap-6 text-center">
      <Image
        className="mx-auto"
        src="/images/coin-ring.svg"
        alt="no positions"
        width={240}
        height={160}
      />
      <div className="flex flex-col gap-2">
        <h6>{t("portfolio.noPositions")}</h6>
        <p className="body1 text-osmoverse-300">
          {t("portfolio.unlockPotential")}
        </p>
        <Button
          className="mx-auto flex !h-11 w-fit items-center gap-2 !rounded-full !py-1"
          onClick={() => router.push("/pools")}
        >
          <span className="subtitle1">{t("tokenInfos.explorePools")}</span>
        </Button>
      </div>
    </div>
  );
};

const UserZeroBalanceTableSplash: FunctionComponent = () => {
  const { t } = useTranslation();
  const { startBridge, fiatRampSelection } = useBridge();

  return (
    <div className="mx-auto flex w-fit flex-col gap-4 py-3 text-center">
      <Image
        alt="no balances"
        src="/images/coins-and-vial.svg"
        width={240}
        height={160}
      />
      <h6>{t("portfolio.noAssets", { osmosis: "Osmosis" })}</h6>
      <p className="body1 text-osmoverse-300">{t("portfolio.getStarted")}</p>
      <div className="flex items-center justify-center gap-2">
        <Button
          className="flex !w-fit items-center gap-2 !rounded-full"
          onClick={() => startBridge({ direction: "deposit" })}
        >
          <Icon id="deposit" height={16} width={16} />
          <span className="subtitle1">{t("assets.table.depositButton")}</span>
        </Button>
        <Button
          className="group flex items-center gap-2 !rounded-full !bg-osmoverse-825 text-wosmongton-200 hover:bg-gradient-positive hover:text-black hover:shadow-[0px_0px_30px_4px_rgba(57,255,219,0.2)]"
          onClick={fiatRampSelection}
        >
          <CreditCardIcon
            isAnimated
            classes={{
              backCard: "group-hover:stroke-[2]",
              frontCard: "group-hover:fill-[#71B5EB] group-hover:stroke-[2]",
            }}
          />
          <span className="subtitle1">{t("portfolio.buy")}</span>
        </Button>
      </div>
    </div>
  );
};

const GetStartedWithOsmosis: FunctionComponent = () => {
  const { chainStore } = useStore();
  const { t } = useTranslation();

  const { onOpenWalletSelect } = useWalletSelect();

  return (
    <div className="flex max-w-sm flex-col gap-8">
      <p className="body1 text-osmoverse-400">{t("portfolio.connectWallet")}</p>
      <Button
        className="flex !h-11 w-fit items-center gap-2 !rounded-full !py-1"
        onClick={() => {
          onOpenWalletSelect({
            walletOptions: [
              { walletType: "cosmos", chainId: chainStore.osmosis.chainId },
            ],
          });
        }}
      >
        {t("connectWallet")}
      </Button>
    </div>
  );
};

const WalletDisconnectedSplash: FunctionComponent = () => (
  <div className="relative w-full">
    <Image alt="home" src="/images/chart.png" fill />
    <Image
      className="relative top-10 mx-auto"
      alt="home"
      src="/images/osmosis-home-fg-coins.svg"
      width={624}
      height={298}
    />
  </div>
);

function useUserPositionsData(address: string | undefined) {
  const { data: positions, isLoading: isLoadingUserPositions } =
    api.local.concentratedLiquidity.getUserPositions.useQuery(
      {
        userOsmoAddress: address ?? "",
      },
      {
        enabled: Boolean(address),

        // expensive query
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );
  const hasPositions = Boolean(positions?.length);

  const { data: allMyPoolDetails, isLoading: isLoadingMyPoolDetails } =
    api.edge.pools.getUserPools.useQuery(
      {
        userOsmoAddress: address ?? "",
      },
      {
        enabled: Boolean(address),

        // expensive query
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );
  const hasPools = Boolean(allMyPoolDetails?.length);

  return {
    hasPositions,
    hasPools,
    isLoading: isLoadingUserPositions || isLoadingMyPoolDetails,
  };
}
