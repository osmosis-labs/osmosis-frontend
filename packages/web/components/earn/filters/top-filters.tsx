import Image from "next/image";
import { useContext, useState } from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { Switch } from "~/components/control";
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

const tokenFilterOptions = [
  {
    value: "my",
    label: "My Tokens",
  },
  {
    value: "all",
    label: "All Tokens",
  },
];

const strategies: ListOption<StrategyMethod>[] = [
  { value: "", label: "All" },
  { value: "lp", label: "LP" },
  { value: "perp_lp", label: "Perp LP" },
  { value: "vaults", label: "Vaults" },
  { value: "lending", label: "Lending" },
  { value: "staking", label: "Staking" },
];

const platforms: ListOption<Platform>[] = [
  { value: "", label: "All" },
  { value: "quasar", label: "Quasar" },
  { value: "osmosis_dex", label: "Osmosis DEX" },
  { value: "levana", label: "Levana" },
  { value: "mars", label: "Mars" },
  { value: "osmosis", label: "Osmosis" },
];

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

const rewardTypes = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "single",
    label: "Single",
  },
  {
    value: "multi",
    label: "Multi",
  },
];

export const TopFilters = () => {
  const { filters, setFilter } = useContext(FilterContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    tokenHolder,
    strategyMethod,
    platform,
    noLockingDuration,
    search,
    rewardType,
    specialTokens,
  } = filters;

  return (
    <div className="flex flex-col gap-5 px-10 py-8">
      <div className="flex items-center justify-between gap-7 2xl:gap-10 1.5xl:gap-0 xl:flex-wrap xl:gap-4 lg:hidden">
        <RadioWithOptions
          mode="primary"
          variant="large"
          value={tokenHolder}
          onChange={(value) => setFilter("tokenHolder", value)}
          options={tokenFilterOptions}
        />
        <DropdownWithLabel<StrategyMethod>
          label="Strategy Method"
          allLabel="All Methods"
          options={strategies}
          value={strategyMethod}
          onChange={(value) => setFilter("strategyMethod", value)}
        />
        <DropdownWithLabel<Platform>
          label="Platforms"
          allLabel="All Platforms"
          options={platforms}
          value={platform}
          onChange={(value) => setFilter("platform", value)}
        />
        <div className="flex items-center gap-7">
          <span className="font-subtitle1 font-bold">Locking Duration</span>
          <Switch
            isOn={noLockingDuration}
            onToggle={(value) => setFilter("noLockingDuration", value)}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-7 lg:hidden">
        <SearchBox
          onInput={(value) => setFilter("search", String(value))}
          currentValue={search ?? ""}
          placeholder="Search"
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
          label="Special Tokens"
          options={strategiesFilters}
          stateValues={filters.specialTokens}
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
          placeholder="Search"
          size={"full"}
        />
      </div>
      <div className="hidden flex-wrap items-center justify-between gap-4 lg:flex 1.5xs:hidden">
        <DropdownWithLabel<StrategyMethod>
          label="Strategy Method"
          allLabel="All Methods"
          options={strategies}
          value={strategyMethod}
          onChange={(value) => setFilter("strategyMethod", value)}
        />
        <DropdownWithLabel<Platform>
          label="Platforms"
          allLabel="All Platforms"
          options={platforms}
          value={platform}
          onChange={(value) => setFilter("platform", value)}
        />
        <div className="flex items-center gap-7">
          <span className="font-subtitle1 font-bold">Locking Duration</span>
          <Switch
            isOn={noLockingDuration}
            onToggle={(value) => setFilter("noLockingDuration", value)}
          />
        </div>
      </div>
      <div className="hidden items-center justify-between gap-4 lg:flex sm:flex-wrap 1.5xs:hidden">
        <DropdownWithMultiSelect
          label="Special Tokens"
          options={strategiesFilters}
          stateValues={filters.specialTokens}
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
          placeholder="Search"
          size={"full"}
        />
        <Button
          onClick={() => setIsModalOpen(true)}
          mode={"quaternary-modal"}
          className="max-w-[110px]"
        >
          Filters
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
