import Image from "next/image";
import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { TokenSelect } from "../../../control";
import { InputBox } from "../../../input";
import { StepProps } from "./types";
import { StepBase } from "./step-base";

export const Step1SetRatios: FunctionComponent<StepProps> = observer(
  (props) => {
    const { createPoolConfig: config } = props;

    return (
      <StepBase step={1} {...props}>
        <div className="flex flex-col gap-2.5">
          {config.assets.map(({ amountConfig, percentage }, index) => (
            <div
              key={amountConfig.currency.coinDenom}
              className="h-24 flex px-7 items-center place-content-between border border-white-faint rounded-2xl"
            >
              <TokenSelect
                selectedTokenDenom={amountConfig.currency.coinDenom}
                tokens={config.sendableCurrencies}
                onSelect={(token) => {
                  const currency = config.remainingSelectableCurrencies.find(
                    (currency) => currency.coinDenom === token.coinDenom
                  );
                  if (currency) {
                    amountConfig.setCurrency(currency);
                  }
                }}
              />
              <div className="flex items-center gap-2.5">
                <InputBox
                  inputClassName="text-right text-h6 font-h6 w-32"
                  currentValue={percentage}
                  onInput={(value) => config.setAssetPercentageAt(index, value)}
                  placeholder=""
                />
                <h5>%</h5>
              </div>
            </div>
          ))}
          <div
            className={classNames(
              "h-24 flex gap-5 px-7 items-center border border-white-faint rounded-2xl",
              config.canAddAsset
                ? "hover:border-secondary-200 cursor-pointer"
                : "opacity-30"
            )}
            onClick={() => {
              const unusedAsset = config.remainingSelectableCurrencies.find(
                (_, index) => index === 0
              );
              if (unusedAsset) {
                config.addAsset(unusedAsset);
              }
            }}
          >
            <div className="bg-primary-200 h-[36px] rounded-full">
              <Image alt="add" src="/icons/add.svg" height={36} width={36} />
            </div>
            <h6 className="select-none">Add new token</h6>
          </div>
        </div>
      </StepBase>
    );
  }
);
