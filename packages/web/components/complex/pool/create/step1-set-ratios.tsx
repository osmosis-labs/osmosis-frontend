import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent } from "react";

import { StepBase } from "~/components/complex/pool/create/step-base";
import { StepProps } from "~/components/complex/pool/create/types";
import { TokenSelect } from "~/components/control";
import { InputBox } from "~/components/input";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { useWindowSize } from "~/hooks";

export const Step1SetRatios: FunctionComponent<StepProps> = observer(
  (props) => {
    const { createPoolConfig: config } = props;
    const { isMobile } = useWindowSize();
    const { t } = useTranslation();

    return (
      <StepBase step={1} {...props}>
        <div className="flex flex-col gap-2.5">
          {config.assets.map(
            ({ amountConfig, percentage, scalingFactor }, index) => (
              <div
                key={amountConfig.sendCurrency.coinDenom}
                className="flex h-24 shrink-0 place-content-between items-center rounded-2xl border border-osmoverse-700 px-7 md:h-auto md:p-2.5"
              >
                <TokenSelect
                  selectedTokenDenom={amountConfig.sendCurrency.coinDenom}
                  tokens={config.remainingSelectableCurrencies.concat(
                    amountConfig.sendCurrency
                  )}
                  onSelect={(coinDenom) => {
                    const currency = config.remainingSelectableCurrencies.find(
                      (currency) => currency.coinDenom === coinDenom
                    );
                    if (currency) {
                      amountConfig.setSendCurrency(currency);
                    } else {
                      console.error(
                        "Unable to find currency selected in TokenSelect to be set in create pool config"
                      );
                    }
                  }}
                />
                <div className="md:subtitle1 flex items-center gap-2.5 text-h6 font-h6 md:gap-1">
                  {config.poolType === "weighted" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className={classNames({
                        hidden: config.assets.length < 2,
                      })}
                      onClick={() => config.setBalancedPercentages()}
                    >
                      {config.balancedPercentage.maxDecimals(0).toString()}
                    </Button>
                  )}
                  <InputBox
                    type="number"
                    inputClassName="text-h5 font-h5 md:subtitle1 w-32 md:w-14"
                    currentValue={
                      (config.poolType === "weighted" && percentage
                        ? percentage
                        : scalingFactor?.toString()) ?? ""
                    }
                    onInput={(value) => {
                      if (config.poolType === "weighted") {
                        config.setAssetPercentageAt(index, value);
                      } else {
                        config.setScalingFactorAt(index, value);
                      }
                    }}
                    placeholder=""
                    trailingSymbol={
                      config.poolType === "weighted" ? "%" : undefined
                    }
                    rightEntry
                  />
                </div>
              </div>
            )
          )}
          <button
            className={classNames(
              "flex shrink-0 select-none items-center gap-5 rounded-2xl border border-osmoverse-700 px-6 py-4 md:p-2.5",
              config.canAddAsset
                ? "cursor-pointer hover:border-wosmongton-200"
                : "cursor-default opacity-30"
            )}
            onClick={() => {
              const firstAsset = config.remainingSelectableCurrencies[0];
              if (firstAsset) {
                config.addAsset(firstAsset);
              }
            }}
          >
            <div className="ml-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-wosmongton-500 md:h-6 md:w-6">
              <Image
                alt="add"
                src="/icons/add.svg"
                height={isMobile ? 12 : 15}
                width={isMobile ? 12 : 15}
              />
            </div>
            <span className="subtitle1">
              {t("pools.createPool.buttonAddToken")}
            </span>
          </button>
        </div>
        <div className="flex flex-col gap-4 p-3.5 md:p-2.5">
          <div className="flex place-content-between items-center rounded-2xl">
            <span className="md:subtitle2">
              {t("pools.createPool.swapFee")}
            </span>
            <div className="flex items-center gap-4 md:gap-1">
              <InputBox
                className="w-44 md:w-20"
                type="number"
                inputClassName="text-right text-h6 font-h6 md:subtitle1"
                currentValue={config.swapFee}
                onInput={(value) => config.setSwapFee(value)}
                placeholder=""
                trailingSymbol="%"
              />
            </div>
          </div>
          {config.poolType === "stable" && (
            <div className="flex place-content-between items-center rounded-2xl">
              <span className="md:subtitle2">
                {t("pools.createPool.scalingFactorController")}
              </span>
              <div className="flex items-center gap-4 md:gap-1">
                <InputBox
                  className="w-44 md:w-20"
                  type="text"
                  inputClassName="text-right text-h6 font-h6 md:subtitle1"
                  currentValue={config.scalingFactorControllerAddress}
                  onInput={(value) =>
                    config.setScalingFactorControllerAddress(value)
                  }
                  placeholder="osmo..."
                />
              </div>
            </div>
          )}
        </div>
      </StepBase>
    );
  }
);
