import { CoinPretty, RatePretty } from "@keplr-wallet/unit";
import { ObservableAddLiquidityConfig } from "@osmosis-labs/stores";
import { Currency } from "@osmosis-labs/types";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, ReactNode, useMemo } from "react";

import { Token } from "~/components/assets";
import { Button } from "~/components/buttons";
import { MenuToggle } from "~/components/control";
import { PoolTokenSelect } from "~/components/control/pool-token-select";
import { InputBox } from "~/components/input";
import { Tooltip } from "~/components/tooltip";
import { CustomClasses } from "~/components/types";
import { useTranslation } from "~/hooks";
import { useWindowSize } from "~/hooks";
import { useCoinFiatValue } from "~/hooks/queries/assets/use-coin-fiat-value";
import { useStore } from "~/stores";

export const AddLiquidity: FunctionComponent<
  {
    addLiquidityConfig: ObservableAddLiquidityConfig;
    actionButton: ReactNode;
  } & CustomClasses
> = observer(({ className, addLiquidityConfig, actionButton }) => {
  const { t } = useTranslation();

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
            <span className="caption">{t("addLiquidity.autoswapCaption")}</span>
          )}
        </div>
      )}
      <div className="flex max-h-96 flex-col gap-2.5 overflow-y-auto">
        {(addLiquidityConfig.isSingleAmountIn &&
        addLiquidityConfig.singleAmountInAsset
          ? [addLiquidityConfig.singleAmountInAsset]
          : addLiquidityConfig.poolAssets
        ).map(({ weightFraction, currency }, index) => (
          <AmountInput
            key={index}
            addLiquidityConfig={addLiquidityConfig}
            currency={currency}
            weightFraction={weightFraction}
            index={index}
          />
        ))}
      </div>
      {Boolean(addLiquidityConfig.stableSwapInfo?.scalingFactorController) && (
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
          <span>{t("addLiquidity.priceImpact")}</span>
          <span>{addLiquidityConfig.singleAmountInPriceImpact.toString()}</span>
        </div>
      )}
      {actionButton}
    </div>
  );
});

const AmountInput: FunctionComponent<{
  addLiquidityConfig: ObservableAddLiquidityConfig;
  currency: Currency;
  weightFraction: RatePretty;
  index: number;
}> = observer(({ addLiquidityConfig, weightFraction, currency, index }) => {
  const { chainStore } = useStore();
  const { isMobile } = useWindowSize();
  const { t } = useTranslation();

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

  const inputAmountValue = useCoinFiatValue(
    useMemo(
      () =>
        new CoinPretty(
          currency,
          inputAmount.length === 0 ? "0" : inputAmount
        ).moveDecimalPointRight(currency.coinDecimals),
      [currency, inputAmount]
    )
  );

  const assetBalance = addLiquidityConfig.isSingleAmountIn
    ? addLiquidityConfig.singleAmountInBalance
    : addLiquidityConfig.getSenderBalanceAt(index);

  return (
    <div
      key={currency.coinDenom}
      className="flex w-full flex-col gap-1 rounded-2xl border border-osmoverse-700 p-4 md:rounded-xl md:p-3"
    >
      <div className="flex w-full place-content-between items-center">
        {addLiquidityConfig.isSingleAmountIn ? (
          <PoolTokenSelect
            tokens={addLiquidityConfig.poolAssets.map((poolAsset) => ({
              coinDenom: poolAsset.currency.coinDenom,
              networkName: chainStore.getChainFromCurrency(
                poolAsset.currency.coinDenom
              )?.prettyChainName,
              poolShare: poolAsset.weightFraction,
            }))}
            selectedTokenDenom={
              addLiquidityConfig.singleAmountInAsset?.currency.coinDenom ?? ""
            }
            onSelectToken={(tokenIndex) =>
              addLiquidityConfig.setSingleAmountInConfigIndex(tokenIndex)
            }
            isMobile={isMobile}
          />
        ) : (
          <Token
            className="my-auto"
            coinDenom={currency.coinDenom}
            poolShare={weightFraction}
            ringColorIndex={index}
            isMobile={isMobile}
          />
        )}
        <div className="flex flex-col gap-2">
          {!isMobile && (
            <div className="flex justify-end gap-2 text-caption font-caption">
              <span className="my-auto">{t("addLiquidity.available")}</span>
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
                  {!inputAmountValue || inputAmountValue.toDec().isZero() ? (
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
    </div>
  );
});
