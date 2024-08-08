import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Dec, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import classNames from "classnames";
import { FunctionComponent, useCallback, useState } from "react";

import { Allocation } from "~/components/complex/portfolio/allocation";
import { AssetsOverview } from "~/components/complex/portfolio/assets-overview";
import { UserPositionsSection } from "~/components/complex/portfolio/user-positions";
import { UserZeroBalanceTableSplash } from "~/components/complex/portfolio/user-zero-balance-table-splash";
import { WalletDisconnectedSplash } from "~/components/complex/portfolio/wallet-disconnected-splash";
import { Spinner } from "~/components/loaders";
import { AssetBalancesTable } from "~/components/table/asset-balances";
import { RecentTransfers } from "~/components/transactions/recent-transfers";
import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useDimension,
  useFeatureFlags,
  useTranslation,
  useWalletSelect,
} from "~/hooks";
import { useBridge } from "~/hooks/bridge";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { CypherCard } from "./cypher-card";

export const PortfolioPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { bridgeAsset } = useBridge();
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const featureFlags = useFeatureFlags();
  const { isLoading: isWalletLoading } = useWalletSelect();

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

  // these useCallbacks are key to prevent unnecessary rerenders of page + table
  // this prevents flickering
  const onDeposit = useCallback(
    (coinDenom: string) => {
      bridgeAsset({ anyDenom: coinDenom, direction: "deposit" });
    },
    [bridgeAsset]
  );
  const onWithdraw = useCallback(
    (coinDenom: string) => {
      bridgeAsset({ anyDenom: coinDenom, direction: "withdraw" });
    },
    [bridgeAsset]
  );

  const { logEvent } = useAmplitudeAnalytics();

  const [isChartMinimized, setIsChartMinimized] = useState(true);

  return (
    <main
      className={classNames(
        "mx-auto flex w-full max-w-container flex-col gap-8 p-8 pt-4 md:gap-8 md:p-4",
        {
          "bg-osmoverse-900": !featureFlags.limitOrders,
        }
      )}
    >
      <section className="flex gap-5" ref={overviewRef}>
        <AssetsOverview
          totalValue={
            totalValueData || new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0))
          }
          isTotalValueFetched={isTotalValueFetched}
          isChartMinimized={isChartMinimized}
          setIsChartMinimized={setIsChartMinimized}
        />
      </section>

      {wallet && wallet.isWalletConnected && wallet.address ? (
        <>
          <section className="w-full py-3">
            <TabGroup>
              <TabList className="flex gap-6" ref={tabsRef}>
                <Tab
                  disabled={userHasNoAssets}
                  className="disabled:opacity-80"
                  onClick={() => {
                    logEvent([
                      EventName.Portfolio.tabClicked,
                      { section: "Your assets" },
                    ]);
                  }}
                >
                  {({ selected }) => (
                    <h6
                      className={!selected ? "text-osmoverse-500" : undefined}
                    >
                      {t("portfolio.yourAssets")}
                    </h6>
                  )}
                </Tab>
                <Tab
                  disabled={userHasNoAssets}
                  className="disabled:opacity-80"
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
                <Tab disabled={userHasNoAssets} className="disabled:opacity-80">
                  {({ selected }) => (
                    <h6
                      className={!selected ? "text-osmoverse-500" : undefined}
                    >
                      {t("portfolio.recentTransfers")}
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
                <TabPanels className="py-6">
                  <TabPanel>
                    <AssetBalancesTable
                      tableTopPadding={overviewHeight + tabsHeight}
                      onDeposit={onDeposit}
                      onWithdraw={onWithdraw}
                    />
                  </TabPanel>
                  <TabPanel>
                    <UserPositionsSection address={wallet.address} />
                  </TabPanel>
                  <TabPanel>
                    <section>
                      <RecentTransfers />
                    </section>
                  </TabPanel>
                </TabPanels>
              )}
            </TabGroup>
          </section>
          <section className="flex w-80 flex-col gap-3">
            {featureFlags.cypherCard && <CypherCard />}

            {!isLoadingAllocation && !userHasNoAssets && (
              <Allocation allocation={allocation} />
            )}
          </section>
        </>
      ) : isWalletLoading ? null : (
        <WalletDisconnectedSplash />
      )}
    </main>
  );
};
