import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { ObservableRemoveLiquidityConfig } from "@osmosis-labs/stores";
import { Slider } from "../../control";
import { Button } from "../../buttons";
import { Error } from "../../alert";

export interface Props {
  removeLiquidityConfig: ObservableRemoveLiquidityConfig;
  onRemoveLiquidity: () => void;
}

export const RemoveLiquidity: FunctionComponent<Props> = observer(
  ({ removeLiquidityConfig: config, onRemoveLiquidity }) => (
    <div className="flex flex-col gap-3 text-center">
      <h2
        className={classNames("mt-12", {
          "opacity-30": config.error !== undefined,
        })}
      >{`${config.percentage}%`}</h2>
      <div className="caption text-white-disabled">
        ~
        {config.poolShareAssetsWithPercentage.map((asset, index) => (
          <span key={asset.currency.coinDenom}>
            {asset.toString()}
            {index !== config.poolShareAssetsWithPercentage.length - 1 && " : "}
          </span>
        ))}
      </div>
      <Slider
        className="w-full my-4"
        type="plain"
        currentValue={config.percentage}
        onInput={(value) => config.setPercentage(value.toString())}
        min={0}
        max={100}
        step={1}
        disabled={config.error !== undefined}
      />
      <div className="grid grid-cols-4 gap-5 h-9 w-full mb-6 md:mb-15">
        <button
          disabled={config.error !== undefined}
          onClick={() => config.setPercentage("25")}
          className="w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75 disabled:opacity-30"
        >
          <p className="text-secondary-200">25%</p>
        </button>
        <button
          disabled={config.error !== undefined}
          onClick={() => config.setPercentage("50")}
          className="w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75 disabled:opacity-30"
        >
          <p className="text-secondary-200">50%</p>
        </button>
        <button
          disabled={config.error !== undefined}
          onClick={() => config.setPercentage("75")}
          className="w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75 disabled:opacity-30"
        >
          <p className="text-secondary-200">75%</p>
        </button>
        <button
          disabled={config.error !== undefined}
          onClick={() => config.setPercentage("100")}
          className="w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75 disabled:opacity-30"
        >
          <p className="text-secondary-200">MAX</p>
        </button>
      </div>
      {config.error && (
        <Error className="mx-auto" message={config.error.message} />
      )}
      <Button
        className="h-14 w-96 mt-3 mx-auto"
        size="lg"
        onClick={onRemoveLiquidity}
        disabled={config.error !== undefined}
      >
        Remove Liquidity
      </Button>
    </div>
  )
);
