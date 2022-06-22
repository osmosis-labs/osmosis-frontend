import Image from "next/image";
import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { InputBox } from "../../../input";
import { Button } from "../../../buttons";
import { StepBase } from "./step-base";
import { StepProps } from "./types";
import { useWindowSize } from "../../../../hooks";

export const Step2AddLiquidity: FunctionComponent<StepProps> = observer(
  (props) => {
    const { createPoolConfig: config } = props;
    const { isMobile } = useWindowSize();

    return (
      <StepBase step={2} {...props}>
        <div className="flex flex-col gap-2.5">
          {config.assets.map(({ percentage, amountConfig }) => {
            const currency = amountConfig.sendCurrency;

            const justCoinDenom = currency.coinDenom.includes("channel")
              ? currency.coinDenom.split(" ").slice(0, 1).join("")
              : currency.coinDenom;

            return (
              <div
                key={amountConfig.sendCurrency.coinDenom}
                className="h-24 md:h-fit flex px-7 md:p-2 items-center place-content-between border border-white-faint rounded-2xl"
              >
                <div className="flex items-center group">
                  <div className="w-14 h-14 md:h-9 md:w-9 rounded-full border border-enabledGold flex items-center justify-center shrink-0 mr-3">
                    {currency.coinImageUrl && (
                      <div className="w-11 h-11 md:h-7 md:w-7 rounded-full overflow-hidden">
                        <Image
                          src={currency.coinImageUrl}
                          alt="token icon"
                          className="rounded-full"
                          width={isMobile ? 30 : 44}
                          height={isMobile ? 30 : 44}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col place-content-evenly">
                    {isMobile ? (
                      <span className="subtitle2">{justCoinDenom}</span>
                    ) : (
                      <h5>{justCoinDenom}</h5>
                    )}
                    <div className="text-iconDefault text-sm md:text-xs md:caption font-semibold">
                      {percentage}%
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center place-content-end gap-2.5">
                    <span className="subtitle2 md:text-xxs text-white-mid">
                      Balance:{" "}
                      {config.queryBalances
                        .getQueryBech32Address(config.sender)
                        .getBalanceFromCurrency(amountConfig.sendCurrency)
                        .maxDecimals(6)
                        .toString()}
                    </span>
                    <Button
                      className="w-11 h-6 md:w-8 md:h-4 caption"
                      type="outline"
                      size="xs"
                      onClick={() => amountConfig.setFraction(1)}
                    >
                      {isMobile ? <span className="text-xxs">MAX</span> : "MAX"}
                    </Button>
                  </div>
                  <div className="flex place-content-end items-center gap-2.5">
                    <InputBox
                      className="w-44 md:w-20"
                      type="number"
                      inputClassName="text-right text-h6 font-h6 md:subtitle1"
                      currentValue={amountConfig.amount}
                      onInput={(value) => amountConfig.setAmount(value)}
                      placeholder=""
                    />
                    {!isMobile && <h6>{justCoinDenom}</h6>}
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
