import Image from "next/image";
import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { TokenSelect } from "../../../control";
import { InputBox } from "../../../input";
import { StepProps } from "./types";
import { StepBase } from "./step-base";
import { useWindowSize } from "../../../../hooks";
import { Button } from "../../../buttons";

export const Step1SetRatios: FunctionComponent<StepProps> = observer(
  (props) => {
    const { createPoolConfig: config } = props;
    const { isMobile } = useWindowSize();

    return (
      <StepBase step={1} {...props}>
        <div className="flex flex-col gap-2.5">
          {config.assets.map(({ amountConfig, percentage }, index) => (
            <div
              key={amountConfig.sendCurrency.coinDenom}
              className="h-24 md:h-auto flex px-7 md:p-2.5 items-center place-content-between border border-white-faint rounded-2xl"
            >
              <TokenSelect
                selectedTokenDenom={amountConfig.sendCurrency.coinDenom}
                tokens={config.sendableCurrencies}
                onSelect={(coinDenom) => {
                  const currency = config.remainingSelectableCurrencies.find(
                    (currency) => currency.coinDenom === coinDenom
                  );
                  if (currency) {
                    amountConfig.setSendCurrency(currency);
                  }
                }}
                isMobile={isMobile}
              />
              <div className="flex items-center md:gap-1 gap-2.5 text-h6 font-h6 md:subtitle1">
                <Button
                  className={classNames("!h-full md:p-1 md:py-0", {
                    hidden: config.assets.length < 2,
                  })}
                  color="secondary"
                  type="outline"
                  size="xs"
                  onClick={() => config.setBalancedPercentages()}
                >
                  {config.balancedPercentage.maxDecimals(0).toString()}
                </Button>
                <InputBox
                  type="number"
                  inputClassName="text-right text-h6 font-h6 md:subtitle1 w-32 md:w-14"
                  currentValue={percentage}
                  onInput={(value) => config.setAssetPercentageAt(index, value)}
                  placeholder=""
                />
                %
              </div>
            </div>
          ))}
          <button
            className={classNames(
              "h-24 md:h-auto flex gap-5 md:p-2.5 px-7 items-center border border-white-faint rounded-2xl select-none",
              config.canAddAsset
                ? "hover:border-secondary-200 cursor-pointer"
                : "opacity-30"
            )}
            onClick={() => {
              const unusedAsset = config.remainingSelectableCurrencies.find(
                () => true
              );
              if (unusedAsset) {
                config.addAsset(unusedAsset);
              }
            }}
          >
            <div className="bg-primary-200 h-9 md:h-6 ml-1.5 rounded-full">
              <Image
                alt="add"
                src="/icons/add.svg"
                height={isMobile ? 24 : 36}
                width={isMobile ? 24 : 36}
              />
            </div>
            {isMobile ? (
              <span className="subtitle1">Add new token</span>
            ) : (
              <h6>Add new token</h6>
            )}
          </button>
        </div>
      </StepBase>
    );
  }
);
