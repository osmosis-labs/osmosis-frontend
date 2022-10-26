import { FunctionComponent, ReactNode } from "react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { Dec } from "@keplr-wallet/unit";
import { ObservableRemoveLiquidityConfig } from "@osmosis-labs/stores";
import { Slider } from "../../components/control/";
import { useWindowSize } from "../../hooks";
import { CustomClasses } from "../types";

export const RemoveLiquidity: FunctionComponent<
  {
    removeLiquidityConfig: ObservableRemoveLiquidityConfig;
    actionButton: ReactNode;
  } & CustomClasses
> = observer(({ className, removeLiquidityConfig, actionButton }) => {
  const { isMobile } = useWindowSize();

  return (
    <div className={classNames("flex flex-col text-center", className)}>
      {isMobile ? (
        <h5 className="mt-5">{`${removeLiquidityConfig.percentage}%`}</h5>
      ) : (
        <h2 className="mt-12">{`${removeLiquidityConfig.percentage}%`}</h2>
      )}
      <div className="caption text-white-disabled">
        ~
        {removeLiquidityConfig.poolShareAssetsWithPercentage.map(
          (asset, index) => (
            <span key={asset.currency.coinDenom}>
              {asset.toString()}
              {index !==
                removeLiquidityConfig.poolShareAssetsWithPercentage.length -
                  1 && " : "}
            </span>
          )
        )}
      </div>
      <Slider
        className="w-full my-8"
        type="plain"
        currentValue={removeLiquidityConfig.percentage}
        onInput={(value) =>
          removeLiquidityConfig.setPercentage(value.toString())
        }
        disabled={removeLiquidityConfig.poolShareWithPercentage
          .toDec()
          .equals(new Dec(0))}
        min={0}
        max={100}
        step={1}
      />
      <div className="grid grid-cols-4 gap-5 h-9 w-full md:mb-6 mb-14">
        <button
          onClick={() => removeLiquidityConfig.setPercentage("25")}
          disabled={removeLiquidityConfig.poolShareWithPercentage
            .toDec()
            .equals(new Dec(0))}
          className="button w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75 disabled:opacity-30"
        >
          <p className="text-secondary-200">25%</p>
        </button>
        <button
          onClick={() => removeLiquidityConfig.setPercentage("50")}
          disabled={removeLiquidityConfig.poolShareWithPercentage
            .toDec()
            .equals(new Dec(0))}
          className="button w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75 disabled:opacity-30"
        >
          <p className="text-secondary-200">50%</p>
        </button>
        <button
          onClick={() => removeLiquidityConfig.setPercentage("75")}
          disabled={removeLiquidityConfig.poolShareWithPercentage
            .toDec()
            .equals(new Dec(0))}
          className="button w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75 disabled:opacity-30"
        >
          <p className="text-secondary-200">75%</p>
        </button>
        <button
          onClick={() => removeLiquidityConfig.setPercentage("100")}
          disabled={removeLiquidityConfig.poolShareWithPercentage
            .toDec()
            .equals(new Dec(0))}
          className="button w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75 disabled:opacity-30"
        >
          <p className="text-secondary-200">MAX</p>
        </button>
      </div>
      {actionButton}
    </div>
  );
});
