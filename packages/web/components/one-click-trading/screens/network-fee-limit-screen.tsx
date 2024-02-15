import { DefaultGasPriceStep, isNil } from "@osmosis-labs/utils";
import classNames from "classnames";
import { useEffect, useState } from "react";

import { Button } from "~/components/buttons";
import { InputBox } from "~/components/input";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { OneClickTradingBaseScreenProps } from "~/components/one-click-trading/screens/types";
import { IS_TESTNET } from "~/config";
import { useTranslation } from "~/hooks";
import { arrayOfLength } from "~/utils/array";
import { api, RouterOutputs } from "~/utils/trpc";

interface PriceStep {
  id: string;
  key: keyof RouterOutputs["edge"]["assets"]["getFeeTokenGasPriceStep"];
  displayTranslationKey: string;
  recommended?: boolean;
}

const PriceSteps: PriceStep[] = [
  {
    id: "low",
    key: "low",
    displayTranslationKey: "oneClickTrading.settings.networkFeeLimitScreen.low",
  },
  {
    id: "average",
    key: "average",
    recommended: true,
    displayTranslationKey:
      "oneClickTrading.settings.networkFeeLimitScreen.average",
  },
  {
    id: "high",
    key: "high",
    displayTranslationKey:
      "oneClickTrading.settings.networkFeeLimitScreen.high",
  },
];

interface NetworkFeeLimitScreenProps extends OneClickTradingBaseScreenProps {}

export const NetworkFeeLimitScreen = ({
  goBackButton,
}: NetworkFeeLimitScreenProps) => {
  const { t } = useTranslation();

  const [networkFeeLimit, setNetworkFeeLimit] = useState<string | undefined>();

  const { data: steps, isLoading } =
    api.edge.assets.getFeeTokenGasPriceStep.useQuery({
      chainId: IS_TESTNET ? "osmo-test-5" : "osmosis-1",
    });

  useEffect(() => {
    if (steps && isNil(networkFeeLimit)) {
      setNetworkFeeLimit(steps.average.toString());
    }
  }, [networkFeeLimit, steps]);

  return (
    <>
      {goBackButton}
      <div className="flex flex-col items-center gap-6 px-16 ">
        <h1 className="w-full text-center text-h6 font-h6 tracking-wider">
          {t("oneClickTrading.settings.networkFeeLimitScreen.title")}
        </h1>
        <p className="text-center text-body2 font-body2 text-osmoverse-200">
          {t("oneClickTrading.settings.networkFeeLimitScreen.description")}
        </p>

        <div className="flex w-full gap-2">
          {isLoading ? (
            <>
              {arrayOfLength(3).map((_, i) => (
                <SkeletonLoader className="flex-1 py-4 px-2" key={i}>
                  <p aria-hidden>test</p>
                  <p aria-hidden>test</p>
                </SkeletonLoader>
              ))}
            </>
          ) : (
            <>
              {(PriceSteps ?? DefaultGasPriceStep).map((step) => {
                const value = (steps ?? DefaultGasPriceStep)[step.key];
                return (
                  <Button
                    key={step.id}
                    mode="unstyled"
                    className={classNames(
                      "subtitle1 flex flex-1 flex-col items-center gap-2 rounded-lg bg-osmoverse-700 !py-4 !px-2 text-white-full hover:bg-osmoverse-600",
                      {
                        "border-2 border-osmoverse-200":
                          String(value) === networkFeeLimit,
                      }
                    )}
                    onClick={() => {
                      setNetworkFeeLimit(String(value));
                    }}
                  >
                    <p className="capitalize">
                      {t(step.displayTranslationKey)}
                    </p>
                    {step.recommended && (
                      <p className="caption text-osmoverse-300">
                        {t(
                          "oneClickTrading.settings.networkFeeLimitScreen.recommended"
                        )}
                      </p>
                    )}
                  </Button>
                );
              })}
            </>
          )}
        </div>

        <SkeletonLoader className="w-full" isLoaded={!isLoading}>
          <InputBox
            rightEntry
            currentValue={networkFeeLimit}
            onInput={(nextValue) => {
              setNetworkFeeLimit(nextValue);
            }}
            trailingSymbol={
              <span className="ml-2 text-body1 font-body1 text-osmoverse-300">
                OSMO
              </span>
            }
          />
        </SkeletonLoader>

        <p className="text-center text-caption font-caption text-osmoverse-200">
          {t("oneClickTrading.settings.networkFeeLimitScreen.info")}
        </p>
      </div>
    </>
  );
};
