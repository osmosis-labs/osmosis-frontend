import { OneClickTradingRemainingAmount } from "~/components/one-click-trading/one-click-remaining-amount";
import { OneClickTradingRemainingTime } from "~/components/one-click-trading/one-click-remaining-time";
import { Tooltip } from "~/components/tooltip";
import { useTranslation } from "~/hooks";

interface Props {
  isSpendingLimitExceeded: boolean;
  onRequestEdit: () => void;
}

export const OneClickTradingLimitRemaining: React.FC<Props> = ({
  isSpendingLimitExceeded,
  onRequestEdit,
}) => {
  const { t } = useTranslation();

  if (!isSpendingLimitExceeded) {
    return (
      <div
        className="body2 flex cursor-pointer items-center justify-end gap-1 text-wosmongton-300"
        onClick={onRequestEdit}
      >
        <OneClickTradingRemainingAmount />
        <p>/</p>
        <OneClickTradingRemainingTime className="!body2 !text-wosmongton-300" />
      </div>
    );
  }

  return (
    <div className="body2 flex items-center justify-end gap-1 text-wosmongton-300">
      <button
        type="button"
        className="flex min-h-[2rem] items-center justify-center rounded-5xl border border-osmoverse-700 py-1 px-3"
        onClick={onRequestEdit}
      >
        <span className="body2 sm:caption text-wosmongton-300">
          {t("edit")}
        </span>
      </button>
      <Tooltip
        rootClassNames="!max-w-[17.5rem]"
        content={
          <div className="caption flex flex-col gap-1">
            <p>{t("oneClickTrading.tooltipExceeded.title")}</p>
            <p className="text-osmoverse-300">
              {t("oneClickTrading.tooltipExceeded.description")}
            </p>
          </div>
        }
      >
        <p className="body-2 text-rust-400">{t("exceeded")}</p>
      </Tooltip>
    </div>
  );
};
