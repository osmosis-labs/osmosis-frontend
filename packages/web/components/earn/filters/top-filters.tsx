import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useContext, useState } from "react";

import { Icon } from "~/components/assets";
import { DropdownWithLabel } from "~/components/dropdown-with-label";
import { DropdownWithMultiSelect } from "~/components/dropdown-with-multi-select";
import { FilterContext } from "~/components/earn/filters/filter-context";
import FiltersModal from "~/components/earn/filters/filters-modal";
import { ListOption } from "~/components/earn/table/types/filters";
import { getListOptions } from "~/components/earn/table/utils";
import { SearchBox } from "~/components/input";
import { RadioWithOptions } from "~/components/radio-with-options";
import { StrategyButton } from "~/components/strategy-button";
import { Tooltip } from "~/components/tooltip";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { useTranslation } from "~/hooks";
import { theme } from "~/tailwind.config";
import { api } from "~/utils/trpc";

export const TopFilters = ({
  tokenHolderSwitchDisabled,
}: {
  tokenHolderSwitchDisabled?: boolean;
}) => {
  const { filters, setFilter } = useContext(FilterContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();

  const { data: cmsData } = api.edge.earn.getStrategies.useQuery();

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

  const lockDurationTypes = useMemo(
    () => [
      {
        value: "all",
        label: t("earnPage.rewardTypes.all"),
      },
      {
        value: "lock",
        label: t("earnPage.lock"),
      },
      {
        value: "nolock",
        label: t("earnPage.noLock"),
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

  const strategies: ListOption<string>[] = useMemo(
    () =>
      getListOptions<string>(
        cmsData?.strategies ?? [],
        "type",
        "type",
        t("earnPage.rewardTypes.all")
      ),
    [cmsData, t]
  );

  const platforms: ListOption<string>[] = useMemo(
    () =>
      getListOptions<string>(
        cmsData?.strategies ?? [],
        "platform",
        "platform",
        t("earnPage.rewardTypes.all")
      ),
    [cmsData, t]
  );

  const categories = useMemo(
    () =>
      cmsData?.categories.map((category) => ({
        label: category.name,
        value: category.name,
        icon: (
          <Image
            src={category.iconURL}
            alt={category.name}
            width={28}
            height={28}
          />
        ),
        tooltip: category.description,
      })) ?? [],
    [cmsData]
  );

  const {
    tokenHolder,
    strategyMethod,
    platform,
    search,
    rewardType,
    specialTokens,
    lockDurationType,
  } = filters!;

  return (
    <div className="flex flex-col gap-5 px-10 py-8 1.5xs:px-7 1.5xs:py-7">
      <div className="flex flex-wrap items-center justify-between gap-7 2xl:gap-10 1.5xl:gap-4 lg:hidden">
        <RadioWithOptions
          disabled={tokenHolderSwitchDisabled}
          mode="primary"
          variant="large"
          value={tokenHolder}
          onChange={(value) => setFilter("tokenHolder", value)}
          options={tokenFilterOptions}
        />
        <DropdownWithLabel<string>
          label={t("earnPage.strategyMethod")}
          allLabel={t("earnPage.allMethods")}
          options={strategies}
          value={strategyMethod}
          onChange={(value) =>
            setFilter("strategyMethod", value as ListOption<string>)
          }
        />
        <DropdownWithLabel<string>
          label={t("earnPage.platforms")}
          allLabel={t("earnPage.allPlatforms")}
          options={platforms}
          value={platform}
          onChange={(value) => setFilter("platform", value)}
        />
        <div className="flex items-center gap-7">
          <span className="font-subtitle1 font-bold">
            {t("earnPage.instantUnbondOnly")}
          </span>
          <Switch
            checked={lockDurationType === "nolock"}
            onCheckedChange={(value) =>
              setFilter("lockDurationType", value ? "nolock" : "all")
            }
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
          {categories.map((props) => {
            return (
              <Tooltip
                key={`${props.label} strategy button`}
                content={props.tooltip}
              >
                <StrategyButton
                  onChange={(value) =>
                    setFilter("specialTokens", {
                      label: props.label,
                      value,
                    })
                  }
                  isOn={
                    specialTokens.filter((f) => f.value === props.value)
                      .length !== 0
                  }
                  icon={props.icon}
                  label={props.label}
                  resp={props.value}
                />
              </Tooltip>
            );
          })}
        </div>
        <DropdownWithMultiSelect
          label={t("earnPage.allCategories")}
          options={categories}
          stateValues={filters!.specialTokens}
          toggleFn={({ label, value }) =>
            setFilter("specialTokens", {
              label,
              value,
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
          disabled={tokenHolderSwitchDisabled}
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
        <DropdownWithLabel<string>
          label={t("earnPage.strategyMethod")}
          allLabel={t("earnPage.allMethods")}
          options={strategies}
          value={strategyMethod}
          onChange={(value) => setFilter("strategyMethod", value)}
        />
        <DropdownWithLabel<string>
          label={t("earnPage.platforms")}
          allLabel={t("earnPage.allPlatforms")}
          options={platforms}
          value={platform}
          onChange={(value) => setFilter("platform", value)}
        />
        <div className="flex items-center gap-7">
          <span className="font-subtitle1 font-bold">
            {t("earnPage.instantUnbondOnly")}
          </span>
          <Switch
            checked={lockDurationType === "nolock"}
            onCheckedChange={(value) =>
              setFilter("lockDurationType", value ? "nolock" : "all")
            }
          />
        </div>
      </div>
      <div className="hidden items-center justify-between gap-4 lg:flex 1.5md:flex-wrap md:flex-nowrap sm:flex-wrap 1.5xs:hidden">
        <DropdownWithMultiSelect
          label={t("earnPage.allCategories")}
          options={categories}
          stateValues={filters!.specialTokens}
          toggleFn={({ label, value }) =>
            setFilter("specialTokens", {
              label,
              value,
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
        <Button onClick={() => setIsModalOpen(true)} className="max-w-[110px]">
          {t("earnPage.filters")}
        </Button>
      </div>
      <FiltersModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        hideCloseButton
        platforms={platforms}
        rewardTypes={rewardTypes}
        lockDurationTypes={lockDurationTypes}
        strategies={strategies}
        strategiesFilters={categories}
        tokenFilterOptions={tokenFilterOptions}
        isMyAllSwitchDisabled={tokenHolderSwitchDisabled}
      />
      <div className="-mt-1 flex flex-wrap items-center gap-x-3">
        <span className="caption text-osmoverse-200">
          {t("earnPage.riskDisclaimer")}
        </span>
        <Link
          href="https://docs.osmosis.zone/overview/integrate/earn-risk"
          target="_blank"
          className="caption inline-flex items-center gap-1 text-wosmongton-300"
        >
          {t("pool.learnMore")}
          <Icon
            id="arrow-up-right"
            width={18}
            height={18}
            color={theme.colors.wosmongton[300]}
          />
        </Link>
      </div>
    </div>
  );
};
