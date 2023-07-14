import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { useWindowSize } from "../../../../hooks";
import { InputBox } from "../../../input";
import { StepBase } from "./step-base";
import { StepProps } from "./types";

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
                className="flex h-24 place-content-between items-center rounded-2xl border border-white-faint px-7 md:h-fit md:p-2"
              >
                <div className="flex items-center">
                  {currency.coinImageUrl && (
                    <div className="flex h-14 w-14 items-center overflow-hidden md:h-7 md:w-7">
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
                    <div className="md:caption text-sm font-semibold text-osmoverse-400 md:text-xs">
                      {config.poolType === "weighted"
                        ? `${percentage}%`
                        : scalingFactor ?? "1"}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex place-content-end items-center gap-1">
                    <span className="caption">
                      {t("pools.createPool.available")}
                    </span>
                    <span
                      className="caption cursor-pointer text-wosmongton-300"
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
