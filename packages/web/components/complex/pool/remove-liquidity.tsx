import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { ObservableRemoveLiquidityConfig } from "@osmosis-labs/stores";
import { Slider } from "../../control";
import { Button } from "../../buttons";
import { useWindowSize } from "../../../hooks";

export interface Props {
  removeLiquidityConfig: ObservableRemoveLiquidityConfig;
  onRemoveLiquidity: () => void;
  isSendingMsg?: boolean;
}

export const RemoveLiquidity: FunctionComponent<Props> = observer(
  ({ removeLiquidityConfig: config, onRemoveLiquidity, isSendingMsg }) => {
    const { isMobile } = useWindowSize();

    return (
      <div className="flex flex-col text-center">
        {isMobile ? (
          <h5 className="mt-5">{`${config.percentage}%`}</h5>
        ) : (
          <h2 className="mt-12">{`${config.percentage}%`}</h2>
        )}
        <div className="caption text-white-disabled">
          ~
          {config.poolShareAssetsWithPercentage.map((asset, index) => (
            <span key={asset.currency.coinDenom}>
              {asset.toString()}
              {index !== config.poolShareAssetsWithPercentage.length - 1 &&
                " : "}
            </span>
          ))}
        </div>
        <Slider
          className="w-full my-8"
          type="plain"
          currentValue={config.percentage}
          onInput={(value) => config.setPercentage(value.toString())}
          min={0}
          max={100}
          step={1}
        />
        <div className="grid grid-cols-4 gap-5 h-9 w-full md:mb-6 mb-15">
          <button
            onClick={() => config.setPercentage("25")}
            className="w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75"
          >
            <p className="text-secondary-200">25%</p>
          </button>
          <button
            onClick={() => config.setPercentage("50")}
            className="w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75"
          >
            <p className="text-secondary-200">50%</p>
          </button>
          <button
            onClick={() => config.setPercentage("75")}
            className="w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75"
          >
            <p className="text-secondary-200">75%</p>
          </button>
          <button
            onClick={() => config.setPercentage("100")}
            className="w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75"
          >
            <p className="text-secondary-200">MAX</p>
          </button>
        </div>
        <Button
          className="h-14 md:w-full w-96 !p-0 mt-3 mx-auto"
          size="lg"
          loading={isSendingMsg}
          disabled={isSendingMsg}
          onClick={onRemoveLiquidity}
        >
          Remove Liquidity
        </Button>
      </div>
    );
  }
);
