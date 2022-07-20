import { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";
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

export const Step3Confirm: FunctionComponent<StepProps> = observer((props) => {
  const { createPoolConfig: config } = props;
  const { isMobile } = useWindowSize();

  const series = useMemo(() => {
    return generateSeries(
      config.assets.map((asset) => ({
        currency: asset.amountConfig.sendCurrency,
        percentage: asset.percentage,
        amount: asset.amountConfig.amount,
      }))
    );
  }, [config.assets]);

  return (
    <StepBase step={3} {...props}>
      <div className="flex flex-col gap-2.5">
        <div className="grid grid-cols-2">
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
            <div className="flex place-content-between caption md:text-xxs text-white-disabled">
              <span>Token</span>
              <span>Amount</span>
            </div>
            {config.assets.map(
              (
                { percentage, amountConfig: { sendCurrency, amount } },
                index
              ) => {
                const justCoinDenom = sendCurrency.coinDenom.includes("channel")
                  ? sendCurrency.coinDenom.split(" ").slice(0, 1).join("")
                  : sendCurrency.coinDenom;

                return (
                  <div key={sendCurrency.coinDenom}>
                    <div className="flex items-center place-content-between">
                      <div className="flex items-center">
                        <figure
                          className="rounded-full w-4 h-4 md:w-2 md:h-2 mr-3 md:mr-1"
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
                    <div className="flex items-center place-content-between">
                      {"paths" in sendCurrency ? (
                        <span className="subtitle2 md:caption md:text-sm text-iconDefault">
                          {(sendCurrency as IBCCurrency).paths
                            .map((path) => path.channelId)
                            .join(", ")}
                        </span>
                      ) : (
                        <br />
                      )}
                      <span className="body1 md:caption md:text-sm text-white-mid">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
        <div className="flex p-3.5 md:p-2.5 items-center place-content-between border border-white-faint rounded-2xl">
          <span className="md:subtitle2">Set Swap Fee</span>
          <div className="flex items-center gap-4 md:gap-1">
            <InputBox
              className="w-44 md:w-20"
              type="number"
              inputClassName="text-right text-h6 font-h6 md:subtitle1"
              currentValue={config.swapFee}
              onInput={(value) => config.setSwapFee(value)}
              placeholder=""
            />
            {isMobile ? <span className="subtitle2">%</span> : <h6>%</h6>}
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 p-3.5 md:px-12 md:caption">
          <CheckBox
            className="after:!bg-transparent after:!border-2 after:!border-iconDefault"
            isOn={config.acknowledgeFee}
            onToggle={() => {
              runInAction(() => {
                config.acknowledgeFee = !config.acknowledgeFee;
              });
            }}
          >
            {isMobile ? (
              <div className="w-2/3 mx-auto">
                I understand that creating a new pool will cost{" "}
                {POOL_CREATION_FEE}.
              </div>
            ) : (
              `I understand that creating a new pool will cost ${POOL_CREATION_FEE}.`
            )}
          </CheckBox>
        </div>
      </div>
    </StepBase>
  );
});
