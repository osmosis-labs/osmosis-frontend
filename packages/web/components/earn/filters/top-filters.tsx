import { Listbox, Transition } from "@headlessui/react";
import classNames from "classnames";
import Image from "next/image";
import { Fragment, useContext } from "react";

import { Icon } from "~/components/assets";
import { CheckBox, Switch } from "~/components/control";
import { DropdownWithLabel } from "~/components/dropdown-with-label";
import { FilterContext } from "~/components/earn/filters/filter-context";
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
    specialTokens,
  } = filters;

  return (
    <div className="flex flex-col gap-5 px-10 py-8">
      <div className="flex items-center justify-between gap-7 2xl:gap-10">
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
            Locking Duration
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
                value={
                  specialTokens.filter((f) => f.value === props.resp).length !==
                  0
                }
                key={`${props.label} strategy button`}
                {...props}
              />
            );
          })}
        </div>
        <div className="hidden w-full max-w-sm items-center gap-7 2xl:flex">
          <Listbox value={specialTokens} onChange={() => {}} multiple>
            <div className="relative w-full">
              <Listbox.Button className="relative z-20 inline-flex w-full min-w-dropdown-with-label items-center justify-between rounded-lg border-2 border-wosmongton-100 border-opacity-20 bg-osmoverse-900 py-3 px-5">
                {specialTokens.length === 0 ? (
                  <span
                    className={classNames(
                      "text-base font-subtitle1 font-normal leading-6",
                      "text-osmoverse-400"
                    )}
                  >
                    Special Tokens
                  </span>
                ) : (
                  <div className="inline-flex items-center gap-1.5">
                    {specialTokens.map(({ label, value }) => (
                      <div
                        key={`${label} dropdown indicator`}
                        className={classNames(
                          "inline-flex items-center gap-0.5 rounded-md bg-wosmongton-700 px-2"
                        )}
                      >
                        <span className="text-overline leading-6 tracking-normal text-white-high">
                          {label}
                        </span>
                        <Icon
                          id="close"
                          width={12}
                          height={12}
                          className="!h-3 !w-3"
                          onClick={() =>
                            setFilter("specialTokens", { label, value })
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}

                <Icon id="caret-down" />
              </Listbox.Button>
              <Transition
                as={Fragment}
                enter="transition ease-in duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options
                  className={
                    "absolute inset-x-0 z-10 -mt-1 flex flex-col gap-2 rounded-b-lg border-2 border-wosmongton-100 border-opacity-20 bg-osmoverse-900 py-4"
                  }
                >
                  {strategiesFilters.map(({ icon, label, resp }) => (
                    <Listbox.Option
                      className={
                        "relative cursor-default select-none py-3 px-4"
                      }
                      key={resp}
                      value={resp}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="inline-flex max-h-11 w-11 items-center justify-center rounded-lg bg-osmoverse-800 px-2 py-3">
                            {icon}
                          </div>
                          <small className="text-base text-osmoverse-200">
                            {label}
                          </small>
                        </div>
                        <CheckBox
                          checkClassName="hidden"
                          backgroundStyles="bg-wosmongton-700"
                          borderStyles="border-osmoverse-300 border-opacity-50"
                          isOn={
                            specialTokens.filter((f) => f.value === resp)
                              .length !== 0
                          }
                          onToggle={() =>
                            setFilter("specialTokens", {
                              label,
                              value: resp as StrategyButtonResponsibility,
                            })
                          }
                        />
                      </div>
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
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
