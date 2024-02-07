import { Button } from "~/components/buttons";
import { useTranslation } from "~/hooks";

export const EarnRewards = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col justify-between rounded-3x4pxlinset bg-osmoverse-850 px-6 pt-7 pb-6">
      <h5 className="text-lg font-semibold text-osmoverse-100">
        {t("earnPage.rewards")}
      </h5>
      {/* <div className="mt-5 flex flex-col gap-1">
        <h5 className="text-xl font-semibold text-bullish-400">$221.64</h5>
        <div className="flex items-center gap-1">
          <small className="text-xs font-subtitle2 font-medium text-osmoverse-300">
            {t("earnPage.estimatedInYearlyRewards")}
          </small>
          <Tooltip
            content={"Lorem ipsum dolor sit amet, consecteur adisciping elit."}
          >
            <Icon id="info" className="h-4 w-4" />
          </Tooltip>
        </div>
      </div> */}
      <div className="mt-3.5 flex justify-between">
        <h4 className="text-osmoverse-200">$24.55</h4>
        <small className="max-w-[54px] text-right text-xs font-subtitle2 font-medium text-osmoverse-300">
          {t("earnPage.availableToClaim")}
        </small>
      </div>
      <div className="mt-4.5 flex flex-col gap-3">
        <Button mode={"primary"} className="max-h-11">
          {t("earnPage.claimAllRewards")}
        </Button>
      </div>
    </div>
  );
};
