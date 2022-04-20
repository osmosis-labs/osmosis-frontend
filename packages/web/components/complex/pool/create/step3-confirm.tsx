import { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
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

export const Step3Confirm: FunctionComponent<StepProps> = observer((props) => {
  const { createPoolConfig: config } = props;
  const series = useMemo(() => {
    return generateSeries(
      config.assets.map((asset) => ({
        currency: asset.amountConfig.currency,
        percentage: asset.percentage,
        amount: asset.amountConfig.amount,
      }))
    );
  }, [config.assets]);

  return (
    <StepBase step={3} {...props}>
      <div className="flex flex-col gap-2.5">
        <div className="grid grid-cols-2">
          <figure style={{ height: "200px", width: "200px" }}>
            <PieChart
              options={{
                series,
              }}
            />
          </figure>
          <div className="flex flex-col gap-2">
            <div className="flex place-content-between caption text-white-disabled">
              <span>Token</span>
              <span>Amount</span>
            </div>
            {config.assets.map(
              ({ percentage, amountConfig: { currency, amount } }, index) => (
                <div key={currency.coinDenom}>
                  <div className="flex items-center place-content-between">
                    <div className="flex items-center">
                      <figure
                        className="rounded-full w-4 h-4 mr-3"
                        style={{
                          background: HIGHCHART_LEGEND_GRADIENTS[index],
                        }}
                      />
                      <h6>{currency.coinDenom}</h6>
                    </div>
                    <h6>{amount}</h6>
                  </div>
                  <div className="flex items-center place-content-between">
                    {"paths" in currency ? (
                      <span className="subtitle2 text-iconDefault">
                        {(currency as IBCCurrency).paths
                          .map((path) => path.channelId)
                          .join(", ")}
                      </span>
                    ) : (
                      <br />
                    )}
                    <span className="body1 text-white-mid">{percentage}%</span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
        <div className="flex p-3.5 items-center place-content-between border border-white-faint rounded-2xl">
          <span>Set Swap Fee</span>
          <div className="flex items-center gap-4">
            <InputBox
              className="w-44"
              type="number"
              inputClassName="text-right text-h6 font-h6"
              currentValue={config.swapFee}
              onInput={(value) => config.setSwapFee(value)}
              placeholder=""
            />
            <h6>%</h6>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 p-3.5">
          <CheckBox
            className="after:!bg-transparent after:!border-2 after:!border-iconDefault"
            isOn={config.acknowledgeFee}
            onToggle={() => {
              config.acknowledgeFee = !config.acknowledgeFee;
            }}
          >
            I understand that creating a new pool will cost {POOL_CREATION_FEE}.
          </CheckBox>
        </div>
      </div>
    </StepBase>
  );
});
