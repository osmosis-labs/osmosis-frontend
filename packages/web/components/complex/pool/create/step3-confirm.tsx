import { IBCCurrency } from "@keplr-wallet/types";
import { Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useMemo } from "react";

import {
  generateCoinProportionSeries,
  HIGHCHART_LEGEND_GRADIENTS,
  PieChart,
} from "~/components/chart";
import { POOL_CREATION_FEE } from "~/components/complex/pool/create";
import { StepBase } from "~/components/complex/pool/create/step-base";
import { StepProps } from "~/components/complex/pool/create/types";
import { Checkbox } from "~/components/ui/checkbox";
import { useTranslation } from "~/hooks";
import { useWindowSize } from "~/hooks";

export const Step3Confirm: FunctionComponent<StepProps> = observer((props) => {
  const { createPoolConfig: config } = props;
  const { isMobile } = useWindowSize();
  const { t } = useTranslation();

  const series = useMemo(() => {
    return generateCoinProportionSeries(
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
  }, [config.assets, config.poolType]);

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
        <div className="md:caption rounded-xl bg-gradient-negative p-[2px]">
          <div className="flex items-center justify-center gap-2 rounded-xlinset bg-osmoverse-800 p-3.5 md:px-12">
            <Checkbox
              variant="destructive"
              checked={config.acknowledgeFee}
              onClick={() => (config.acknowledgeFee = !config.acknowledgeFee)}
            />
            <label className="cursor-pointer pl-3 md:pl-1">
              {isMobile ? (
                <div className="mx-auto w-2/3">
                  {t("pools.createPool.undersandCost", { POOL_CREATION_FEE })}
                </div>
              ) : (
                t("pools.createPool.undersandCost", { POOL_CREATION_FEE })
              )}
            </label>
          </div>
        </div>
      </div>
    </StepBase>
  );
});
