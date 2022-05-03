import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { ObservableAddLiquidityConfig } from "@osmosis-labs/stores";
import { Button } from "../../buttons";
import { InfoTooltip } from "../../tooltip/info";
import { InputBox } from "../../input";
import { Token } from "../../assets";
import { CheckBox } from "../../control";
import { Error } from "../../alert";
import { PoolTokenSelect } from "../../control/pool-token-select";
import { useWindowSize } from "../../../hooks";

export interface Props {
  addLiquidityConfig: ObservableAddLiquidityConfig;
  onAddLiquidity: () => void;
  getFiatValue?: (coin: CoinPretty) => PricePretty | undefined;
  getChainNetworkName?: (coinDenom: string) => string | undefined;
  isSendingMsg?: boolean;
}

export const AddLiquidity: FunctionComponent<Props> = observer(
  ({
    addLiquidityConfig,
    getFiatValue,
    onAddLiquidity,
    getChainNetworkName,
    isSendingMsg,
  }) => {
    const { isMobile } = useWindowSize();

    return (
      <div className="flex flex-col gap-3">
        {!isMobile && (
          <div className="flex gap-1 text-caption font-caption">
            <span className="text-white-disabled">LP token balance:</span>
            <span className="text-secondary-200">
              {addLiquidityConfig.poolShare.toDec().isZero()
                ? addLiquidityConfig.poolShare.maxDecimals(0).toString()
                : addLiquidityConfig.poolShare.toString()}
            </span>
          </div>
        )}
        <div className="flex flex-col gap-2.5">
          {(addLiquidityConfig.isSingleAmountIn &&
          addLiquidityConfig.singleAmountInAsset
            ? [addLiquidityConfig.singleAmountInAsset]
            : addLiquidityConfig.poolAssets
          ).map(({ weightFraction, currency }, index) => {
            // amount text box value
            const inputAmount = addLiquidityConfig.isSingleAmountIn
              ? addLiquidityConfig.singleAmountInConfig?.amount ?? "0"
              : addLiquidityConfig.getAmountAt(index);
            const onInputAmount = (value: string) => {
              if (addLiquidityConfig.isSingleAmountIn) {
                addLiquidityConfig.singleAmountInConfig?.setAmount(value);
              } else {
                addLiquidityConfig.setAmountAt(index, value);
              }
            };

            const inputAmountValue =
              inputAmount !== "" && !isNaN(parseFloat(inputAmount))
                ? getFiatValue?.(
                    new CoinPretty(currency, inputAmount).moveDecimalPointRight(
                      currency.coinDecimals
                    )
                  )
                : undefined;
            const networkName = getChainNetworkName?.(currency.coinDenom);
            const assetBalance = addLiquidityConfig.isSingleAmountIn
              ? addLiquidityConfig.singleAmountInBalance
              : addLiquidityConfig.getSenderBalanceAt(index);

            return (
              <div
                key={currency.coinDenom}
                className="flex w-full items-center place-content-between md:p-2 p-4 border border-white-faint md:rounded-xl rounded-2xl"
              >
                {addLiquidityConfig.isSingleAmountIn ? (
                  <PoolTokenSelect
                    tokens={addLiquidityConfig.poolAssets.map((poolAsset) => ({
                      coinDenom: poolAsset.currency.coinDenom,
                      networkName: getChainNetworkName?.(
                        poolAsset.currency.coinDenom
                      ),
                      poolShare: poolAsset.weightFraction,
                    }))}
                    selectedTokenDenom={
                      addLiquidityConfig.singleAmountInAsset?.currency
                        .coinDenom ?? ""
                    }
                    onSelectToken={(coinDenom) =>
                      addLiquidityConfig.setSingleAmountInConfig(coinDenom)
                    }
                    isMobile={isMobile}
                  />
                ) : (
                  <Token
                    className="my-auto"
                    coinDenom={currency.coinDenom}
                    networkName={networkName}
                    poolShare={weightFraction}
                    ringColorIndex={index}
                    isMobile={isMobile}
                  />
                )}
                <div className="flex flex-col gap-2">
                  {!isMobile && (
                    <div className="flex gap-2 text-caption font-caption justify-end">
                      <span className="my-auto">Available</span>
                      {assetBalance && (
                        <span className="text-primary-50 my-auto">
                          {assetBalance.toString()}
                        </span>
                      )}
                      <button
                        className={classNames(
                          "py-1 px-1.5 my-1 text-xs rounded-md bg-white-faint",
                          {
                            "opacity-30": assetBalance?.toDec().isZero(),
                          }
                        )}
                        onClick={() => addLiquidityConfig.setMax()}
                        disabled={assetBalance?.toDec().isZero()}
                      >
                        MAX
                      </button>
                    </div>
                  )}
                  <div className="flex items-stretch gap-1">
                    {isMobile && (
                      <button
                        className={classNames(
                          "py-1 px-1.5 my-1 text-xs rounded-md bg-white-faint",
                          {
                            "opacity-30": assetBalance?.toDec().isZero(),
                          }
                        )}
                        onClick={() => addLiquidityConfig.setMax()}
                        disabled={assetBalance?.toDec().isZero()}
                      >
                        MAX
                      </button>
                    )}
                    <div className="flex flex-col rounded-lg bg-background p-1">
                      <InputBox
                        style="no-border"
                        type="number"
                        inputClassName="text-right md:w-16 w-full h-6 text-h6 font-h6 md:text-base"
                        currentValue={inputAmount}
                        onInput={onInputAmount}
                        placeholder=""
                      />
                      {!isMobile && (
                        <span className="text-right text-xs font-caption text-white-emphasis leading-5 pr-3">
                          {!inputAmountValue ||
                          inputAmountValue.toDec().isZero() ? (
                            <br />
                          ) : (
                            `~${inputAmountValue.toString()}`
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center ml-auto">
          <CheckBox
            className="mr-2 after:!bg-transparent after:!border-2 after:!border-white-full"
            isOn={addLiquidityConfig.isSingleAmountIn}
            onToggle={() =>
              addLiquidityConfig.setIsSingleAmountIn(
                !addLiquidityConfig.isSingleAmountIn
              )
            }
          >
            Auto-swap single asset
          </CheckBox>
          <InfoTooltip
            trigger="click mouseenter"
            className="mx-1"
            content="'Auto-swap single asset' allows you to provide liquidity using one asset. This will impact the pool price of the asset you’re providing liquidity with."
          />
        </div>
        {addLiquidityConfig.singleAmountInPriceImpact && (
          <div className="flex place-content-between p-4 bg-card border border-white-faint rounded-lg body1">
            <span className="text-white-mid">Price impact</span>
            <span>
              {addLiquidityConfig.singleAmountInPriceImpact.toString()}
            </span>
          </div>
        )}
        {addLiquidityConfig.error && (
          <Error
            className="mx-auto"
            message={addLiquidityConfig.error?.message ?? ""}
          />
        )}
        <Button
          className="h-14 md:w-full w-96 mt-3 mx-auto"
          size="lg"
          loading={isSendingMsg}
          disabled={addLiquidityConfig.error !== undefined || isSendingMsg}
          onClick={onAddLiquidity}
        >
          Add Liquidity
        </Button>
      </div>
    );
  }
);
