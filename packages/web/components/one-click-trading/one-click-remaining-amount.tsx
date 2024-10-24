import { useOneClickTradingSession, useTranslation } from "~/hooks";

export const OneClickTradingRemainingAmount: React.FC = () => {
  const { t } = useTranslation();
  const { isOneClickTradingExpired, getSpendingLimitRemaining } =
    useOneClickTradingSession();

  if (isOneClickTradingExpired) {
    return (
      <p className="body1 text-osmoverse-300">
        {t("oneClickTrading.profile.sessionExpired")}
      </p>
    );
  }
  return <p>{getSpendingLimitRemaining().toString()}</p>;
};
