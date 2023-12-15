import { useRouter } from "next/router";
import { useMemo } from "react";
import { useEffect } from "react";

import { EarnAllocation } from "~/components/earn/allocation";
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
import { useFeatureFlags, useNavBar, useTranslation } from "~/hooks";

export default function Earn() {
  const { t } = useTranslation();
  const { earnPage } = useFeatureFlags();
  const router = useRouter();
  useNavBar({ title: t("earnPage.title") });

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
    if (!earnPage) {
      router.push("/");
    }
  }, [earnPage, router]);

  return (
    <div className="flex flex-col gap-10 py-10 pl-8 pr-9">
      <div className="grid grid-cols-earnpage gap-6 lg:flex lg:flex-col">
        <div className="grid grid-cols-earnpositions gap-x-7 rounded-3x4pxlinset bg-osmoverse-850 px-8 pt-7 pb-3 1.5xl:hidden">
          <EarnPosition />
          <div className="h-full max-h-72 w-0.5 bg-osmoverse-825" />
          <EarnAllocation />
        </div>
        <div className="hidden gap-x-7 rounded-3x4pxlinset bg-osmoverse-850 px-8 pt-7 pb-3 1.5xl:block">
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
        </div>
        <EarnRewards />
      </div>
      <FilterProvider defaultFilters={defaultFilters}>
        <Tabs className="flex flex-col">
          <TabButtons>
            <TabButton
              withBasePadding
              withTextOpacity
              className="min-h-[100px] flex-1 rounded-tl-3x4pxlinset rounded-tr-3x4pxlinset"
            >
              {t("earnPage.discoverStrategies")}
            </TabButton>
            <TabButton
              withBasePadding
              withTextOpacity
              className="min-h-[100px] flex-1 rounded-tl-3x4pxlinset rounded-tr-3x4pxlinset"
            >
              {t("earnPage.myStrategies")}
            </TabButton>
          </TabButtons>
          <TabHeader>
            <TopFilters />
          </TabHeader>
          <TabPanels>
            <TabPanel
              showBottomBlock
              className="flex-col rounded-br-5xl rounded-bl-5xl"
              displayMode="flex"
            >
              <StrategiesTable showBalance={false} />
            </TabPanel>
            <TabPanel
              showBottomBlock
              className="flex-col rounded-br-5xl rounded-bl-5xl"
              displayMode="flex"
            >
              <StrategiesTable showBalance />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </FilterProvider>
    </div>
  );
}
