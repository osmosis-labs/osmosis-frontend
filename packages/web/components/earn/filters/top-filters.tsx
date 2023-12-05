import Image from "next/image";
import { useContext } from "react";

import { Icon } from "~/components/assets";
import { Switch } from "~/components/control";
import { DropdownWithLabel } from "~/components/dropdown-with-label";
import { FilterContext } from "~/components/earn/filters/filter-context";
import {
  ListOption,
  Platform,
  StrategyButtonResponsibility,
  StrategyMethod,
} from "~/components/earn/table/types";
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
    resp: "stablecoins",
    icon: <Icon id="stablecoins" />,
  },
  {
    label: "Correlated",
    resp: "correlated",
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
    resp: "bluechip",
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

  const {
    tokenHolder,
    strategyMethod,
    platform,
    noLockingDuration,
    search,
    rewardType,
  } = filters;

  return (
    <div className="flex flex-col gap-5 px-10 py-8">
      <div className="flex items-center justify-between gap-7">
        <RadioWithOptions
          mode="primary"
          variant="large"
          value={tokenHolder}
          onChange={(value) => setFilter("tokenHolder", value)}
          options={tokenFilterOptions}
        />
        <DropdownWithLabel<StrategyMethod>
          label="Strategy Method"
          options={strategies}
          value={strategyMethod}
          onChange={(value) => setFilter("strategyMethod", value)}
        />
        <DropdownWithLabel<Platform>
          label="Platforms"
          options={platforms}
          value={platform}
          onChange={(value) => setFilter("platform", value)}
        />
        <div className="flex items-center gap-7">
          <span className="text-base font-subtitle1 font-bold">
            No Locking Duration
          </span>
          <Switch
            isOn={noLockingDuration}
            onToggle={(value) => setFilter("noLockingDuration", value)}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-7">
        <SearchBox
          onInput={(value) => setFilter("search", String(value))}
          currentValue={search ?? ""}
          placeholder="Search"
          size={"full"}
        />
        <div className="flex">
          {strategiesFilters.map((props) => {
            const value = filters[props.resp as StrategyButtonResponsibility];
            return (
              <StrategyButton
                onChange={(e) =>
                  setFilter(e as StrategyButtonResponsibility, !value)
                }
                value={value}
                key={`${props.label} strategy button`}
                {...props}
              />
            );
          })}
        </div>
        <RadioWithOptions
          mode="secondary"
          variant="small"
          value={rewardType}
          onChange={(value) => setFilter("rewardType", value)}
          options={rewardTypes}
        />
      </div>
    </div>
  );
};
