import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Dec, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { Allocation } from "~/components/complex/portfolio/allocation";
import { AssetsOverview } from "~/components/complex/portfolio/assets-overview";
import { UserPositionsSection } from "~/components/complex/portfolio/user-positions";
import { UserZeroBalanceTableSplash } from "~/components/complex/portfolio/user-zero-balance-table-splash";
import { WalletDisconnectedSplash } from "~/components/complex/portfolio/wallet-disconnected-splash";
import { SkeletonLoader, Spinner } from "~/components/loaders";
import { AssetBalancesTable } from "~/components/table/asset-balances";
import { RecentActivity } from "~/components/transactions/recent-activity/recent-activity";
import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useDimension,
  useFeatureFlags,
  useTranslation,
  useWalletSelect,
} from "~/hooks";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { CypherCard } from "./cypher-card";
import { GetStartedWithOsmosis } from "./get-started-with-osmosis";

export const PortfolioPage: FunctionComponent = observer(() => {
  const { t } = useTranslation();
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const featureFlags = useFeatureFlags();

  useAmplitudeAnalytics({
    onLoadEvent: [EventName.Portfolio.pageViewed],
  });

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

  const { data: allocation, isLoading: isLoadingAllocation } =
    api.local.portfolio.getAllocation.useQuery(
      {
        address: wallet?.address ?? "",
      },
      {
        enabled: Boolean(wallet?.isWalletConnected && wallet?.address),
      }
    );

  const [overviewRef, { height: overviewHeight }] =
    useDimension<HTMLDivElement>();
  const [tabsRef, { height: tabsHeight }] = useDimension<HTMLDivElement>();

  const { logEvent } = useAmplitudeAnalytics();

  const isWalletConnected =
    wallet && wallet.isWalletConnected && wallet.address;

  const { isLoading: isWalletLoading } = useWalletSelect();

  return (
    <div
      className={classNames(
        "flex justify-center p-8 pt-4",
        "1.5xl:flex-col",
        "md:p-4",
        {
          "bg-osmoverse-900": !featureFlags.limitOrders,
        }
      )}
    >
      {isWalletLoading ? (
        <SkeletonLoader className="h-24 w-1/2 lg:w-full" />
      ) : isWalletConnected ? (
        <>
          <main className="mr-12 flex w-[752px] min-w-[752px] flex-col 1.5xl:mr-0 1.5xl:w-full 1.5xl:min-w-full">
            <section className="flex py-3" ref={overviewRef}>
              <AssetsOverview
                totalValue={
                  totalValueData ||
                  new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0))
                }
                isTotalValueFetched={isTotalValueFetched}
              />
            </section>
            <section className="w-full py-3">
              <TabGroup>
                <TabList className="-mx-4 flex" ref={tabsRef}>
                  <Tab
                    disabled={userHasNoAssets}
                    className="py-3 px-4 disabled:opacity-80"
                    onClick={() => {
                      logEvent([
                        EventName.Portfolio.tabClicked,
                        { section: "Your balances" },
                      ]);
                    }}
                  >
                    {({ selected }) => (
                      <h6
                        className={!selected ? "text-osmoverse-500" : undefined}
                      >
                        {t("portfolio.yourBalances")}
                      </h6>
                    )}
                  </Tab>
                  <Tab
                    disabled={userHasNoAssets}
                    className="py-3 px-4 disabled:opacity-80 "
                    onClick={() => {
                      logEvent([
                        EventName.Portfolio.tabClicked,
                        { section: "Your positions" },
                      ]);
                    }}
                  >
                    {({ selected }) => (
                      <h6
                        className={!selected ? "text-osmoverse-500" : undefined}
                      >
                        {t("portfolio.yourPositions")}
                      </h6>
                    )}
                  </Tab>
                </TabList>
                {!isTotalValueFetched ? (
                  <div className="mx-auto my-6 w-fit">
                    <Spinner />
                  </div>
                ) : userHasNoAssets ? (
                  <UserZeroBalanceTableSplash />
                ) : (
                  <TabPanels>
                    <TabPanel>
                      <AssetBalancesTable
                        tableTopPadding={overviewHeight + tabsHeight}
                      />
                    </TabPanel>
                    <TabPanel>
                      <UserPositionsSection address={wallet?.address} />
                    </TabPanel>
                  </TabPanels>
                )}
              </TabGroup>
            </section>
          </main>

          <aside
            className={classNames(
              "flex w-[320px] min-w-[320px] flex-col",
              "1.5xl:w-full 1.5xl:min-w-full 1.5xl:flex-row-reverse 1.5xl:gap-x-16",
              "md:flex-col-reverse"
            )}
          >
            <div
              className={classNames(
                "w-full",
                "1.5xl:w-[320px] 1.5xl:min-w-[320px]",
                "md:w-full md:max-w-full"
              )}
            >
              {featureFlags.cypherCard && <CypherCard />}
              {!isLoadingAllocation && !userHasNoAssets && (
                <Allocation allocation={allocation} />
              )}
            </div>
            <RecentActivity />
          </aside>
        </>
      ) : (
        <div className="flex flex-col">
          <GetStartedWithOsmosis />
          <WalletDisconnectedSplash />
        </div>
      )}
    </div>
  );
});
