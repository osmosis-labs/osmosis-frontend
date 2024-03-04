import { OneClickTradingHumanizedSessionPeriod } from "@osmosis-labs/types";
import classNames from "classnames";

import { Button } from "~/components/buttons";
import { OneClickTradingBaseScreenProps } from "~/components/one-click-trading/screens/types";
import { ScreenGoBackButton } from "~/components/screen-manager";
import { ExactTranslationPath, MultiLanguageT, useTranslation } from "~/hooks";

export function getSessionPeriodTranslationKey({
  id,
  t,
}: {
  id: OneClickTradingHumanizedSessionPeriod;
  t: MultiLanguageT;
}): string {
  const translationKey: ExactTranslationPath = `oneClickTrading.settings.sessionPeriodScreen.periods.${id}`;
  const translation = t(translationKey);

  if (translation === translationKey) {
    throw new Error(`Translation for ${id} is not found`);
  }

  return translation;
}

const SessionPeriods: OneClickTradingHumanizedSessionPeriod[] = [
  "10min",
  "30min",
  "1hour",
  "3hours",
  "12hours",
];

interface SessionPeriodScreenProps extends OneClickTradingBaseScreenProps {}

export const SessionPeriodScreen = ({
  transaction1CTParams,
  setTransaction1CTParams,
}: SessionPeriodScreenProps) => {
  const { t } = useTranslation();

  return (
    <>
      <ScreenGoBackButton className="absolute top-7 left-7" />
      <div className="flex flex-col items-center gap-6 px-16 ">
        <h1 className="w-full text-center text-h6 font-h6 tracking-wider">
          {t("oneClickTrading.settings.sessionPeriodScreen.title")}
        </h1>
        <p className="text-center text-body2 font-body2 text-osmoverse-200">
          {t("oneClickTrading.settings.sessionPeriodScreen.description")}
        </p>

        <div className="flex w-full flex-col">
          {SessionPeriods.map((id) => (
            <Button
              key={id}
              mode="unstyled"
              className={classNames(
                "subtitle1 -ml-2.5 flex justify-start gap-2 rounded-2xl  py-4 px-6 capitalize text-white-full hover:bg-osmoverse-900",
                {
                  "bg-osmoverse-900":
                    transaction1CTParams?.sessionPeriod.end === id,
                }
              )}
              onClick={() => {
                setTransaction1CTParams((prev) => {
                  if (!prev) throw new Error("Transaction params is not set");
                  return {
                    ...prev,
                    sessionPeriod: {
                      end: id,
                    },
                  };
                });
              }}
            >
              {getSessionPeriodTranslationKey({ id, t })}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};
