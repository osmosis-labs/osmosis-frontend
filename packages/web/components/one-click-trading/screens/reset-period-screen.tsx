import { OneClickTradingResetPeriods } from "@osmosis-labs/types";
import classNames from "classnames";

import { Button } from "~/components/buttons";
import { OneClickTradingBaseScreenProps } from "~/components/one-click-trading/screens/types";
import {
  ScreenGoBackButton,
  useScreenManager,
} from "~/components/screen-manager";
import { useTranslation } from "~/hooks";

const ResetPeriods = [
  "day",
  "week",
  "month",
  "year",
] as OneClickTradingResetPeriods[];

export function getResetPeriodTranslationKey(
  id: OneClickTradingResetPeriods
): string {
  switch (id) {
    case "day":
      return "oneClickTrading.settings.resetPeriodScreen.periods.day";
    case "week":
      return "oneClickTrading.settings.resetPeriodScreen.periods.week";
    case "month":
      return "oneClickTrading.settings.resetPeriodScreen.periods.month";
    case "year":
      return "oneClickTrading.settings.resetPeriodScreen.periods.year";
    default:
      throw new Error(`No mapping for ${id}`);
  }
}

interface ResetPeriodScreenProps extends OneClickTradingBaseScreenProps {}

export const ResetPeriodScreen = ({
  transaction1CTParams,
  setTransaction1CTParams,
}: ResetPeriodScreenProps) => {
  const { t } = useTranslation();
  const { goBack } = useScreenManager();

  return (
    <>
      <ScreenGoBackButton className="absolute left-7 top-7" />
      <div className="flex flex-col items-center gap-6 px-16">
        <h1 className="w-full text-center font-h6 text-h6 tracking-wider">
          {t("oneClickTrading.settings.resetPeriodScreen.title")}
        </h1>
        <p className="text-center font-body2 text-body2 text-osmoverse-200">
          {t("oneClickTrading.settings.resetPeriodScreen.description")}
        </p>

        <div className="flex w-full flex-col">
          {ResetPeriods.map((id) => (
            <Button
              key={id}
              mode="unstyled"
              className={classNames(
                "subtitle1 -ml-2.5 flex justify-start gap-2 rounded-2xl  px-6 py-4 capitalize text-white-full hover:bg-osmoverse-900",
                {
                  "bg-osmoverse-900": transaction1CTParams?.resetPeriod === id,
                }
              )}
              onClick={() => {
                setTransaction1CTParams((prev) => {
                  if (!prev) throw new Error("Transaction params is not set");
                  return {
                    ...prev,
                    resetPeriod: id,
                  };
                });
                goBack();
              }}
            >
              {t(getResetPeriodTranslationKey(id))}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};
