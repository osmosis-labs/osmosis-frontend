import { OneClickTradingResetPeriods } from "@osmosis-labs/types";
import classNames from "classnames";

import { Button } from "~/components/buttons";
import { OneClickTradingBaseScreenProps } from "~/components/one-click-trading/screens/types";
import { ScreenGoBackButton } from "~/components/screen-manager";
import { ExactTranslationPath, MultiLanguageT, useTranslation } from "~/hooks";

const ResetPeriods = [
  "day",
  "week",
  "month",
  "year",
] as OneClickTradingResetPeriods[];

export function getResetPeriodTranslation({
  id,
  t,
}: {
  id: OneClickTradingResetPeriods;
  t: MultiLanguageT;
}): string {
  const translationKey: ExactTranslationPath = `oneClickTrading.settings.resetPeriodScreen.periods.${id}`;
  const translation = t(translationKey);

  if (translation === translationKey) {
    throw new Error(`Translation for ${id} is not found`);
  }

  return translation;
}

interface ResetPeriodScreenProps extends OneClickTradingBaseScreenProps {}

export const ResetPeriodScreen = ({
  transaction1CTParams,
  setTransaction1CTParams,
}: ResetPeriodScreenProps) => {
  const { t } = useTranslation();

  return (
    <>
      <ScreenGoBackButton className="absolute top-7 left-7" />
      <div className="flex flex-col items-center gap-6 px-16">
        <h1 className="w-full text-center text-h6 font-h6 tracking-wider">
          {t("oneClickTrading.settings.resetPeriodScreen.title")}
        </h1>
        <p className="text-center text-body2 font-body2 text-osmoverse-200">
          {t("oneClickTrading.settings.resetPeriodScreen.description")}
        </p>

        <div className="flex w-full flex-col">
          {ResetPeriods.map((id) => (
            <Button
              key={id}
              mode="unstyled"
              className={classNames(
                "subtitle1 -ml-2.5 flex justify-start gap-2 rounded-2xl  py-4 px-6 capitalize text-white-full hover:bg-osmoverse-900",
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
              }}
            >
              {getResetPeriodTranslation({ id, t })}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};
