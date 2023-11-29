import { LockingDurationSwitch } from "~/components/earn/tabs/filters/locking-duration";
import { MyAllRadio } from "~/components/earn/tabs/filters/my-all";
import { PlatformsDropdown } from "~/components/earn/tabs/filters/platforms";
import { RewardTypesRadio } from "~/components/earn/tabs/filters/reward-types";
import { SearchFilter } from "~/components/earn/tabs/filters/search-filter";
import { StrategyCategories } from "~/components/earn/tabs/filters/strategy-categories";
import { StrategyMethodDropdown } from "~/components/earn/tabs/filters/strategy-method";

export const TopFilters = () => {
  return (
    <div className="flex flex-col gap-5 px-10 py-8">
      <div className="flex justify-between">
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
