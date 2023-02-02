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
import { Info } from "../../components/alert";
import { PoolTokenSelect } from "../../components/control/pool-token-select";
import { CustomClasses } from "../types";
import { Button } from "../buttons";
import { useTranslation } from "react-multi-lang";
import { Tooltip } from "../tooltip";

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
    const t = useTranslation();

    return (
      <div className={classNames("flex flex-col gap-8", className)}>
        {addLiquidityConfig.supportsSingleAmountIn && (
          <div className="flex flex-col gap-4 text-center">
            <div className="mx-auto">
              <MenuToggle
                selectedOptionId={
                  addLiquidityConfig.isSingleAmountIn ? "single" : "all"
                }
                options={[
                  {
                    id: "all",
                    display: t("addLiquidity.allAssets"),
                  },
                  { id: "single", display: t("addLiquidity.singleAsset") },
                ]}
                onSelect={(id) => {
                  if (id === "single") {
                    addLiquidityConfig.setIsSingleAmountIn(true);
                  } else addLiquidityConfig.setIsSingleAmountIn(false);
                }}
              />
            </div>
            {addLiquidityConfig.isSingleAmountIn && (
              <span className="caption">
                {t("addLiquidity.autoswapCaption")}
              </span>
            )}
          </div>
        )}
        <div className="flex max-h-96 flex-col gap-2.5 overflow-y-auto">
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
                className="flex w-full flex-col gap-1 rounded-2xl border border-osmoverse-700 p-4 md:rounded-xl md:p-3"
              >
                <div className="flex w-full place-content-between items-center">
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
                      <div className="flex justify-end gap-2 text-caption font-caption">
                        <span className="my-auto">
                          {t("addLiquidity.available")}
                        </span>
                        {assetBalance && (
                          <span
                            className={classNames(
                              "my-auto text-wosmongton-300",
                              assetBalance?.toDec().isZero()
                                ? "opacity-70"
                                : "cursor-pointer"
                            )}
                            onClick={() => addLiquidityConfig.setMax()}
                          >
                            {assetBalance.maxDecimals(6).toString()}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex place-content-end items-center gap-1">
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
                          <span className="pr-3 text-right text-xs font-caption leading-5 text-osmoverse-400">
                            {!inputAmountValue ||
                            inputAmountValue.toDec().isZero() ? (
                              <br />
                            ) : (
                              `~${inputAmountValue.toString()}`
                            )}
                          </span>
                        )}
                      </div>
                      {isMobile && (
                        <Button
                          mode="amount"
                          className="py-0.5"
                          onClick={() => addLiquidityConfig.setMax()}
                        >
                          {t("components.MAX")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                {isPeggedCurrency && (
                  <Info
                    className="text-wosmongton-100"
                    borderClassName="bg-gradient-neutral"
                    textClassName="w-full text-center"
                    message={t("addLiquidity.stablecoinWarning", {
                      denom: currency!.originCurrency!.coinDenom,
                      mechanism: t(
                        `stablecoinTypes.${currency.originCurrency!
                          .pegMechanism!}`
                      ),
                    })}
                  />
                )}
              </div>
            );
          })}
        </div>
        {Boolean(
          addLiquidityConfig.stableSwapInfo?.scalingFactorController
        ) && (
          <div>
            <p className="caption w-full px-4 text-osmoverse-300">
              {t("addLiquidity.scalingFactorControllerWarning_first")}{" "}
              <a
                href={`https://www.mintscan.io/osmosis/account/${addLiquidityConfig.stableSwapInfo?.scalingFactorController}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-wosmongton-300 underline"
              >
                {t("addLiquidity.scalingFactorController")}
              </a>{" "}
              {t("addLiquidity.scalingFactorControllerWarning_second")}{" "}
              <Tooltip
                content={t("addLiquidity.scalingFactorInformation")}
                className="!inline !align-baseline underline"
              >
                <span>{t("addLiquidity.scalingFactor")}</span>
              </Tooltip>{" "}
              {t("addLiquidity.scalingFactorControllerWarning_third")}{" "}
              {addLiquidityConfig.stableSwapInfo?.scalingFactor?.map(
                (factor, index, array) => {
                  const isNotLast = index !== array.length - 1;
                  const factorAsNumber = Number(factor);
                  const exponent = Math.log10(factorAsNumber);

                  return (
                    <>
                      {
                        exponent !== Math.round(exponent) || exponent === 0
                          ? factorAsNumber // Display as a number if it's not a power of 10 or if the exponent is 0
                          : `10^${exponent}` // Otherwise, display as a power of 10 e.g. 10^3
                      }
                      {isNotLast ? ":" : ""}
                    </>
                  );
                }
              )}
              .{" "}
              <a
                href="https://docs.osmosis.zone/overview/terminology/#scaling-factor"
                target="_blank"
                rel="noopener noreferrer"
                className="text-wosmongton-300 underline"
              >
                {t("pool.learnMore")}
              </a>
            </p>
          </div>
        )}
        {addLiquidityConfig.singleAmountInPriceImpact && (
          <div className="caption flex place-content-between p-4 text-osmoverse-300">
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
