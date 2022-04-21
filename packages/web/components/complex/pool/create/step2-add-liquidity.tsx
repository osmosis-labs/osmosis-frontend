import Image from "next/image";
import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { InputBox } from "../../../input";
import { Button } from "../../../buttons";
import { StepBase } from "./step-base";
import { StepProps } from "./types";

export const Step2AddLiquidity: FunctionComponent<StepProps> = observer(
  (props) => {
    const { createPoolConfig: config } = props;
    return (
      <StepBase step={2} {...props}>
        <div className="flex flex-col gap-2.5">
          {config.assets.map(({ percentage, amountConfig }) => {
            const currency = amountConfig.currency;

            return (
              <div
                key={amountConfig.currency.coinDenom}
                className="h-24 flex px-7 items-center place-content-between border border-white-faint rounded-2xl"
              >
                <div className="flex items-center group">
                  <div className="w-14 h-14 rounded-full border border-enabledGold flex items-center justify-center shrink-0 mr-3">
                    {currency.coinImageUrl && (
                      <div className="w-11 h-11 rounded-full">
                        <Image
                          src={currency.coinImageUrl}
                          alt="token icon"
                          className="rounded-full"
                          width={44}
                          height={44}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <h5 className="text-white-full">{currency.coinDenom}</h5>
                    <div className="text-iconDefault text-sm font-semibold">
                      {percentage}%
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex place-content-end gap-2.5">
                    <span className="subtitle2 text-white-mid">
                      Balance:{" "}
                      {config.queryBalances
                        .getQueryBech32Address(config.sender)
                        .getBalanceFromCurrency(amountConfig.currency)
                        .toString()}
                    </span>
                    <Button
                      className="w-11 h-6 caption"
                      type="outline"
                      size="xs"
                      onClick={() => amountConfig.setFraction(1)}
                    >
                      MAX
                    </Button>
                  </div>
                  <div className="flex place-content-end items-center gap-2.5">
                    <InputBox
                      className="w-44"
                      type="number"
                      inputClassName="text-right text-h6 font-h6"
                      currentValue={amountConfig.amount}
                      onInput={(value) => amountConfig.setAmount(value)}
                      placeholder=""
                    />
                    <h6>{currency.coinDenom}</h6>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </StepBase>
    );
  }
);
