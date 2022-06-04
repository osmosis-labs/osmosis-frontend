import { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { ModalBase, ModalBaseProps } from "./base";
import { TabBox, Slider, CheckBox } from "../components/control/";
import { Token } from "../components/assets";
import { InputBox } from "../components/input";
import { Error } from "../components/alert";
import { InfoTooltip } from "../components/tooltip";
import { PoolTokenSelect } from "../components/control/pool-token-select";
import { useConnectWalletModalRedirect, useWindowSize } from "../hooks";
import {
  ObservableAddLiquidityConfig,
  ObservableRemoveLiquidityConfig,
} from "@osmosis-labs/stores";

export interface Props extends ModalBaseProps {
  addLiquidityConfig: ObservableAddLiquidityConfig;
  getChainNetworkName?: (coinDenom: string) => string | undefined;
  getFiatValue?: (coin: CoinPretty) => PricePretty | undefined;
  removeLiquidityConfig: ObservableRemoveLiquidityConfig;
  onAddLiquidity: () => void;
  onRemoveLiquidity: () => void;
  isSendingMsg?: boolean;
}

export const ManageLiquidityModal: FunctionComponent<Props> = observer(
  (props) => {
    const {
      addLiquidityConfig,
      getChainNetworkName,
      getFiatValue,
      removeLiquidityConfig,
      onAddLiquidity,
      onRemoveLiquidity,
      isSendingMsg = false,
    } = props;
    const { isMobile } = useWindowSize();
    const [selectedTabIndex, setSelectedTabIndex] = useState<0 | 1>(0);

    const { showModalBase, accountActionButton } =
      useConnectWalletModalRedirect(
        {
          className: "h-14 md:w-full md:px-1 w-96 mt-3 mx-auto",
          size: "lg",
          loading: isSendingMsg,
          disabled:
            (selectedTabIndex === 0 &&
              addLiquidityConfig.error !== undefined) ||
            isSendingMsg ||
            (selectedTabIndex === 1 &&
              removeLiquidityConfig.poolShareWithPercentage
                .toDec()
                .equals(new Dec(0))),
          onClick: selectedTabIndex === 0 ? onAddLiquidity : onRemoveLiquidity,
          children:
            selectedTabIndex === 0 ? "Add Liquidity" : "Remove Liquidity",
        },
        props.onRequestClose
      );

    return (
      <ModalBase {...props} isOpen={props.isOpen && showModalBase}>
        <TabBox
          className="w-full"
          rerenderTabs
          tabSelection={{
            selectedTabIndex,
            onTabSelected: (index) => {
              if (index === 0 || index === 1) {
                setSelectedTabIndex(index);
              }
            },
          }}
          tabs={[
            {
              title: "Add Liquidity",
              content: (
                <div className="flex flex-col gap-3">
                  {!isMobile && (
                    <div className="flex gap-1 text-caption font-caption">
                      <span className="text-white-disabled">
                        LP token balance:
                      </span>
                      <span className="text-secondary-200">
                        {addLiquidityConfig.poolShare.toDec().isZero()
                          ? addLiquidityConfig.poolShare
                              .maxDecimals(0)
                              .toString()
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
                          addLiquidityConfig.singleAmountInConfig?.setAmount(
                            value
                          );
                        } else {
                          addLiquidityConfig.setAmountAt(index, value);
                        }
                      };

                      const inputAmountValue =
                        inputAmount !== "" && !isNaN(parseFloat(inputAmount))
                          ? getFiatValue?.(
                              new CoinPretty(
                                currency,
                                inputAmount
                              ).moveDecimalPointRight(currency.coinDecimals)
                            )
                          : undefined;
                      const networkName = getChainNetworkName?.(
                        currency.coinDenom
                      );
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
                              tokens={addLiquidityConfig.poolAssets.map(
                                (poolAsset) => ({
                                  coinDenom: poolAsset.currency.coinDenom,
                                  networkName: getChainNetworkName?.(
                                    poolAsset.currency.coinDenom
                                  ),
                                  poolShare: poolAsset.weightFraction,
                                })
                              )}
                              selectedTokenDenom={
                                addLiquidityConfig.singleAmountInAsset?.currency
                                  .coinDenom ?? ""
                              }
                              onSelectToken={(coinDenom) =>
                                addLiquidityConfig.setSingleAmountInConfig(
                                  coinDenom
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
                                  <span className="text-primary-50 my-auto">
                                    {assetBalance.maxDecimals(6).toString()}
                                  </span>
                                )}
                                <button
                                  className={classNames(
                                    "button py-1 px-1.5 my-1 text-xs rounded-md bg-white-faint",
                                    {
                                      "opacity-30": assetBalance
                                        ?.toDec()
                                        .isZero(),
                                    }
                                  )}
                                  onClick={() => addLiquidityConfig.setMax()}
                                  disabled={assetBalance?.toDec().isZero()}
                                >
                                  MAX
                                </button>
                              </div>
                            )}
                            <div className="flex place-content-end gap-1">
                              {isMobile && (
                                <button
                                  className={classNames(
                                    "button py-1 px-1.5 my-1 text-xs rounded-md bg-white-faint",
                                    {
                                      "opacity-30": assetBalance
                                        ?.toDec()
                                        .isZero(),
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
                                  inputClassName="text-right self-end md:w-16 w-full ml-auto h-6 text-h6 font-h6 md:text-base"
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
                      className="mx-2.5"
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
                  {accountActionButton}
                </div>
              ),
            },
            {
              title: "Remove Liquidity",
              content: (
                <div className="flex flex-col text-center">
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
                            removeLiquidityConfig.poolShareAssetsWithPercentage
                              .length -
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
                  {accountActionButton}
                </div>
              ),
            },
          ]}
        />
      </ModalBase>
    );
  }
);
