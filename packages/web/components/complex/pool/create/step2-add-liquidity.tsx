import Image from "next/image";
import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { InputBox } from "../../../input";
import { StepBase } from "./step-base";
import { StepProps } from "./types";
import { useWindowSize } from "../../../../hooks";
import { useTranslation } from "react-multi-lang";

export const Step2AddLiquidity: FunctionComponent<StepProps> = observer(
  (props) => {
    const { createPoolConfig: config } = props;
    const { isMobile } = useWindowSize();
    const t = useTranslation();

    return (
      <StepBase step={2} {...props}>
        <div className="flex flex-col gap-2.5">
          {config.assets.map(({ percentage, scalingFactor, amountConfig }) => {
            const currency = amountConfig.sendCurrency;

            const justCoinDenom = currency.coinDenom.includes("channel")
              ? currency.coinDenom.split(" ").slice(0, 1).join("")
              : currency.coinDenom;

            return (
              <div
                key={amountConfig.sendCurrency.coinDenom}
                className="h-24 md:h-fit flex px-7 md:p-2 items-center place-content-between border border-white-faint rounded-2xl"
              >
                <div className="flex items-center">
                  {currency.coinImageUrl && (
                    <div className="flex items-center w-14 h-14 md:h-7 md:w-7 overflow-hidden">
                      <Image
                        src={currency.coinImageUrl}
                        alt="token icon"
                        width={isMobile ? 30 : 44}
                        height={isMobile ? 30 : 44}
                      />
                    </div>
                  )}
                  <div className="flex flex-col place-content-evenly">
                    {isMobile ? (
                      <span className="subtitle2">{justCoinDenom}</span>
                    ) : (
                      <h5>{justCoinDenom}</h5>
                    )}
                    <div className="text-osmoverse-400 text-sm md:text-xs md:caption font-semibold">
                      {config.poolType === "weighted"
                        ? `${percentage}%`
                        : scalingFactor ?? "1"}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center place-content-end gap-1">
                    <span className="caption">
                      {t("pools.createPool.available")}
                    </span>
                    <span
                      className="caption text-wosmongton-300 cursor-pointer"
                      onClick={() => amountConfig.setIsMax(true)}
                    >
                      {config.queryBalances
                        .getQueryBech32Address(config.sender)
                        .getBalanceFromCurrency(amountConfig.sendCurrency)
                        .maxDecimals(6)
                        .toString()}
                    </span>
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
