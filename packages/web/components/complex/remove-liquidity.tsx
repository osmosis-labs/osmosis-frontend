import { Dec } from "@keplr-wallet/unit";
import { ObservableRemoveLiquidityConfig } from "@osmosis-labs/stores";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent, ReactNode } from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";
import { Slider } from "~/components/control";
import { CustomClasses } from "~/components/types";
import { useStore } from "~/stores";

export const RemoveLiquidity: FunctionComponent<
  {
    removeLiquidityConfig: ObservableRemoveLiquidityConfig;
    actionButton: ReactNode;
  } & CustomClasses
> = observer(({ className, removeLiquidityConfig, actionButton }) => {
  const { priceStore } = useStore();
  const t = useTranslation();

  return (
    <>
      <div
        className={classNames(
          "mx-auto flex w-[420px] flex-col gap-9 text-center md:w-full md:gap-5",
          className
        )}
      >
        <div className="flex flex-col gap-1">
          <h2 className="mt-12 md:mt-7">{`${removeLiquidityConfig.computePoolShareValueWithPercentage(
            priceStore
          )}`}</h2>
          <h5 className="text-osmoverse-100 md:text-h6 md:font-h6">
            {t("removeLiquidity.sharesAmount", {
              shares: removeLiquidityConfig.poolShareWithPercentage
                .trim(true)
                .hideDenom(true)
                .toString(),
            })}
          </h5>
        </div>
        <div className="flex flex-wrap place-content-around items-center gap-4 rounded-xl border border-osmoverse-600 py-2 px-3 text-osmoverse-300">
          {removeLiquidityConfig.poolShareAssetsWithPercentage.map((asset) => (
            <div
              className="flex items-center gap-2"
              key={asset.currency.coinDenom}
            >
              {asset.currency.coinImageUrl && (
                <Image
                  alt="token icon"
                  src={asset.currency.coinImageUrl}
                  height={16}
                  width={16}
                />
              )}
              <span className="max-w-xs truncate">
                {asset.trim(true).toString()}
              </span>
            </div>
          ))}
        </div>
        <Slider
          className="my-8 w-full"
          currentValue={removeLiquidityConfig.percentage}
          onInput={(value) =>
            removeLiquidityConfig.setPercentage(value.toString())
          }
          min={0}
          max={100}
          step={1}
        />
        <div className="mb-14 grid h-9 w-full grid-cols-4 gap-5 md:mb-6 md:gap-1">
          <Button
            className="!h-full"
            mode="amount"
            onClick={() => removeLiquidityConfig.setPercentage("25")}
            disabled={removeLiquidityConfig.poolShareWithPercentage
              .toDec()
              .equals(new Dec(0))}
          >
            25%
          </Button>
          <Button
            className="!h-full"
            mode="amount"
            onClick={() => removeLiquidityConfig.setPercentage("50")}
            disabled={removeLiquidityConfig.poolShareWithPercentage
              .toDec()
              .equals(new Dec(0))}
          >
            50%
          </Button>
          <Button
            className="!h-full"
            mode="amount"
            onClick={() => removeLiquidityConfig.setPercentage("75")}
            disabled={removeLiquidityConfig.poolShareWithPercentage
              .toDec()
              .equals(new Dec(0))}
          >
            75%
          </Button>
          <Button
            className="!h-full"
            mode="amount"
            onClick={() => removeLiquidityConfig.setPercentage("100")}
            disabled={removeLiquidityConfig.poolShareWithPercentage
              .toDec()
              .equals(new Dec(0))}
          >
            {t("components.MAX")}
          </Button>
        </div>
      </div>
      {actionButton}
    </>
  );
});
