import { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { Dec } from "@keplr-wallet/unit";
import { InputBox } from "../../../input";
import {
  PieChart,
  generateSeries,
  HIGHCHART_LEGEND_GRADIENTS,
} from "../../../chart";
import { StepProps } from "./types";
import { StepBase } from "./step-base";
import { IBCCurrency } from "@keplr-wallet/types";
import { CheckBox } from "../../../control";
import { POOL_CREATION_FEE } from ".";
import { useWindowSize } from "../../../../hooks";
import { useTranslation } from "react-multi-lang";

export const Step3Confirm: FunctionComponent<StepProps> = observer((props) => {
  const { createPoolConfig: config } = props;
  const { isMobile } = useWindowSize();
  const t = useTranslation();

  const series = useMemo(() => {
    return generateSeries(
      config.assets.map((asset) => ({
        currency: asset.amountConfig.sendCurrency,
        percentage:
          config.poolType === "weighted"
            ? asset.percentage ?? "1"
            : asset.scalingFactor
            ? new Dec(asset.scalingFactor)
                .quo(new Dec(config.assets.length))
                .toString()
            : "1",
        amount: asset.amountConfig.amount,
      }))
    );
  }, [config.assets]);

  return (
    <StepBase step={3} {...props}>
      <div className="flex flex-col gap-2.5">
        <div className="grid grid-cols-2 rounded-3xl bg-osmoverse-900 p-6">
          <figure
            className="mx-auto"
            style={{
              height: isMobile ? "96px" : "200px",
              width: isMobile ? "96px" : "200px",
            }}
          >
            <PieChart
              options={{
                series,
              }}
              height={isMobile ? 96 : 200}
              width={isMobile ? 96 : 200}
            />
          </figure>
          <div className="flex flex-col gap-2">
            <div className="caption flex place-content-between text-osmoverse-500 md:text-xxs">
              <span>{t("pools.createPool.token")}</span>
              <span>{t("pools.createPool.amount")}</span>
            </div>
            {config.assets.map(
              (
                {
                  percentage,
                  scalingFactor,
                  amountConfig: { sendCurrency, amount },
                },
                index
              ) => {
                const justCoinDenom = sendCurrency.coinDenom.includes("channel")
                  ? sendCurrency.coinDenom.split(" ").slice(0, 1).join("")
                  : sendCurrency.coinDenom;

                return (
                  <div key={sendCurrency.coinDenom}>
                    <div className="flex place-content-between items-center">
                      <div className="flex items-center">
                        <figure
                          className="mr-3 h-4 w-4 rounded-full md:mr-1 md:h-2 md:w-2"
                          style={{
                            background: HIGHCHART_LEGEND_GRADIENTS[index],
                          }}
                        />
                        {isMobile ? (
                          <span className="subtitle2">{justCoinDenom}</span>
                        ) : (
                          <h6>{justCoinDenom}</h6>
                        )}
                      </div>
                      {isMobile ? (
                        <span className="subtitle2">{amount.slice(0, 12)}</span>
                      ) : (
                        <h6>{amount.slice(0, 12)}</h6>
                      )}
                    </div>
                    <div className="flex place-content-between items-center">
                      {"paths" in sendCurrency ? (
                        <span className="subtitle2 md:caption text-osmoverse-500 md:text-sm">
                          {(sendCurrency as IBCCurrency).paths
                            .map((path) => path.channelId)
                            .join(", ")}
                        </span>
                      ) : (
                        <br />
                      )}
                      <span className="body1 md:caption text-osmoverse-500 md:text-sm">
                        {config.poolType === "weighted"
                          ? `${percentage}%`
                          : scalingFactor ?? "1"}
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
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
        <div className="md:caption rounded-xl bg-gradient-negative p-[2px]">
          <div className="flex items-center justify-center gap-2 rounded-xlinset bg-osmoverse-800 p-3.5 md:px-12">
            <CheckBox
              className="-top-px -left-0.5 after:!h-6 after:!w-6 after:!rounded-[10px] after:!border-2 after:!border-rust-700 after:!bg-transparent checked:after:border-none checked:after:bg-gradient-negative"
              isOn={config.acknowledgeFee}
              checkMarkIconUrl="/icons/check-mark-dark.svg"
              checkMarkClassName="top-[1px] left-0 h-6 w-6"
              onToggle={() => (config.acknowledgeFee = !config.acknowledgeFee)}
            >
              {isMobile ? (
                <div className="mx-auto w-2/3">
                  {t("pools.createPool.undersandCost", { POOL_CREATION_FEE })}
                </div>
              ) : (
                t("pools.createPool.undersandCost", { POOL_CREATION_FEE })
              )}
            </CheckBox>
          </div>
        </div>
      </div>
    </StepBase>
  );
});
