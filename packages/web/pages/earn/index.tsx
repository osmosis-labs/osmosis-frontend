import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";

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
        <div className="flex max-h-[192px] items-end justify-start overflow-hidden rounded-3x4pxlinset bg-osmoverse-850 bg-gradient-earnpage-position-bg px-8 pt-7 pb-4 2xl:justify-between 1.5md:bg-none">
          <EarnPosition />
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
