import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useEffect } from "react";

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
import {
  useFeatureFlags,
  useNavBar,
  useTranslation,
  useWalletSelect,
} from "~/hooks";
import useGetEarnStrategies from "~/hooks/use-get-earn-strategies";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

function Earn() {
  const { t } = useTranslation();
  const { earnPage, _isInitialized } = useFeatureFlags();
  const { accountStore } = useStore();
  const router = useRouter();

  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const userOsmoAddress = account?.address ?? "";
  const isWalletConnected = account?.isWalletConnected ?? false;

  useNavBar({ title: t("earnPage.title") });

  const {
    strategies,
    myStrategies,
    totalBalance,
    totalUnclaimedRewards,
    areQueriesLoading,
    areStrategiesLoading,
  } = useGetEarnStrategies(userOsmoAddress, isWalletConnected);

  const { onOpenWalletSelect } = useWalletSelect();

  const defaultFilters: Filters = useMemo(
    () => ({
      tokenHolder: "all",
      strategyMethod: { label: t("earnPage.rewardTypes.all"), value: "" },
      platform: { label: t("earnPage.rewardTypes.all"), value: "" },
      noLockingDuration: false,
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
  }, [earnPage, router, _isInitialized]);

  return (
    <div className="relative flex flex-col gap-10 py-10 pl-8 pr-9">
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
              totalBalance={formatPretty(totalBalance)}
              numberOfPositions={myStrategies.length}
              isLoading={areQueriesLoading}
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
          <EarnRewards totalUnclaimedRewards={totalUnclaimedRewards} />
        </div>
      ) : (
        <div className="flex">
          <div className="z-10 mb-5 flex flex-1 items-end gap-9 xl:flex-col">
            <div className="flex flex-col gap-7">
              <h4>{t("earnPage.startEarning")}</h4>
              <p className="body2 text-osmoverse-200 opacity-50">
                Phasellus libero nunc, sagittis vitae neque eu, ultrices dictum
                sapien, phasellus egestas quam eu nunc gravida.
              </p>
            </div>
            <Button
              mode={"primary"}
              onClick={() => onOpenWalletSelect(accountStore.osmosisChainId)}
            >
              {t("connectWallet")}
            </Button>
          </div>
          <div className="flex-1 md:hidden"></div>
        </div>
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
            <TopFilters />
          </TabHeader>
          <TabPanels>
            <TabPanel
              className="flex-col rounded-br-5xl rounded-bl-5xl"
              displayMode="flex"
            >
              {!areStrategiesLoading && strategies ? (
                <StrategiesTable strategies={strategies} showBalance={false} />
              ) : (
                <LoadingStrategies />
              )}
            </TabPanel>
            <TabPanel
              className="flex-col rounded-br-5xl rounded-bl-5xl"
              displayMode="flex"
            >
              {!areStrategiesLoading && strategies ? (
                <StrategiesTable strategies={myStrategies} showBalance />
              ) : (
                <LoadingStrategies />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </FilterProvider>
    </div>
  );
}

const LoadingStrategies = () => {
  return (
    <div className="mb-16 flex flex-col items-center justify-center gap-7">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-osmoverse-900">
        <Image
          src={"/images/loading-gradient.svg"}
          alt="Loading spinner"
          width={40}
          height={40}
          className="animate-spin"
        />
      </div>
      <h6 className="text-wosmongton-400">Loading strategies...</h6>
    </div>
  );
};

export default observer(Earn);
