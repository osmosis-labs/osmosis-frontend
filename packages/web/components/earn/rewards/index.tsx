import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";

export const EarnRewards = () => {
  return (
    <div className="flex h-[384px] min-w-[332px] flex-col rounded-3x4pxlinset bg-osmoverse-850 px-[26px] pt-7">
      <p className="text-xl font-semibold text-osmoverse-100">Rewards</p>
      <div className="mt-6 flex flex-col">
        <h3 className="text-3xl font-semibold text-osmoverse-100">$24.55</h3>
        <small className="text-xs font-subtitle2 font-medium text-osmoverse-300">
          available to claim
        </small>
      </div>
      <div className="mt-5 flex flex-col gap-1">
        <h5 className="text-xl font-semibold text-bullish-400">$221.64</h5>
        <div className="flex items-center gap-1">
          <small className="text-xs font-subtitle2 font-medium text-osmoverse-300">
            Estimated in yearly rewards
          </small>
          <Icon id="info" className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-3">
        <Button mode={"primary"} className="max-h-11">
          Claim all rewards
        </Button>
        <Button
          mode={"quaternary"}
          className="max-h-11 border-none text-sm font-subtitle1"
        >
          View all earning positions
        </Button>
      </div>
    </div>
  );
};
