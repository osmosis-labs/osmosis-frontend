import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import { Button } from "~/components/buttons";
import {
  FilterProvider,
  Filters,
} from "~/components/earn/filters/filter-context";
import { TopFilters } from "~/components/earn/filters/top-filters";
import { EarnPosition } from "~/components/earn/position";
import { EarnRewards } from "~/components/earn/rewards";
import StrategiesTable from "~/components/earn/table";
import {
  TabButton,
  TabButtons,
  TabHeader,
  TabPanel,
  TabPanels,
  Tabs,
} from "~/components/earn/tabs";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useFeatureFlags,
  useNavBar,
  useTranslation,
  useWalletSelect,
} from "~/hooks";
import useGetEarnStrategies from "~/hooks/use-get-earn-strategies";
import { useStore } from "~/stores";

function Earn() {
  const { t } = useTranslation();
  const { earnPage, _isInitialized } = useFeatureFlags();
  const { accountStore } = useStore();
  const router = useRouter();
  /**
   * Control the selected table idx for external control
   * such as the {num} positions onClick on EarnPosition
   */
  const [tabIdx, setTabIdx] = useState(0);

  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const userOsmoAddress = account?.address ?? "";
  const isWalletConnected = account?.isWalletConnected ?? false;

  const { onOpenWalletSelect, isLoading: isWalletLoading } = useWalletSelect();

  useNavBar({ title: t("earnPage.title") });

  const {
    strategies,
    myStrategies,
    totalBalance,
    totalUnclaimedRewards,
    areBalancesLoading,
    areStrategiesLoading,
    isAssetsBreakdownLoading,
    isAssetsBreakdownError,
    isError,
    refetch,
    unclaimedRewards,
  } = useGetEarnStrategies(userOsmoAddress, isWalletConnected);

  const { logEvent } = useAmplitudeAnalytics();

  const defaultFilters: Filters = useMemo(
    () => ({
      tokenHolder: "all",
      strategyMethod: { label: t("earnPage.rewardTypes.all"), value: "" },
      platform: { label: t("earnPage.rewardTypes.all"), value: "" },
      lockDurationType: "all",
      search: "",
      specialTokens: [],
      rewardType: "all",
    }),
    [t]
  );

  useEffect(() => {
    if (!earnPage && _isInitialized) {
      router.push("/");
    }
    logEvent([EventName.EarnPage.pageViewed]);
  }, [earnPage, router, _isInitialized, logEvent]);

  return (
    <div className="relative mx-auto flex max-w-[1508px] flex-col gap-10 py-10 pl-8 pr-9">
      {!isWalletConnected && (
        <Image
          src={"/images/staking-apr-full.svg"}
          className="absolute right-36 top-16 z-0 -rotate-[75deg] 1.5md:hidden"
          alt="Staking graphic"
          width={402}
          height={286}
        />
      )}

      {isWalletConnected ? (
        <div className="grid grid-cols-earnpage gap-6 lg:flex lg:flex-col">
          <div className="flex max-h-[192px] items-end justify-start overflow-hidden rounded-3x4pxlinset bg-osmoverse-850 bg-gradient-earnpage-position-bg px-8 pt-7 pb-4 2xl:justify-between 1.5md:bg-none">
            <EarnPosition
              setTabIdx={setTabIdx}
              totalBalance={totalBalance.toString()}
              numberOfPositions={myStrategies.length}
              isLoading={areBalancesLoading}
            />
            {/* <div className="h-full max-h-72 w-0.5 bg-osmoverse-825" />
          <EarnAllocation /> */}
            <p className="ml-auto max-w-[160px] text-right text-body2 font-medium text-osmoverse-200 2xl:hidden">
              {t("earnPage.lookBelow")}
            </p>
            <Image
              src={"/images/staking-apr-full.svg"}
              alt="Staking image"
              width={298}
              height={212}
              className="translate-x-8 translate-y-10 -rotate-[75deg] overflow-visible object-cover 2xl:object-contain 1.5md:hidden"
            />
          </div>
          <EarnRewards
            unclaimedRewards={unclaimedRewards}
            totalUnclaimedRewards={totalUnclaimedRewards}
            areBalancesLoading={areBalancesLoading}
          />
        </div>
      ) : (
        <SkeletonLoader isLoaded={!isWalletLoading}>
          <div className="flex">
            <div className="z-10 mb-5 flex flex-1 flex-col">
              <h4 className="mb-7">{t("earnPage.startEarning")}</h4>
              <div className="flex flex-row gap-24 xl:flex-col xl:gap-9">
                <p className="body2 text-osmoverse-200 opacity-50">
                  {t("earnPage.startEarningDescription")}
                </p>

                <Button
                  mode={"primary"}
                  className="max-h-11 max-w-[260px] xl:max-w-none"
                  onClick={() =>
                    onOpenWalletSelect(accountStore.osmosisChainId)
                  }
                >
                  {t("connectWallet")}
                </Button>
              </div>
            </div>
            <div className="flex-1 md:hidden"></div>
          </div>
        </SkeletonLoader>
      )}

      {/* <div className="hidden gap-x-7 rounded-3x4pxlinset bg-osmoverse-850 px-8 pt-7 pb-3 1.5xl:block">
          <Tabs>
            <TabButtons>
              <TabButton withTextOpacity textClassName="!text-lg !leading-8">
                {t("earnPage.position")}
              </TabButton>
              <TabButton
                withTextOpacity
                textClassName="!text-lg !leading-8"
                className="ml-4"
              >
                {t("earnPage.allocation")}
              </TabButton>
            </TabButtons>
            <TabPanels>
              <TabPanel displayMode="block">
                <EarnPosition />
              </TabPanel>
              <TabPanel displayMode="block">
                <EarnAllocation />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div> */}

      <FilterProvider defaultFilters={defaultFilters}>
        <Tabs
          externalControl
          controlledIdx={tabIdx}
          setIdx={setTabIdx}
          className={classNames("flex flex-col", {
            "z-10": !isWalletConnected,
          })}
        >
          <TabButtons>
            <TabButton
              withBasePadding
              withTextOpacity
              className="min-h-[100px] flex-1 rounded-tl-3x4pxlinset rounded-tr-3x4pxlinset"
            >
              {t("earnPage.discoverStrategies")}
            </TabButton>
            {isWalletConnected ? (
              <TabButton
                withBasePadding
                withTextOpacity
                className="min-h-[100px] flex-1 rounded-tl-3x4pxlinset rounded-tr-3x4pxlinset"
              >
                {t("earnPage.myStrategies")}
              </TabButton>
            ) : (
              <div className="min-h-[100px] flex-1"></div>
            )}
          </TabButtons>
          <TabHeader>
            {(selectedIdx) => (
              <TopFilters
                tokenHolderSwitchDisabled={
                  selectedIdx === 1 ||
                  isAssetsBreakdownLoading ||
                  isAssetsBreakdownError
                }
              />
            )}
          </TabHeader>
          <TabPanels>
            <TabPanel
              className="flex-col rounded-br-5xl rounded-bl-5xl"
              displayMode="flex"
            >
              <StrategiesTable
                strategies={strategies}
                showBalance={false}
                areStrategiesLoading={areStrategiesLoading}
                isError={isError}
                refetch={refetch}
              />
            </TabPanel>
            <TabPanel
              className="flex-col rounded-br-5xl rounded-bl-5xl"
              displayMode="flex"
            >
              <StrategiesTable
                strategies={myStrategies}
                showBalance
                areStrategiesLoading={areStrategiesLoading}
                isError={isError}
                refetch={refetch}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </FilterProvider>
    </div>
  );
}

export default observer(Earn);
