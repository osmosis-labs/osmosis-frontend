import { FunctionComponent, useEffect, useRef, useState, useMemo } from "react";
import { WalletStatus } from "@keplr-wallet/stores";
import { Currency } from "@keplr-wallet/types";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { Pool } from "@osmosis-labs/pools";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { EventName } from "../../config";
import {
  useBooleanWithWindowEvent,
  useFakeFeeConfig,
  useSlippageConfig,
  useTokenSwapQueryParams,
  useTradeTokenInConfig,
  useWindowSize,
  useAmplitudeAnalytics,
} from "../../hooks";
import { useStore } from "../../stores";
import { BorderButton, Button } from "../buttons";
import { TokenSelect } from "../control/token-select";
import { InputBox } from "../input";
import { InfoTooltip } from "../tooltip";
import { useTranslation } from "react-multi-lang";
import { tError } from "../localization";

export const TradeClipboard: FunctionComponent<{
  // IMPORTANT: Pools should be memoized!!
  pools: Pool[];

  containerClassName?: string;
  isInModal?: boolean;
  onRequestModalClose?: () => void;
}> = observer(
  ({ containerClassName, pools, isInModal, onRequestModalClose }) => {
    const {
      chainStore,
      accountStore,
      queriesStore,
      assetsStore: { nativeBalances, ibcBalances },
      priceStore,
    } = useStore();
    const t = useTranslation();
    const { chainId } = chainStore.osmosis;
    const { isMobile } = useWindowSize();
    const { logEvent } = useAmplitudeAnalytics();

    const allTokenBalances = nativeBalances.concat(ibcBalances);

    const account = accountStore.getAccount(chainId);
    const queries = queriesStore.get(chainId);

    const [isSettingOpen, setIsSettingOpen] = useBooleanWithWindowEvent(false);
    const manualSlippageInputRef = useRef<HTMLInputElement | null>(null);

    const slippageConfig = useSlippageConfig();
    const tradeTokenInConfig = useTradeTokenInConfig(
      chainStore,
      chainId,
      account.bech32Address,
      queriesStore,
      pools
    );
    // Some validators allow 0 fee tx.
    // Therefore, users can send tx at 0 fee even though they have no OSMO,
    // Users who have OSMO pay a fee by default so that tx is processed faster.
    let preferZeroFee = true;
    const queryOsmo = queries.queryBalances.getQueryBech32Address(
      account.bech32Address
    ).stakable;
    if (
      // If user has an OSMO 0.001 or higher, he pay the fee by default.
      queryOsmo.balance.toDec().gt(DecUtils.getTenExponentN(-3))
    ) {
      preferZeroFee = false;
    }
    const gasForecasted = (() => {
      if (
        tradeTokenInConfig.optimizedRoutePaths.length === 0 ||
        tradeTokenInConfig.optimizedRoutePaths[0].pools.length <= 1
      ) {
        return 250000;
      }

      return 250000 * tradeTokenInConfig.optimizedRoutePaths[0].pools.length;
    })();

    const feeConfig = useFakeFeeConfig(
      chainStore,
      chainStore.osmosis.chainId,
      gasForecasted,
      preferZeroFee
    );
    tradeTokenInConfig.setFeeConfig(feeConfig);

    // show details
    const [showEstimateDetails, setShowEstimateDetails] = useState(false);
    const isEstimateDetailRelevant = !(
      tradeTokenInConfig.amount === "" || tradeTokenInConfig.amount === "0"
    );
    useEffect(() => {
      // auto collapse on input clear
      if (!isEstimateDetailRelevant) setShowEstimateDetails(false);
    }, [isEstimateDetailRelevant]);

    // auto focus from amount on token switch
    const fromAmountInput = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
      fromAmountInput.current?.focus();
    }, [tradeTokenInConfig.sendCurrency]);

    useTokenSwapQueryParams(tradeTokenInConfig, allTokenBalances, isInModal);

    const showPriceImpactWarning = useMemo(
      () =>
        tradeTokenInConfig.expectedSwapResult.priceImpact
          .toDec()
          .gt(new Dec(0.1)),
      [tradeTokenInConfig.expectedSwapResult.priceImpact]
    );

    useEffect(() => {
      if (isSettingOpen && slippageConfig.isManualSlippage) {
        // Whenever the setting opened, give a focus to the input if the manual slippage setting mode is on.
        manualSlippageInputRef.current?.focus();
      }
    }, [isSettingOpen]);

    // token select dropdown
    const [showFromTokenSelectDropdown, setFromTokenSelectDropdownLocal] =
      useBooleanWithWindowEvent(false);
    const [showToTokenSelectDropdown, setToTokenSelectDropdownLocal] =
      useBooleanWithWindowEvent(false);
    const setOneTokenSelectOpen = (dropdown: "to" | "from") => {
      if (dropdown === "to") {
        setToTokenSelectDropdownLocal(true);
        setFromTokenSelectDropdownLocal(false);
      } else {
        setFromTokenSelectDropdownLocal(true);
        setToTokenSelectDropdownLocal(false);
      }
    };
    const closeTokenSelectDropdowns = () => {
      setFromTokenSelectDropdownLocal(false);
      setToTokenSelectDropdownLocal(false);
    };

    // trade metrics
    const minOutAmountLessSlippage = useMemo(
      () =>
        tradeTokenInConfig.expectedSwapResult.amount
          .toDec()
          .mul(new Dec(1).sub(slippageConfig.slippage.toDec())),
      [tradeTokenInConfig.expectedSwapResult.amount, slippageConfig.slippage]
    );
    const spotPrice = useMemo(
      () =>
        tradeTokenInConfig.beforeSpotPriceWithoutSwapFeeOutOverIn
          .trim(true)
          .maxDecimals(tradeTokenInConfig.outCurrency.coinDecimals),
      [
        tradeTokenInConfig.beforeSpotPriceWithoutSwapFeeOutOverIn,
        tradeTokenInConfig.outCurrency,
      ]
    );

    const [isHoveringSwitchButton, setHoveringSwitchButton] = useState(false);

    // to & from box switch animation
    const [isAnimatingSwitch, setIsAnimatingSwitch] = useState(false);
    const [switchOutBack, setSwitchOutBack] = useState(false);
    useEffect(() => {
      let timeout: NodeJS.Timeout | undefined;
      let timeout2: NodeJS.Timeout | undefined;
      const duration = 300;

      if (isAnimatingSwitch) {
        timeout = setTimeout(() => {
          setIsAnimatingSwitch(false);
          setSwitchOutBack(false);
        }, duration);
        timeout2 = setTimeout(() => {
          tradeTokenInConfig.switchInAndOut();
          setSwitchOutBack(true);
        }, duration / 3);
      }

      return () => {
        if (timeout) clearTimeout(timeout);
        if (timeout2) clearTimeout(timeout2);
      };
    }, [isAnimatingSwitch, tradeTokenInConfig]);

    // amount fiat value
    const inAmountValue = useMemo(
      () =>
        tradeTokenInConfig.amount !== "" &&
        new Dec(tradeTokenInConfig.amount).gt(new Dec(0))
          ? priceStore.calculatePrice(
              new CoinPretty(
                tradeTokenInConfig.sendCurrency,
                new Dec(tradeTokenInConfig.amount).mul(
                  DecUtils.getTenExponentNInPrecisionRange(
                    tradeTokenInConfig.sendCurrency.coinDecimals
                  )
                )
              )
            )
          : undefined,
      [tradeTokenInConfig.amount, tradeTokenInConfig.sendCurrency]
    );
    const outAmountValue = useMemo(
      () =>
        (!tradeTokenInConfig.expectedSwapResult.amount.toDec().isZero() &&
          priceStore.calculatePrice(
            tradeTokenInConfig.expectedSwapResult.amount
          )) ||
        undefined,
      [tradeTokenInConfig.expectedSwapResult.amount]
    );

    const swapResultAmount = useMemo(
      () =>
        tradeTokenInConfig.expectedSwapResult.amount
          .trim(true)
          .shrink(true)
          .maxDecimals(
            Math.min(
              tradeTokenInConfig.expectedSwapResult.amount.currency
                .coinDecimals,
              8
            )
          )
          .hideDenom(true)
          .toString(),
      [tradeTokenInConfig.expectedSwapResult.amount]
    );

    // user action
    const swap = async () => {
      if (account.walletStatus !== WalletStatus.Loaded) {
        return account.init();
      }
      if (tradeTokenInConfig.optimizedRoutePaths.length > 0) {
        const routes: {
          poolId: string;
          tokenOutCurrency: Currency;
        }[] = [];

        for (
          let i = 0;
          i < tradeTokenInConfig.optimizedRoutePaths[0].pools.length;
          i++
        ) {
          const pool = tradeTokenInConfig.optimizedRoutePaths[0].pools[i];
          const tokenOutCurrency = chainStore.osmosisObservable.currencies.find(
            (cur) =>
              cur.coinMinimalDenom ===
              tradeTokenInConfig.optimizedRoutePaths[0].tokenOutDenoms[i]
          );

          if (!tokenOutCurrency) {
            tradeTokenInConfig.setError(
              new Error(
                t("swap.error.findCurrency", {
                  currency:
                    tradeTokenInConfig.optimizedRoutePaths[0].tokenOutDenoms[i],
                })
              )
            );
            return;
          }

          routes.push({
            poolId: pool.id,
            tokenOutCurrency,
          });
        }

        const tokenInCurrency = chainStore.osmosisObservable.currencies.find(
          (cur) =>
            cur.coinMinimalDenom ===
            tradeTokenInConfig.optimizedRoutePaths[0].tokenInDenom
        );

        if (!tokenInCurrency) {
          tradeTokenInConfig.setError(
            new Error(
              t("swap.error.findCurrency", {
                currency:
                  tradeTokenInConfig.optimizedRoutePaths[0].tokenInDenom,
              })
            )
          );
          return;
        }

        const tokenIn = {
          currency: tokenInCurrency,
          amount: tradeTokenInConfig.amount,
        };
        const maxSlippage = slippageConfig.slippage.symbol("").toString();

        try {
          logEvent([
            EventName.Swap.swapStarted,
            {
              fromToken: tradeTokenInConfig.sendCurrency.coinDenom,
              tokenAmount: Number(tokenIn.amount),
              toToken: tradeTokenInConfig.outCurrency.coinDenom,
              isOnHome: !isInModal,
              isMultiHop: routes.length !== 1,
            },
          ]);
          if (routes.length === 1) {
            await account.osmosis.sendSwapExactAmountInMsg(
              routes[0].poolId,
              tokenIn,
              routes[0].tokenOutCurrency,
              maxSlippage,
              "",
              {
                amount: [
                  {
                    denom: chainStore.osmosis.stakeCurrency.coinMinimalDenom,
                    amount: "0",
                  },
                ],
              },
              {
                preferNoSetFee: preferZeroFee,
              },
              () => {
                logEvent([
                  EventName.Swap.swapCompleted,
                  {
                    fromToken: tradeTokenInConfig.sendCurrency.coinDenom,
                    tokenAmount: Number(tokenIn.amount),
                    toToken: tradeTokenInConfig.outCurrency.coinDenom,
                    isOnHome: !isInModal,

                    isMultiHop: false,
                  },
                ]);
              }
            );
          } else {
            await account.osmosis.sendMultihopSwapExactAmountInMsg(
              routes,
              tokenIn,
              maxSlippage,
              "",
              {
                amount: [
                  {
                    denom: chainStore.osmosis.stakeCurrency.coinMinimalDenom,
                    amount: "0",
                  },
                ],
              },
              {
                preferNoSetFee: preferZeroFee,
              },
              () => {
                logEvent([
                  EventName.Swap.swapCompleted,
                  {
                    fromToken: tradeTokenInConfig.sendCurrency.coinDenom,
                    tokenAmount: Number(tokenIn.amount),
                    toToken: tradeTokenInConfig.outCurrency.coinDenom,
                    isOnHome: !isInModal,
                    isMultiHop: true,
                  },
                ]);
              }
            );
          }
          tradeTokenInConfig.setAmount("");
          tradeTokenInConfig.setFraction(undefined);
        } catch (e) {
          console.error(e);
        } finally {
          onRequestModalClose?.();
        }
      }
    };

    return (
      <div
        className={classNames(
          "relative rounded-[18px] flex flex-col gap-8 md:gap-6 bg-osmoverse-800 px-6 md:px-3 pt-12 md:pt-4 pb-8 md:pb-4",
          containerClassName
        )}
      >
        <div className="relative flex items-center justify-end w-full">
          <h6 className="w-full text-center">{t("swap.title")}</h6>
          <button
            className="absolute right-3 top-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsSettingOpen(!isSettingOpen);
              closeTokenSelectDropdowns();
            }}
          >
            <Image
              width={isMobile ? 20 : 28}
              height={isMobile ? 20 : 28}
              src={
                isSettingOpen
                  ? "/icons/setting-white.svg"
                  : "/icons/setting.svg"
              }
              alt="setting icon"
              priority={true}
            />
          </button>
          {isSettingOpen && (
            <div
              className="absolute bottom-[-0.5rem] right-0 translate-y-full bg-osmoverse-800 rounded-2xl p-[1.875rem] md:p-5 z-40 w-full max-w-[23.875rem]"
              onClick={(e) => e.stopPropagation()}
            >
              <h6>{t("swap.settings.title")}</h6>
              <div className="flex items-center mt-2.5">
                <div className="subtitle1 text-osmoverse-200 mr-2">
                  {t("swap.settings.slippage")}
                </div>
                <InfoTooltip content={t("swap.settings.slippageInfo")} />
              </div>

              <ul className="flex gap-x-3 w-full mt-3">
                {slippageConfig.selectableSlippages.map((slippage) => {
                  return (
                    <li
                      key={slippage.index}
                      className={classNames(
                        "flex items-center justify-center w-full h-8 cursor-pointer rounded-lg bg-osmoverse-700",
                        { "border-2 border-wosmongton-200": slippage.selected }
                      )}
                      onClick={(e) => {
                        e.preventDefault();

                        slippageConfig.select(slippage.index);

                        logEvent([
                          EventName.Swap.slippageToleranceSet,
                          {
                            percentage: slippageConfig.slippage.toString(),
                          },
                        ]);
                      }}
                    >
                      <button>{slippage.slippage.toString()}</button>
                    </li>
                  );
                })}
                <li
                  className={classNames(
                    "flex items-center justify-center w-full h-8 cursor-pointer rounded-lg",
                    slippageConfig.isManualSlippage
                      ? "border-2 border-wosmongton-200 text-white-high"
                      : "text-osmoverse-500",
                    slippageConfig.isManualSlippage
                      ? slippageConfig.manualSlippageError
                        ? "bg-missionError"
                        : "bg-osmoverse-900"
                      : "bg-osmoverse-900"
                  )}
                  onClick={(e) => {
                    e.preventDefault();

                    if (manualSlippageInputRef.current) {
                      manualSlippageInputRef.current.focus();
                    }
                  }}
                >
                  <InputBox
                    type="number"
                    className="bg-transparent px-0 w-fit"
                    inputClassName={`bg-transparent text-center ${
                      !slippageConfig.isManualSlippage
                        ? "text-osmoverse-500"
                        : "text-white-high"
                    }`}
                    style="no-border"
                    currentValue={slippageConfig.manualSlippageStr}
                    onInput={(value) => {
                      slippageConfig.setManualSlippage(value);

                      logEvent([
                        EventName.Swap.slippageToleranceSet,
                        {
                          fromToken: tradeTokenInConfig.sendCurrency.coinDenom,
                          toToken: tradeTokenInConfig.outCurrency.coinDenom,
                          isOnHome: !isInModal,
                          percentage: slippageConfig.slippage.toString(),
                        },
                      ]);
                    }}
                    onFocus={() => slippageConfig.setIsManualSlippage(true)}
                    inputRef={manualSlippageInputRef}
                    isAutosize
                  />
                  <span
                    className={classNames("shrink-0", {
                      "text-osmoverse-500": !slippageConfig.isManualSlippage,
                    })}
                  >
                    %
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="relative flex flex-col gap-3">
          <div
            className={classNames(
              "bg-osmoverse-900 rounded-xl md:rounded-xl px-4 md:px-3 py-[22px] md:py-2.5 transition-all",
              !switchOutBack ? "ease-outBack" : "ease-inBack",
              {
                "opacity-30": isAnimatingSwitch,
              }
            )}
            style={
              isAnimatingSwitch
                ? {
                    transform: "translateY(60px)",
                  }
                : undefined
            }
          >
            <div
              className={classNames(
                "flex items-center place-content-between transition-opacity",
                {
                  "opacity-0": isAnimatingSwitch,
                }
              )}
            >
              <div className="flex">
                <span className="caption text-sm md:text-xs text-white-full">
                  {t("swap.available")}
                </span>
                <span className="caption text-sm md:text-xs text-wosmongton-300 ml-1.5">
                  {queries.queryBalances
                    .getQueryBech32Address(account.bech32Address)
                    .getBalanceFromCurrency(tradeTokenInConfig.sendCurrency)
                    .trim(true)
                    .hideDenom(true)
                    .maxDecimals(tradeTokenInConfig.sendCurrency.coinDecimals)
                    .toString()}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <BorderButton
                  className={classNames(
                    "text-xs py-1 px-1.5",
                    tradeTokenInConfig.fraction === 1
                      ? "bg-wosmongton-100/40"
                      : "bg-transparent"
                  )}
                  onClick={() => {
                    if (tradeTokenInConfig.fraction !== 1) {
                      logEvent([
                        EventName.Swap.maxClicked,
                        {
                          fromToken: tradeTokenInConfig.sendCurrency.coinDenom,
                          toToken: tradeTokenInConfig.outCurrency.coinDenom,
                          isOnHome: !isInModal,
                        },
                      ]);
                      tradeTokenInConfig.setFraction(1);
                    } else {
                      tradeTokenInConfig.setFraction(undefined);
                    }
                  }}
                >
                  {t("swap.MAX")}
                </BorderButton>
                <BorderButton
                  className={classNames(
                    "text-xs py-1 px-1.5",
                    tradeTokenInConfig.fraction === 0.5
                      ? "bg-wosmongton-100/40"
                      : "bg-transparent"
                  )}
                  onClick={() => {
                    if (tradeTokenInConfig.fraction !== 0.5) {
                      logEvent([
                        EventName.Swap.halfClicked,
                        {
                          fromToken: tradeTokenInConfig.sendCurrency.coinDenom,
                          toToken: tradeTokenInConfig.outCurrency.coinDenom,
                          isOnHome: !isInModal,
                        },
                      ]);
                      tradeTokenInConfig.setFraction(0.5);
                    } else {
                      tradeTokenInConfig.setFraction(undefined);
                    }
                  }}
                >
                  {t("swap.HALF")}
                </BorderButton>
              </div>
            </div>
            <div className="flex items-center place-content-between mt-3">
              <TokenSelect
                sortByBalances
                dropdownOpen={showFromTokenSelectDropdown}
                setDropdownState={(isOpen) => {
                  if (isOpen) {
                    setOneTokenSelectOpen("from");
                  } else {
                    closeTokenSelectDropdowns();
                  }
                }}
                tokens={allTokenBalances
                  .filter(
                    (tokenBalance) =>
                      tokenBalance.balance.currency.coinDenom !==
                      tradeTokenInConfig.outCurrency.coinDenom
                  )
                  .filter((tokenBalance) =>
                    tradeTokenInConfig.sendableCurrencies.some(
                      (sendableCurrency) =>
                        sendableCurrency.coinDenom ===
                        tokenBalance.balance.currency.coinDenom
                    )
                  )
                  .map((tokenBalance) => tokenBalance.balance)}
                selectedTokenDenom={tradeTokenInConfig.sendCurrency.coinDenom}
                onSelect={(tokenDenom: string) => {
                  const tokenInBalance = allTokenBalances.find(
                    (tokenBalance) =>
                      tokenBalance.balance.currency.coinDenom === tokenDenom
                  );
                  if (tokenInBalance) {
                    tradeTokenInConfig.setSendCurrency(
                      tokenInBalance.balance.currency
                    );
                  }
                  closeTokenSelectDropdowns();
                }}
              />
              <div className="flex flex-col items-end w-full">
                <input
                  ref={fromAmountInput}
                  type="number"
                  className={classNames(
                    "md:text-subtitle1 text-white-full bg-transparent text-right focus:outline-none w-full placeholder:text-white-disabled",
                    tradeTokenInConfig.amount.length >= 14
                      ? "caption"
                      : "font-h5 md:font-subtitle1 text-h5"
                  )}
                  placeholder="0"
                  onChange={(e) => {
                    e.preventDefault();
                    if (
                      Number(e.target.value) <= Number.MAX_SAFE_INTEGER &&
                      e.target.value.length <= (isMobile ? 19 : 26)
                    ) {
                      logEvent([
                        EventName.Swap.inputEntered,
                        {
                          fromToken: tradeTokenInConfig.sendCurrency.coinDenom,
                          toToken: tradeTokenInConfig.outCurrency.coinDenom,
                          isOnHome: !isInModal,
                        },
                      ]);
                      tradeTokenInConfig.setAmount(e.target.value);
                    }
                  }}
                  value={tradeTokenInConfig.amount}
                />
                <div
                  className={classNames(
                    "subtitle1 md:caption text-osmoverse-300 transition-opacity",
                    inAmountValue ? "opacity-100" : "opacity-0"
                  )}
                >{`≈ ${inAmountValue || "0"}`}</div>
              </div>
            </div>
          </div>

          <button
            className={classNames(
              "absolute flex items-center left-[45%] top-[124px] md:top-[94px] transition-all duration-500 ease-bounce z-30",
              {
                "w-10 md:w-8 h-10 md:h-8": !isHoveringSwitchButton,
                "w-11 md:w-9 h-11 md:h-9 -translate-x-[2px]":
                  isHoveringSwitchButton,
              }
            )}
            onMouseEnter={() => {
              if (!isMobile) setHoveringSwitchButton(true);
            }}
            onMouseLeave={() => {
              if (!isMobile) setHoveringSwitchButton(false);
            }}
            onClick={() => {
              logEvent([
                EventName.Swap.switchClicked,
                {
                  fromToken: tradeTokenInConfig.sendCurrency.coinDenom,
                  toToken: tradeTokenInConfig.outCurrency.coinDenom,
                  isOnHome: !isInModal,
                },
              ]);
              setIsAnimatingSwitch(true);
            }}
          >
            <div
              className={classNames(
                "w-full h-full rounded-full flex items-center",
                {
                  "bg-osmoverse-700": !isHoveringSwitchButton,
                  "bg-[#4E477C]": isHoveringSwitchButton,
                }
              )}
            >
              <div className="relative w-full h-full">
                <div
                  className={classNames(
                    "absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/3 transition-all duration-500 ease-bounce",
                    {
                      "opacity-0 rotate-180": isHoveringSwitchButton,
                    }
                  )}
                >
                  <Image
                    width={isMobile ? 16 : 20}
                    height={isMobile ? 16 : 20}
                    src={"/icons/down-arrow.svg"}
                    alt="switch"
                  />
                </div>
                <div
                  className={classNames(
                    "absolute left-1/2 -translate-x-1/2 top-1/3 -translate-y-1/3 transition-all duration-500 ease-bounce",
                    {
                      "opacity-100 rotate-180": isHoveringSwitchButton,
                      "opacity-0": !isHoveringSwitchButton,
                    }
                  )}
                >
                  <Image
                    width={isMobile ? 16 : 20}
                    height={isMobile ? 16 : 20}
                    src={"/icons/swap.svg"}
                    alt="switch"
                  />
                </div>
              </div>
            </div>
          </button>

          <div
            className={classNames(
              "bg-osmoverse-900 rounded-xl md:rounded-xl px-4 md:px-3 py-[22px] md:py-2.5 transition-all",
              !switchOutBack ? "ease-outBack" : "ease-inBack",
              {
                "opacity-30": isAnimatingSwitch,
              }
            )}
            style={
              isAnimatingSwitch
                ? {
                    transform: "translateY(-53px) scaleY(1.4)",
                  }
                : undefined
            }
          >
            <div
              className="flex items-center place-content-between transition-transform"
              style={
                isAnimatingSwitch
                  ? {
                      transform: "scaleY(0.6)",
                    }
                  : undefined
              }
            >
              <TokenSelect
                dropdownOpen={showToTokenSelectDropdown}
                setDropdownState={(isOpen) => {
                  if (isOpen) {
                    setOneTokenSelectOpen("to");
                  } else {
                    closeTokenSelectDropdowns();
                  }
                }}
                sortByBalances
                tokens={allTokenBalances
                  .filter(
                    (tokenBalance) =>
                      tokenBalance.balance.currency.coinDenom !==
                      tradeTokenInConfig.sendCurrency.coinDenom
                  )
                  .filter((tokenBalance) =>
                    tradeTokenInConfig.sendableCurrencies.some(
                      (sendableCurrency) =>
                        sendableCurrency.coinDenom ===
                        tokenBalance.balance.currency.coinDenom
                    )
                  )
                  .map((tokenBalance) => tokenBalance.balance)}
                selectedTokenDenom={tradeTokenInConfig.outCurrency.coinDenom}
                onSelect={(tokenDenom: string) => {
                  const tokenOutBalance = allTokenBalances.find(
                    (tokenBalance) =>
                      tokenBalance.balance.currency.coinDenom === tokenDenom
                  );
                  if (tokenOutBalance) {
                    tradeTokenInConfig.setOutCurrency(
                      tokenOutBalance.balance.currency
                    );
                  }
                  closeTokenSelectDropdowns();
                }}
              />
              <div className="flex flex-col items-end w-full">
                <h5
                  className={classNames(
                    "text-right md:subtitle1",
                    tradeTokenInConfig.expectedSwapResult.amount
                      .toDec()
                      .isPositive()
                      ? "text-white-full"
                      : "text-white-disabled"
                  )}
                >{`≈ ${
                  tradeTokenInConfig.expectedSwapResult.amount.denom !==
                  "UNKNOWN"
                    ? swapResultAmount
                    : "0"
                }`}</h5>
                <div
                  className={classNames(
                    "subtitle1 md:caption text-osmoverse-300 transition-opacity",
                    outAmountValue ? "opacity-100" : "opacity-0"
                  )}
                >
                  {`≈ ${outAmountValue || "0"}`}
                </div>
              </div>
            </div>
          </div>

          <div
            className={classNames(
              "relative rounded-lg bg-osmoverse-900 px-4 md:px-3 transition-all ease-inOutBack duration-300 overflow-hidden",
              showEstimateDetails ? "h-56 py-6" : "h-11 py-[10px]"
            )}
          >
            <button
              className={classNames(
                "w-full flex items-center place-content-between",
                {
                  "cursor-pointer": isEstimateDetailRelevant,
                }
              )}
              onClick={() => {
                if (isEstimateDetailRelevant)
                  setShowEstimateDetails(!showEstimateDetails);
              }}
            >
              <div
                className={classNames("subtitle2 transition-all", {
                  "text-osmoverse-600": !isEstimateDetailRelevant,
                })}
              >
                {`1 ${
                  tradeTokenInConfig.sendCurrency.coinDenom !== "UNKNOWN"
                    ? tradeTokenInConfig.sendCurrency.coinDenom
                    : ""
                } ≈ ${
                  spotPrice.toDec().lt(new Dec(1))
                    ? spotPrice.toString()
                    : spotPrice.maxDecimals(6).toString()
                } ${
                  tradeTokenInConfig.outCurrency.coinDenom !== "UNKNOWN"
                    ? tradeTokenInConfig.outCurrency.coinDenom
                    : ""
                }`}
              </div>
              <div className="flex items-center gap-2">
                <Image
                  className={classNames(
                    "transition-opacity",
                    showPriceImpactWarning ? "opacity-100" : "opacity-0"
                  )}
                  alt="alert circle"
                  src="/icons/alert-circle.svg"
                  height={24}
                  width={24}
                />
                <Image
                  className={classNames(
                    "transition-all",
                    showEstimateDetails ? "rotate-180" : "rotate-0",
                    isEstimateDetailRelevant ? "opacity-100" : "opacity-0"
                  )}
                  alt="show estimates"
                  src="/icons/chevron-down.svg"
                  height={isMobile ? 14 : 18}
                  width={isMobile ? 14 : 18}
                />
              </div>
            </button>
            <div
              className={classNames(
                "absolute flex flex-col gap-4 pt-5",
                isInModal ? "w-[94%]" : "w-[358px] md:w-[94%]"
              )}
            >
              <div
                className={classNames("flex justify-between", {
                  "text-error": showPriceImpactWarning,
                })}
              >
                <div className="caption">{t("swap.priceImpact")}</div>
                <div
                  className={classNames(
                    "caption",
                    showPriceImpactWarning ? "text-error" : "text-osmoverse-200"
                  )}
                >
                  {`-${tradeTokenInConfig.expectedSwapResult.priceImpact.toString()}`}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="caption">
                  {t("swap.fee", {
                    fee: tradeTokenInConfig.expectedSwapResult.swapFee.toString(),
                  })}
                </div>
                <div className="caption text-osmoverse-200">
                  {`≈ ${
                    priceStore.calculatePrice(
                      tradeTokenInConfig.expectedSwapResult.tokenInFeeAmount
                    ) ?? "0"
                  } `}
                </div>
              </div>
              <hr className="text-white-faint" />
              <div className="flex justify-between">
                <div className="caption">{t("swap.expectedOutput")}</div>
                <div className="caption text-osmoverse-200 whitespace-nowrap">
                  {`≈ ${tradeTokenInConfig.expectedSwapResult.amount.toString()} `}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="caption">
                  {t("swap.minimumSlippage", {
                    slippage: slippageConfig.slippage.trim(true).toString(),
                  })}
                </div>
                <div
                  className={classNames(
                    "caption flex flex-col text-right gap-0.5 text-osmoverse-200"
                  )}
                >
                  <span className="whitespace-nowrap">
                    {new CoinPretty(
                      tradeTokenInConfig.outCurrency,
                      minOutAmountLessSlippage.mul(
                        DecUtils.getTenExponentNInPrecisionRange(
                          tradeTokenInConfig.outCurrency.coinDecimals
                        )
                      )
                    ).toString()}
                  </span>
                  <span>
                    {`≈ ${
                      priceStore.calculatePrice(
                        new CoinPretty(
                          tradeTokenInConfig.outCurrency,
                          minOutAmountLessSlippage.mul(
                            DecUtils.getTenExponentNInPrecisionRange(
                              tradeTokenInConfig.outCurrency.coinDecimals
                            )
                          )
                        )
                      ) || "0"
                    }`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Button
          mode={
            showPriceImpactWarning &&
            account.walletStatus === WalletStatus.Loaded
              ? "primary-warning"
              : "primary"
          }
          disabled={
            account.walletStatus === WalletStatus.Loaded &&
            (tradeTokenInConfig.error !== undefined ||
              tradeTokenInConfig.optimizedRoutePaths.length === 0 ||
              account.txTypeInProgress !== "")
          }
          onClick={swap}
        >
          {account.walletStatus === WalletStatus.Loaded ? (
            tradeTokenInConfig.error ? (
              t(...tError(tradeTokenInConfig.error))
            ) : showPriceImpactWarning ? (
              t("swap.buttonError")
            ) : (
              t("swap.button")
            )
          ) : (
            <h6 className="flex items-center gap-3">
              <Image
                alt="wallet"
                src="/icons/wallet.svg"
                height={24}
                width={24}
              />
              {t("connectWallet")}
            </h6>
          )}
        </Button>
      </div>
    );
  }
);
