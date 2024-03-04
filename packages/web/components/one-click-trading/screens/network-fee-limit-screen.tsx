import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { trimZerosFromEnd } from "@osmosis-labs/stores";
import { DefaultGasPriceStep } from "@osmosis-labs/utils";
import classNames from "classnames";
import { useState } from "react";

import { Button } from "~/components/buttons";
import { InputBox } from "~/components/input";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { OneClickTradingBaseScreenProps } from "~/components/one-click-trading/screens/types";
import { ScreenGoBackButton } from "~/components/screen-manager";
import { useTranslation } from "~/hooks";
import { arrayOfLength } from "~/utils/array";
import { api, RouterOutputs } from "~/utils/trpc";

interface PriceStep {
  id: string;
  key: keyof RouterOutputs["edge"]["oneClickTrading"]["getNetworkFeeLimitStep"];
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
  transaction1CTParams,
  setTransaction1CTParams,
}: NetworkFeeLimitScreenProps) => {
  const { t } = useTranslation();

  const [networkFeeLimit, setNetworkFeeLimit] = useState<string>(
    trimZerosFromEnd(transaction1CTParams.networkFeeLimit.toDec().toString())
  );

  const stepAsset = transaction1CTParams.networkFeeLimit.currency;

  const { data: steps, isLoading } =
    api.edge.oneClickTrading.getNetworkFeeLimitStep.useQuery();

  return (
    <>
      <ScreenGoBackButton
        onClick={() => {
          setTransaction1CTParams((prev) => {
            if (!prev) throw new Error("transaction1CTParams is undefined");

            return {
              ...prev,
              networkFeeLimit: new CoinPretty(
                stepAsset,
                new Dec(networkFeeLimit).mul(
                  DecUtils.getTenExponentN(stepAsset.coinDecimals)
                )
              ),
            };
          });
        }}
        className="absolute top-7 left-7"
      />
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
                const rawValue = (steps ?? DefaultGasPriceStep)[step.key];
                const value =
                  rawValue instanceof CoinPretty
                    ? trimZerosFromEnd(rawValue.toDec().toString())
                    : rawValue;
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
                {stepAsset?.coinDenom}
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
