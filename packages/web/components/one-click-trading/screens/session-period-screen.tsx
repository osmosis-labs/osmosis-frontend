import { Button } from "~/components/buttons";
import { OneClickTradingBaseScreenProps } from "~/components/one-click-trading/screens/types";
import { useTranslation } from "~/hooks";

const Periods = [
  {
    id: "day",
    periodTranslationKey:
      "oneClickTrading.settings.sessionPeriodScreen.periods.day",
  },
  {
    id: "week",
    periodTranslationKey:
      "oneClickTrading.settings.sessionPeriodScreen.periods.week",
  },
  {
    id: "month",
    periodTranslationKey:
      "oneClickTrading.settings.sessionPeriodScreen.periods.month",
  },
  {
    id: "year",
    periodTranslationKey:
      "oneClickTrading.settings.sessionPeriodScreen.periods.year",
  },
] as const;

interface SessionPeriodScreenProps extends OneClickTradingBaseScreenProps {}

export const SessionPeriodScreen = ({
  goBackButton,
}: SessionPeriodScreenProps) => {
  const { t } = useTranslation();

  return (
    <>
      {goBackButton}
      <div className="flex flex-col items-center gap-6 px-16 ">
        <h1 className="w-full text-center text-h6 font-h6 tracking-wider">
          {t("oneClickTrading.settings.sessionPeriodScreen.title")}
        </h1>
        <p className="text-center text-body2 font-body2 text-osmoverse-200">
          {t("oneClickTrading.settings.sessionPeriodScreen.description")}
        </p>

        <div className="flex w-full flex-col">
          {Periods.map(({ id, periodTranslationKey }) => (
            <Button
              key={id}
              mode="unstyled"
              className="subtitle1 -ml-2.5 flex justify-start gap-2 rounded-2xl  py-4 px-6 capitalize text-white-full hover:bg-osmoverse-900"
            >
              {t(periodTranslationKey)}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};
