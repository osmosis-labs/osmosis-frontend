import Image from "next/image";
import { useMemo } from "react";
import { useContext, useState } from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { DropdownWithLabel } from "~/components/dropdown-with-label";
import { DropdownWithMultiSelect } from "~/components/dropdown-with-multi-select";
import { FilterContext } from "~/components/earn/filters/filter-context";
import FiltersModal from "~/components/earn/filters/filters-modal";
import {
  ListOption,
  Platform,
  StrategyButtonResponsibility,
  StrategyMethod,
} from "~/components/earn/table/types/filters";
import { SearchBox } from "~/components/input";
import { RadioWithOptions } from "~/components/radio-with-options";
import { StrategyButton } from "~/components/strategy-button";
import { Switch } from "~/components/ui/switch";
import { useTranslation } from "~/hooks";

const strategiesFilters = [
  {
    label: "Stablecoins",
    value: "stablecoins",
    icon: <Icon id="stablecoins" />,
  },
  {
    label: "Correlated",
    value: "correlated",
    icon: (
      <Image
        src="/icons/correlated.svg"
        alt="Correlated icon"
        width={28}
        height={28}
      />
    ),
  },
  {
    label: "Blue Chip",
    value: "bluechip",
    icon: (
      <Image
        src="/icons/blue-chip.svg"
        alt="Bluechip icon"
        width={28}
        height={28}
      />
    ),
  },
];

export const TopFilters = () => {
  const { filters, setFilter } = useContext(FilterContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();

  const rewardTypes = useMemo(
    () => [
      {
        value: "all",
        label: t("earnPage.rewardTypes.all"),
      },
      {
        value: "single",
        label: t("earnPage.rewardTypes.single"),
      },
      {
        value: "multi",
        label: t("earnPage.rewardTypes.multi"),
      },
    ],
    [t]
  );

  const tokenFilterOptions = useMemo(
    () => [
      {
        value: "my",
        label: t("earnPage.tokenFilterOptions.my"),
      },
      {
        value: "all",
        label: t("earnPage.tokenFilterOptions.all"),
      },
    ],
    [t]
  );

  const strategies: ListOption<StrategyMethod>[] = useMemo(
    () => [
      { value: "", label: t("earnPage.rewardTypes.all") },
      { value: "lp", label: "LP" },
      { value: "perp_lp", label: "Perp LP" },
      { value: "vaults", label: "Vaults" },
      { value: "lending", label: "Lending" },
      { value: "staking", label: "Staking" },
    ],
    [t]
  );

  const platforms: ListOption<Platform>[] = useMemo(
    () => [
      { value: "", label: t("earnPage.rewardTypes.all") },
      { value: "quasar", label: "Quasar" },
      { value: "osmosis_dex", label: "Osmosis DEX" },
      { value: "levana", label: "Levana" },
      { value: "mars", label: "Mars" },
      { value: "osmosis", label: "Osmosis" },
    ],
    [t]
  );

  const {
    tokenHolder,
    strategyMethod,
    platform,
    noLockingDuration,
    search,
    rewardType,
    specialTokens,
  } = filters!;

  return (
    <div className="flex flex-col gap-5 px-10 py-8 1.5xs:px-7 1.5xs:py-7">
      <div className="flex items-center justify-between gap-7 2xl:gap-10 1.5xl:gap-0 xl:flex-wrap xl:gap-4 lg:hidden">
        <RadioWithOptions
          mode="primary"
          variant="large"
          value={tokenHolder}
          onChange={(value) => setFilter("tokenHolder", value)}
          options={tokenFilterOptions}
        />
        <DropdownWithLabel<StrategyMethod>
          label={t("earnPage.strategyMethod")}
          allLabel={t("earnPage.allMethods")}
          options={strategies}
          value={strategyMethod}
          onChange={(value) => setFilter("strategyMethod", value)}
        />
        <DropdownWithLabel<Platform>
          label={t("earnPage.platforms")}
          allLabel={t("earnPage.allPlatforms")}
          options={platforms}
          value={platform}
          onChange={(value) => setFilter("platform", value)}
        />
        <div className="flex items-center gap-7">
          <span className="font-subtitle1 font-bold">
            {t("earnPage.lockingDuration")}
          </span>
          <Switch
            checked={noLockingDuration}
            onCheckedChange={(value) => setFilter("noLockingDuration", value)}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-7 lg:hidden">
        <SearchBox
          onInput={(value) => setFilter("search", String(value))}
          currentValue={search ?? ""}
          placeholder={t("store.searchPlaceholder")}
          size={"full"}
        />
        <div className="flex 2xl:hidden">
          {strategiesFilters.map((props) => {
            return (
              <StrategyButton
                onChange={(e) =>
                  setFilter("specialTokens", {
                    label: props.label,
                    value: e as StrategyButtonResponsibility,
                  })
                }
                isOn={
                  specialTokens.filter((f) => f.value === props.value)
                    .length !== 0
                }
                key={`${props.label} strategy button`}
                icon={props.icon}
                label={props.label}
                resp={props.value}
              />
            );
          })}
        </div>
        <DropdownWithMultiSelect
          label={t("earnPage.specialTokens")}
          options={strategiesFilters}
          stateValues={filters!.specialTokens}
          toggleFn={({ label, value }) =>
            setFilter("specialTokens", {
              label,
              value: value as StrategyButtonResponsibility,
            })
          }
          containerClassName="hidden w-full max-w-sm items-center gap-7 2xl:flex"
        />
        <RadioWithOptions
          mode="secondary"
          variant="small"
          value={rewardType}
          onChange={(value) => setFilter("rewardType", value)}
          options={rewardTypes}
        />
      </div>
      {/** 512 - 1024 */}
      <div className="hidden items-center justify-between gap-4 lg:flex 1.5xs:hidden">
        <RadioWithOptions
          mode="primary"
          variant="large"
          value={tokenHolder}
          onChange={(value) => setFilter("tokenHolder", value)}
          options={tokenFilterOptions}
        />
        <SearchBox
          onInput={(value) => setFilter("search", String(value))}
          currentValue={search ?? ""}
          placeholder={t("store.searchPlaceholder")}
          size={"full"}
        />
      </div>
      <div className="hidden flex-wrap items-center justify-between gap-4 lg:flex 1.5xs:hidden">
        <DropdownWithLabel<StrategyMethod>
          label={t("earnPage.strategyMethod")}
          allLabel={t("earnPage.allMethods")}
          options={strategies}
          value={strategyMethod}
          onChange={(value) => setFilter("strategyMethod", value)}
        />
        <DropdownWithLabel<Platform>
          label={t("earnPage.platforms")}
          allLabel={t("earnPage.allPlatforms")}
          options={platforms}
          value={platform}
          onChange={(value) => setFilter("platform", value)}
        />
        <div className="flex items-center gap-7">
          <span className="font-subtitle1 font-bold">
            {t("earnPage.lockingDuration")}
          </span>
          <Switch
            checked={noLockingDuration}
            onCheckedChange={(value) => setFilter("noLockingDuration", value)}
          />
        </div>
      </div>
      <div className="hidden items-center justify-between gap-4 lg:flex 1.5md:flex-wrap md:flex-nowrap sm:flex-wrap 1.5xs:hidden">
        <DropdownWithMultiSelect
          label={t("earnPage.specialTokens")}
          options={strategiesFilters}
          stateValues={filters!.specialTokens}
          toggleFn={({ label, value }) =>
            setFilter("specialTokens", {
              label,
              value: value as StrategyButtonResponsibility,
            })
          }
          containerClassName="hidden w-full max-w-sm items-center gap-7 2xl:flex"
        />
        <RadioWithOptions
          mode="secondary"
          variant="small"
          value={rewardType}
          onChange={(value) => setFilter("rewardType", value)}
          options={rewardTypes}
        />
      </div>
      {/** 0 - 512 */}
      <div className="hidden items-center justify-between gap-5 1.5xs:flex">
        <SearchBox
          onInput={(value) => setFilter("search", String(value))}
          currentValue={search ?? ""}
          placeholder={t("store.searchPlaceholder")}
          size={"full"}
        />
        <Button
          onClick={() => setIsModalOpen(true)}
          mode={"quaternary-modal"}
          className="max-w-[110px]"
        >
          {t("earnPage.filters")}
        </Button>
      </div>
      <FiltersModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        hideCloseButton
        platforms={platforms}
        rewardTypes={rewardTypes}
        strategies={strategies}
        strategiesFilters={strategiesFilters}
        tokenFilterOptions={tokenFilterOptions}
      />
    </div>
  );
};
