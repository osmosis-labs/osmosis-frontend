import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { Allocation } from "~/components/complex/portfolio/allocation";
import { AssetsOverview } from "~/components/complex/portfolio/assets-overview";
import { OpenOrders } from "~/components/complex/portfolio/open-orders";
import { UserPositionsSection } from "~/components/complex/portfolio/user-positions";
import { UserZeroBalanceTableSplash } from "~/components/complex/portfolio/user-zero-balance-table-splash";
import { WalletDisconnectedSplash } from "~/components/complex/portfolio/wallet-disconnected-splash";
import { SkeletonLoader, Spinner } from "~/components/loaders";
import { PortfolioAssetBalancesTable } from "~/components/table/portfolio-asset-balances";
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
import { HideDustState } from "~/stores/user-settings/hide-dust";
import { api } from "~/utils/trpc";

import { CypherCard } from "./cypher-card";
import { GetStartedWithOsmosis } from "./get-started-with-osmosis";

export const PortfolioPage: FunctionComponent = observer(() => {
  const { t } = useTranslation();
  const { accountStore, userSettings } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const { isLoading: isWalletLoading } = useWalletSelect();
  const featureFlags = useFeatureFlags();

  const { logEvent } = useAmplitudeAnalytics({
    onLoadEvent: [EventName.Portfolio.pageViewed],
  });

  const {
    data: allocation,
    isLoading: isLoadingAllocation,
    isFetched: isFetchedAllocation,
  } = api.local.portfolio.getPortfolioAssets.useQuery(
    {
      address: wallet?.address ?? "",
    },
    {
      enabled: Boolean(wallet?.isWalletConnected && wallet?.address),
    }
  );

  const totalCap = allocation?.totalCap;

  const userHasNoAssets = Boolean(allocation && totalCap?.toDec()?.isZero());

  const [overviewRef, { height: overviewHeight }] =
    useDimension<HTMLDivElement>();
  const [tabsRef, { height: tabsHeight }] = useDimension<HTMLDivElement>();

  const isWalletConnected =
    wallet && wallet.isWalletConnected && wallet.address;

  const hideDustSettingStore =
    userSettings.getUserSettingById<HideDustState>("hide-dust");
  const hideDust = Boolean(hideDustSettingStore?.state?.hideDust);

  return (
    <div className="flex justify-center p-8 pt-4 1.5xl:flex-col md:p-4">
      {isWalletLoading ? (
        <SkeletonLoader className="h-24 w-1/2 lg:w-full" />
      ) : isWalletConnected ? (
        <>
          <main className="mr-12 flex w-[752px] min-w-[752px] flex-col 1.5xl:mr-0 1.5xl:w-full 1.5xl:min-w-full">
            <section className="flex py-3" ref={overviewRef}>
              <AssetsOverview
                totalValue={totalCap}
                isTotalValueFetched={isFetchedAllocation}
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
                      <div
                        className={classNames(
                          !selected ? "text-osmoverse-500" : undefined,
                          "font-h6 text-h6 md:subtitle1"
                        )}
                      >
                        {t("portfolio.yourBalances")}
                      </div>
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
                      <div
                        className={classNames(
                          !selected ? "text-osmoverse-500" : undefined,
                          "font-h6 text-h6 md:subtitle1"
                        )}
                      >
                        {t("portfolio.yourPositions")}
                      </div>
                    )}
                  </Tab>
                </TabList>
                {!isFetchedAllocation ? (
                  <div className="mx-auto my-6 w-fit">
                    <Spinner />
                  </div>
                ) : userHasNoAssets ? (
                  <UserZeroBalanceTableSplash />
                ) : (
                  <TabPanels>
                    <TabPanel>
                      <PortfolioAssetBalancesTable
                        hideDust={Boolean(hideDust)}
                        setHideDust={(hideDust) =>
                          hideDustSettingStore?.setState({ hideDust })
                        }
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
                <Allocation assets={allocation} />
              )}
            </div>
            <div className="flex w-full flex-col">
              <OpenOrders />
              <RecentActivity />
            </div>
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
