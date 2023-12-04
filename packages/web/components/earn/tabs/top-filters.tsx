import { LockingDurationSwitch } from "~/components/earn/filters/locking-duration";
import { MyAllRadio } from "~/components/earn/filters/my-all";
import { PlatformsDropdown } from "~/components/earn/filters/platforms";
import { RewardTypesRadio } from "~/components/earn/filters/reward-types";
import { SearchFilter } from "~/components/earn/filters/search-filter";
import { StrategyCategories } from "~/components/earn/filters/strategy-categories";
import { StrategyMethodDropdown } from "~/components/earn/filters/strategy-method";

export const TopFilters = () => {
  return (
    <div className="flex flex-col gap-5 px-10 py-8">
      <div className="flex items-center justify-between gap-7">
        <MyAllRadio />
        <StrategyMethodDropdown />
        <PlatformsDropdown />
        <LockingDurationSwitch />
      </div>
      <div className="flex items-center justify-between gap-7">
        <SearchFilter />
        <StrategyCategories />
        <RewardTypesRadio />
      </div>
    </div>
  );
};
