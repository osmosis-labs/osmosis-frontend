import { FunctionComponent, ReactNode } from "react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { PricePretty, CoinPretty } from "@keplr-wallet/unit";
import { ObservableAddLiquidityConfig } from "@osmosis-labs/stores";
import { useStore } from "../../stores";
import { useWindowSize } from "../../hooks";
import { MenuToggle } from "../../components/control";
import { Token } from "../../components/assets";
import { InputBox } from "../../components/input";
import { Error, Info } from "../../components/alert";
import { PoolTokenSelect } from "../../components/control/pool-token-select";
import { BorderButton } from "../buttons";
import { CustomClasses } from "../types";

export const AddLiquidity: FunctionComponent<
  {
    addLiquidityConfig: ObservableAddLiquidityConfig;
    actionButton: ReactNode;
    getFiatValue?: (coin: CoinPretty) => PricePretty | undefined;
  } & CustomClasses
> = observer(
  ({ className, addLiquidityConfig, actionButton, getFiatValue }) => {
    const { chainStore } = useStore();
    const { isMobile } = useWindowSize();

    return (
      <div className={classNames("flex flex-col gap-8", className)}>
        <div className="mx-auto">
          <MenuToggle
            selectedOptionId={
              addLiquidityConfig.isSingleAmountIn ? "single" : "all"
            }
            options={[
              {
                id: "all",
                display: "All assets",
              },
              { id: "single", display: "Single asset" },
            ]}
            onSelect={(id) => {
              if (id === "single") {
                addLiquidityConfig.setIsSingleAmountIn(true);
              } else addLiquidityConfig.setIsSingleAmountIn(false);
            }}
          />
        </div>
        <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto">
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
            const networkName = chainStore.getChainFromCurrency(
              currency.coinDenom
            )?.chainName;
            const assetBalance = addLiquidityConfig.isSingleAmountIn
              ? addLiquidityConfig.singleAmountInBalance
              : addLiquidityConfig.getSenderBalanceAt(index);

            const isPeggedCurrency =
              typeof currency.originCurrency !== "undefined" &&
              typeof currency.originCurrency.pegMechanism !== "undefined";

            return (
              <div
                key={currency.coinDenom}
                className="flex flex-col gap-1 w-full md:p-2 p-4 border border-white-faint md:rounded-xl rounded-2xl"
              >
                {isPeggedCurrency && (
                  <Info
                    size="subtle"
                    className="border-2 border-secondary-50/30"
                    message={`You are adding liquidity to ${
                      currency!.originCurrency!.coinDenom
                    }, ${
                      ["a", "e", "i", "o", "u"].some((vowel) =>
                        currency.originCurrency!.pegMechanism!.startsWith(vowel)
                      )
                        ? "an"
                        : "a"
                    } ${
                      currency.originCurrency!.pegMechanism
                    }-backed stablecoin.`}
                  />
                )}
                <div className="flex items-center w-full place-content-between">
                  {addLiquidityConfig.isSingleAmountIn ? (
                    <PoolTokenSelect
                      tokens={addLiquidityConfig.poolAssets.map(
                        (poolAsset) => ({
                          coinDenom: poolAsset.currency.coinDenom,
                          networkName: chainStore.getChainFromCurrency(
                            poolAsset.currency.coinDenom
                          )?.chainName,
                          poolShare: poolAsset.weightFraction,
                        })
                      )}
                      selectedTokenDenom={
                        addLiquidityConfig.singleAmountInAsset?.currency
                          .coinDenom ?? ""
                      }
                      onSelectToken={(tokenIndex) =>
                        addLiquidityConfig.setSingleAmountInConfigIndex(
                          tokenIndex
                        )
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
                          <span className="text-wosmongton-300 my-auto">
                            {assetBalance.maxDecimals(6).toString()}
                          </span>
                        )}
                        <BorderButton
                          className={classNames("caption py-1 px-1.5", {
                            "opacity-30": assetBalance?.toDec().isZero(),
                          })}
                          onClick={() => addLiquidityConfig.setMax()}
                          disabled={assetBalance?.toDec().isZero()}
                        >
                          MAX
                        </BorderButton>
                      </div>
                    )}
                    <div className="flex place-content-end gap-1">
                      <div className="flex flex-col rounded-lg bg-osmoverse-1000 p-1">
                        <InputBox
                          style="no-border"
                          type="number"
                          inputClassName="text-right self-end md:w-16 w-full ml-auto h-6 text-h6 font-h6 md:text-base"
                          currentValue={inputAmount}
                          onInput={onInputAmount}
                          placeholder=""
                        />
                        {!isMobile && (
                          <span className="text-right text-xs font-caption text-osmoverse-400 leading-5 pr-3">
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
              </div>
            );
          })}
        </div>
        {addLiquidityConfig.singleAmountInPriceImpact && (
          <div className="flex place-content-between p-4 caption text-osmoverse-300">
            <span>Price impact</span>
            <span>
              {addLiquidityConfig.singleAmountInPriceImpact.toString()}
            </span>
          </div>
        )}
        {actionButton}
      </div>
    );
  }
);
