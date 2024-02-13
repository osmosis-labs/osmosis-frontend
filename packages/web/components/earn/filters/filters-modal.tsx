import { ReactNode } from "react";
import { useContext } from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { DropdownWithLabel } from "~/components/dropdown-with-label";
import { DropdownWithMultiSelect } from "~/components/dropdown-with-multi-select";
import { FilterContext } from "~/components/earn/filters/filter-context";
import {
  ListOption,
  Platform,
  StrategyButtonResponsibility,
  StrategyMethod,
} from "~/components/earn/table/types/filters";
import { RadioWithOptions } from "~/components/radio-with-options";
import { Switch } from "~/components/ui/switch";
import { useTranslation } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals";

interface StrategiesFilter extends ListOption<string> {
  icon: ReactNode;
}

const FiltersModal = (
  props: ModalBaseProps & {
    rewardTypes: ListOption<string>[];
    strategies: ListOption<StrategyMethod>[];
    platforms: ListOption<Platform>[];
    strategiesFilters: StrategiesFilter[];
    tokenFilterOptions: ListOption<string>[];
  }
) => {
  const { filters, setFilter, resetFilters } = useContext(FilterContext);
  const { t } = useTranslation();

  const {
    tokenHolder,
    strategyMethod,
    platform,
    noLockingDuration,
    rewardType,
    specialTokens,
  } = filters!;

  return (
    <ModalBase
      {...props}
      className="no-scrollbar bg-osmoverse-810 !p-10 md:!max-w-[428px]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <h6 className="text-osmoverse-100">{t("earnPage.filters")}</h6>
          <button
            onClick={resetFilters}
            className="inline-flex text-sm text-wosmongton-300 transition-colors duration-200 ease-in-out hover:text-wosmongton-500"
          >
            {t("earnPage.resetFilters")}
          </button>
        </div>
        <Icon
          id="close"
          width={24}
          height={24}
          color="#B0A9DC"
          onClick={props.onRequestClose}
        />
      </div>
      <div className="mt-20 flex flex-col gap-10">
        <div className="flex items-center justify-between gap-7">
          <span className="font-subtitle1 font-bold">
            {t("earnPage.lockingDuration")}
          </span>
          <Switch
            checked={noLockingDuration}
            onCheckedChange={(value) => setFilter("noLockingDuration", value)}
          />
        </div>
        <RadioWithOptions
          mode="secondary"
          variant="small"
          value={rewardType}
          onChange={(value) => setFilter("rewardType", value)}
          options={props.rewardTypes}
        />
        <div className="flex flex-col gap-4">
          <DropdownWithLabel<StrategyMethod>
            label={t("earnPage.strategyMethod")}
            allLabel={t("earnPage.allMethods")}
            options={props.strategies}
            value={strategyMethod}
            onChange={(value) => setFilter("strategyMethod", value)}
            buttonClassName="flex-1"
          />
          <DropdownWithLabel<Platform>
            label={t("earnPage.platforms")}
            allLabel={t("earnPage.allPlatforms")}
            options={props.platforms}
            value={platform}
            onChange={(value) => setFilter("platform", value)}
            buttonClassName="flex-1"
          />
          <DropdownWithMultiSelect
            label={t("earnPage.specialTokens")}
            options={props.strategiesFilters}
            stateValues={specialTokens}
            toggleFn={({ label, value }) =>
              setFilter("specialTokens", {
                label,
                value: value as StrategyButtonResponsibility,
              })
            }
            containerClassName="hidden w-full max-w-sm items-center gap-7 2xl:flex"
          />
        </div>
        <RadioWithOptions
          mode="primary"
          variant="large"
          value={tokenHolder}
          onChange={(value) => setFilter("tokenHolder", value)}
          options={props.tokenFilterOptions}
        />
      </div>
      <Button
        onClick={props.onRequestClose}
        mode={"primary"}
        className="mt-[70px] max-h-11"
      >
        {t("earnPage.saveFilters")}
      </Button>
    </ModalBase>
  );
};

export default FiltersModal;
