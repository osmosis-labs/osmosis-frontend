import { OneClickTradingHumanizedSessionPeriod } from "@osmosis-labs/types";
import classNames from "classnames";

import { Button } from "~/components/buttons";
import { OneClickTradingRemainingTime } from "~/components/one-click-trading/one-click-remaining-time";
import { OneClickTradingBaseScreenProps } from "~/components/one-click-trading/screens/types";
import {
  ScreenGoBackButton,
  useScreenManager,
} from "~/components/screen-manager";
import { useOneClickTradingSession, useTranslation } from "~/hooks";

export const oneClickTradingTimeMappings = {
  "1hour": "oneClickTrading.sessionPeriods.1hour",
  "1day": "oneClickTrading.sessionPeriods.1day",
  "7days": "oneClickTrading.sessionPeriods.7days",
  "30days": "oneClickTrading.sessionPeriods.30days",
};

export function getSessionPeriodTranslationKey(
  input: OneClickTradingHumanizedSessionPeriod
) {
  const mapped = oneClickTradingTimeMappings[input];
  if (!mapped) throw new Error(`No mapping for ${input}`);
  return mapped;
}

const SessionPeriods: OneClickTradingHumanizedSessionPeriod[] = [
  "1hour",
  "1day",
  "7days",
  "30days",
];

interface SessionPeriodScreenProps extends OneClickTradingBaseScreenProps {}

export const SessionPeriodScreen = ({
  transaction1CTParams,
  setTransaction1CTParams,
}: SessionPeriodScreenProps) => {
  const { t } = useTranslation();
  const { goBack } = useScreenManager();
  const { isOneClickTradingEnabled } = useOneClickTradingSession();

  return (
    <>
      <ScreenGoBackButton className="absolute left-7 top-7" />
      <div className="flex flex-col items-center gap-6 px-16 ">
        <div className="flex flex-col items-center gap-0.5">
          <h1 className="w-full text-center text-h6 font-h6 tracking-wider">
            {t("oneClickTrading.settings.sessionPeriodScreen.title")}
          </h1>
          {isOneClickTradingEnabled && (
            <OneClickTradingRemainingTime className="!text-body2 !text-osmoverse-400" />
          )}
        </div>
        <p className="text-center text-body2 font-body2 text-osmoverse-200">
          {t("oneClickTrading.settings.sessionPeriodScreen.description")}
        </p>

        <div className="flex w-full flex-col">
          {SessionPeriods.map((id) => (
            <Button
              key={id}
              mode="unstyled"
              className={classNames(
                "subtitle1 -ml-2.5 flex justify-start gap-2 rounded-2xl  px-6 py-4 text-white-full hover:bg-osmoverse-900",
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
                goBack();
              }}
            >
              {t(getSessionPeriodTranslationKey(id))}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};
