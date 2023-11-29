import { MyAllSwitch } from "~/components/earn/tabs/filters/my-all";
import { PlatformsDropdown } from "~/components/earn/tabs/filters/platforms";
import { StrategyMethodDropdown } from "~/components/earn/tabs/filters/strategy-method";

export const TopFilters = () => {
  return (
    <div className="flex flex-col gap-5 px-10 py-8">
      <div className="flex justify-between">
        <MyAllSwitch />
        <StrategyMethodDropdown />
        <PlatformsDropdown />
      </div>
    </div>
  );
};
