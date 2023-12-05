import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { Tooltip } from "~/components/tooltip";

export const EarnRewards = () => {
  return (
    <div className="flex min-w-rewards-container flex-col justify-between rounded-3x4pxlinset bg-osmoverse-850 px-7 pt-7 pb-9">
      <p className="text-xl font-semibold text-osmoverse-100">Rewards</p>
      <div className="mt-5 flex flex-col gap-1">
        <h5 className="text-xl font-semibold text-bullish-400">$221.64</h5>
        <div className="flex items-center gap-1">
          <small className="text-xs font-subtitle2 font-medium text-osmoverse-300">
            Estimated in yearly rewards
          </small>
          <Tooltip
            content={"Lorem ipsum dolor sit amet, consecteur adisciping elit."}
          >
            <Icon id="info" className="h-4 w-4" />
          </Tooltip>
        </div>
      </div>
      <div className="mt-6 flex flex-col">
        <h3 className="text-3xl font-semibold text-osmoverse-100">$24.55</h3>
        <small className="text-xs font-subtitle2 font-medium text-osmoverse-300">
          available to claim
        </small>
      </div>
      <div className="mt-8 flex flex-col gap-3">
        <Button mode={"primary"} className="max-h-11">
          Claim all rewards
        </Button>
      </div>
    </div>
  );
};
