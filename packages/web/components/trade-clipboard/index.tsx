import { WalletStatus } from "@cosmos-kit/core";
import { AppCurrency, Currency } from "@keplr-wallet/types";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { Pool } from "@osmosis-labs/pools";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import {
  Fragment,
  FunctionComponent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";
import { useLatest, useMeasure } from "react-use";

import { useWalletSelect } from "~/hooks/wallet-select";

import { EventName } from "../../config";
import {
  useAmplitudeAnalytics,
  useFakeFeeConfig,
  useSlippageConfig,
  useTokenSwapQueryParams,
  useTradeTokenInConfig,
  useWindowSize,
} from "../../hooks";
import { useStore } from "../../stores";
import { Icon } from "../assets";
import { Button } from "../buttons";
import IconButton from "../buttons/icon-button";
import { TokenSelectWithDrawer } from "../control/token-select-with-drawer";
import { InputBox } from "../input";
import { tError } from "../localization";
import { Popover } from "../popover";
import { InfoTooltip } from "../tooltip";
import TradeRoute from "./trade-route";

export const TradeClipboard: FunctionComponent<{
  // IMPORTANT: Pools should be memoized!!
  pools: Pool[];

  containerClassName?: string;
  isInModal?: boolean;
  onRequestModalClose?: () => void;
  swapButton?: React.ReactElement;
}> = observer(
  ({
    containerClassName,
    pools,
    isInModal,
    onRequestModalClose,
    swapButton,
  }) => {
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
    const { onOpenWalletSelect } = useWalletSelect();

    const tradeableCurrencies = chainStore.getChain(
      chainStore.osmosis.chainId
    ).currencies;
    const tradeableCurrenciesRef = useLatest(tradeableCurrencies);

    const account = accountStore.getWallet(chainId);
    const address = account?.address ?? "";
    const queries = queriesStore.get(chainId);

    const manualSlippageInputRef = useRef<HTMLInputElement | null>(null);
    const [
      estimateDetailsContentRef,
      { height: estimateDetailsContentHeight, y: estimateDetailsContentOffset },
    ] = useMeasure<HTMLDivElement>();

    const slippageConfig = useSlippageConfig();
    const tradeTokenInConfig = useTradeTokenInConfig(
      chainStore,
      chainId,
      address,
      queriesStore,
      pools
    );

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
      gasForecasted
    );
    tradeTokenInConfig.setFeeConfig(feeConfig);

    // show details
    const [showEstimateDetails, _setShowEstimateDetails] = useState(false);
    const isEstimateDetailRelevant = !(
      tradeTokenInConfig.amount === "" || tradeTokenInConfig.amount === "0"
    );
    const setShowEstimateDetails = useCallback(
      (value: boolean) => {
        // refresh current route's pools
        if (value) {
          tradeTokenInConfig.optimizedRoutePaths.forEach((route) => {
            route.pools.forEach((pool) => {
              queries.osmosis?.queryGammPools
                .getPool(pool.id)
                ?.waitFreshResponse();
            });
          });
        }

        _setShowEstimateDetails(value);
      },
      [tradeTokenInConfig, queries.osmosis?.queryGammPools]
    );
    useEffect(() => {
      // auto collapse on input clear
      if (!isEstimateDetailRelevant) setShowEstimateDetails(false);
    }, [isEstimateDetailRelevant, setShowEstimateDetails]);

    // auto focus from amount on token switch
    const fromAmountInput = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
      fromAmountInput.current?.focus();
    }, [tradeTokenInConfig.sendCurrency]);

    useTokenSwapQueryParams(tradeTokenInConfig, tradeableCurrencies, isInModal);

    const showPriceImpactWarning = useMemo(
      () =>
        tradeTokenInConfig.expectedSwapResult.priceImpact
          .toDec()
          .gt(new Dec(0.1)),
      [tradeTokenInConfig.expectedSwapResult.priceImpact]
    );

    // token select dropdown
    const fetchedRemainingPoolsRef = useRef(false);
    const fetchRemainingPoolsOnce = useCallback(() => {
      if (!fetchedRemainingPoolsRef.current) {
        fetchedRemainingPoolsRef.current = true;
        queries.osmosis?.queryGammPools.fetchRemainingPools();
      }
    }, [queries.osmosis?.queryGammPools]);
    const [showFromTokenSelectDropdown, _setFromTokenSelectDropdownLocal] =
      useState(false);
    const setFromTokenSelectDropdownLocal = useCallback(
      (val: boolean) => {
        fetchRemainingPoolsOnce();
        _setFromTokenSelectDropdownLocal(val);
      },
      [fetchRemainingPoolsOnce]
    );
    const [showToTokenSelectDropdown, _setToTokenSelectDropdownLocal] =
      useState(false);
    const setToTokenSelectDropdownLocal = useCallback(
      (val: boolean) => {
        fetchRemainingPoolsOnce();
        _setToTokenSelectDropdownLocal(val);
      },
      [fetchRemainingPoolsOnce]
    );
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
    const minOutAmountLessSlippage = useMemo(() => {
      const coinLessSlippage = new CoinPretty(
        tradeTokenInConfig.outCurrency,
        tradeTokenInConfig.expectedSwapResult.amount
          .toDec()
          .mul(new Dec(1).sub(slippageConfig.slippage.toDec()))
          .mulTruncate(
            DecUtils.getTenExponentNInPrecisionRange(
              tradeTokenInConfig.outCurrency.coinDecimals
            )
          )
      );

      return coinLessSlippage.maxDecimals(
        Math.min(
          coinLessSlippage.toDec().gt(new Dec(1)) ? 8 : 12,
          coinLessSlippage.currency.coinDecimals
        )
      );
    }, [
      tradeTokenInConfig.outCurrency,
      tradeTokenInConfig.expectedSwapResult.amount,
      slippageConfig.slippage,
    ]);
    const spotPrice = useMemo(
      () =>
        tradeTokenInConfig.beforeSpotPriceWithoutSwapFeeOutOverIn
          .trim(true)
          .maxDecimals(
            Math.min(tradeTokenInConfig.outCurrency.coinDecimals, 8)
          ),
      [
        tradeTokenInConfig.beforeSpotPriceWithoutSwapFeeOutOverIn,
        tradeTokenInConfig.outCurrency.coinDecimals,
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
      [priceStore, tradeTokenInConfig.amount, tradeTokenInConfig.sendCurrency]
    );
    const outAmountValue = useMemo(
      () =>
        (!tradeTokenInConfig.expectedSwapResult.amount.toDec().isZero() &&
          priceStore.calculatePrice(
            tradeTokenInConfig.expectedSwapResult.amount
          )) ||
        undefined,
      [priceStore, tradeTokenInConfig.expectedSwapResult.amount]
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

    // get selectable tokens in drawers
    /** Filters out tokens (by denom) if
     * 1. not given token selected in other token select component
     * 2. not in sendable currencies
     */
    const getTokenSelectTokens = useCallback(
      (otherSelectedToken: string) => {
        return tradeableCurrencies
          .filter((currency) => currency.coinDenom !== otherSelectedToken)
          .filter((currency) =>
            // is in the sendable currencies list. AKA in the given pools
            tradeTokenInConfig.sendableCurrencies.some(
              (sendableCurrency) =>
                sendableCurrency.coinDenom === currency.coinDenom
            )
          )
          .map((currency) => {
            // return just currencies if in modal
            if (isInModal) {
              return currency;
            }

            // respect filtering conditions in assets store (verified assets, etc.)
            const coins = nativeBalances.concat(ibcBalances);
            return coins.find(
              (coin) => coin.balance.denom === currency.coinDenom
            )?.balance;
          })
          .filter(
            (coin): coin is CoinPretty | AppCurrency => coin !== undefined
          );
      },
      [
        tradeableCurrencies,
        tradeTokenInConfig.sendableCurrencies,
        isInModal,
        nativeBalances,
        ibcBalances,
      ]
    );
    // only filter/map when necessary
    const tokenInTokens = useMemo(
      () => getTokenSelectTokens(tradeTokenInConfig.outCurrency.coinDenom),
      [getTokenSelectTokens, tradeTokenInConfig.outCurrency.coinDenom]
    );
    const tokenOutTokens = useMemo(
      () => getTokenSelectTokens(tradeTokenInConfig.sendCurrency.coinDenom),
      [getTokenSelectTokens, tradeTokenInConfig.sendCurrency.coinDenom]
    );

    // user action
    const swap = async () => {
      if (account?.walletStatus !== WalletStatus.Connected) {
        return onOpenWalletSelect(chainStore.osmosis.chainId);
      }
      if (tradeTokenInConfig.optimizedRoutePaths.length > 0) {
        const routePools: {
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

          routePools.push({
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
          amount: tradeTokenInConfig.getAmountPrimitive().amount,
        };

        try {
          logEvent([
            EventName.Swap.swapStarted,
            {
              fromToken: tradeTokenInConfig.sendCurrency.coinDenom,
              tokenAmount: Number(tokenIn.amount),
              toToken: tradeTokenInConfig.outCurrency.coinDenom,
              isOnHome: !isInModal,
              isMultiHop: routePools.length !== 1,
            },
          ]);
          if (routePools.length === 1) {
            await account.osmosis.sendSwapExactAmountInMsg(
              routePools[0].poolId,
              tokenIn,
              routePools[0].tokenOutCurrency,
              minOutAmountLessSlippage.toCoin().amount,
              "",
              {
                amount: [
                  {
                    denom: chainStore.osmosis.stakeCurrency.coinMinimalDenom,
                    amount: "0",
                  },
                ],
              },
              undefined,
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
              routePools,
              tokenIn,
              minOutAmountLessSlippage.toCoin().amount,
              "",
              {
                amount: [
                  {
                    denom: chainStore.osmosis.stakeCurrency.coinMinimalDenom,
                    amount: "0",
                  },
                ],
              },
              undefined,
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
          "relative flex flex-col gap-8 overflow-hidden rounded-[24px] bg-osmoverse-800 px-6 pt-12 pb-8 md:gap-6 md:px-3 md:pt-4 md:pb-4",
          containerClassName
        )}
      >
        <Popover>
          {({ open, close }) => (
            <>
              <Popover.Overlay className="absolute inset-0 z-40 bg-osmoverse-1000/80" />

              <div className="relative flex w-full items-center justify-end">
                <h6 className="w-full text-center">{t("swap.title")}</h6>
                <Popover.Button as={Fragment}>
                  <IconButton
                    aria-label="Open swap settings"
                    className="absolute top-0 right-3 z-40 w-fit py-0"
                    size="unstyled"
                    mode="unstyled"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTokenSelectDropdowns();
                    }}
                    icon={
                      <Icon
                        id="setting"
                        width={isMobile ? 20 : 28}
                        height={isMobile ? 20 : 28}
                        className={
                          open
                            ? "text-white"
                            : "text-osmoverse-400 hover:text-white-full"
                        }
                      />
                    }
                  />
                </Popover.Button>

                <Popover.Panel
                  className="absolute bottom-[-0.5rem] right-0 z-40 w-full max-w-[23.875rem] translate-y-full rounded-2xl bg-osmoverse-800 p-[1.875rem] shadow-md md:p-5"
                  onClick={(e: MouseEvent) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between">
                    <h6>{t("swap.settings.title")}</h6>
                    <IconButton
                      aria-label="Close"
                      mode="unstyled"
                      size="unstyled"
                      className="w-fit"
                      icon={
                        <Icon
                          id="close"
                          width={32}
                          height={32}
                          className="text-osmoverse-400"
                        />
                      }
                      onClick={() => close()}
                    />
                  </div>
                  <div className="mt-2.5 flex items-center">
                    <div className="subtitle1 mr-2 text-osmoverse-200">
                      {t("swap.settings.slippage")}
                    </div>
                    <InfoTooltip content={t("swap.settings.slippageInfo")} />
                  </div>

                  <ul className="mt-3 flex w-full gap-x-3">
                    {slippageConfig.selectableSlippages.map((slippage) => {
                      return (
                        <li
                          key={slippage.index}
                          className={classNames(
                            "flex h-8 w-full cursor-pointer items-center justify-center rounded-lg bg-osmoverse-700",
                            {
                              "border-2 border-wosmongton-200":
                                slippage.selected,
                            }
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
                        "flex h-8 w-full cursor-pointer items-center justify-center rounded-lg",
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
                        className="w-fit bg-transparent px-0"
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
                              fromToken:
                                tradeTokenInConfig.sendCurrency.coinDenom,
                              toToken: tradeTokenInConfig.outCurrency.coinDenom,
                              isOnHome: !isInModal,
                              percentage: slippageConfig.slippage.toString(),
                            },
                          ]);
                        }}
                        onFocus={() => slippageConfig.setIsManualSlippage(true)}
                        inputRef={manualSlippageInputRef}
                        isAutosize
                        autoFocus={slippageConfig.isManualSlippage}
                      />
                      <span
                        className={classNames("shrink-0", {
                          "text-osmoverse-500":
                            !slippageConfig.isManualSlippage,
                        })}
                      >
                        %
                      </span>
                    </li>
                  </ul>
                </Popover.Panel>
              </div>
            </>
          )}
        </Popover>

        <div className="flex flex-col gap-3">
          <div
            className={classNames(
              "rounded-xl bg-osmoverse-900 px-4 py-[22px] transition-all md:rounded-xl md:px-3 md:py-2.5",
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
                "flex place-content-between items-center transition-opacity",
                {
                  "opacity-0": isAnimatingSwitch,
                }
              )}
            >
              <div className="flex">
                <span className="caption text-sm text-white-full md:text-xs">
                  {t("swap.available")}
                </span>
                <span className="caption ml-1.5 text-sm text-wosmongton-300 md:text-xs">
                  {queries.queryBalances
                    .getQueryBech32Address(address)
                    .getBalanceFromCurrency(tradeTokenInConfig.sendCurrency)
                    .trim(true)
                    .hideDenom(true)
                    .maxDecimals(8)
                    .toString()}{" "}
                  {tradeTokenInConfig.sendCurrency.coinDenom.toLowerCase() ===
                  "unknown"
                    ? ""
                    : tradeTokenInConfig.sendCurrency.coinDenom}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  mode="amount"
                  className={classNames(
                    "py-1 px-1.5 text-xs",
                    tradeTokenInConfig.fraction === 0.5
                      ? "bg-wosmongton-100/20"
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
                </Button>
                <Button
                  mode="amount"
                  className={classNames(
                    "py-1 px-1.5 text-xs",
                    tradeTokenInConfig.fraction === 1
                      ? "bg-wosmongton-100/20"
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
                </Button>
              </div>
            </div>
            <div className="mt-3 flex place-content-between items-center">
              <TokenSelectWithDrawer
                sortByBalances
                dropdownOpen={showFromTokenSelectDropdown}
                setDropdownState={(isOpen) => {
                  if (isOpen) {
                    setOneTokenSelectOpen("from");
                  } else {
                    closeTokenSelectDropdowns();
                  }
                }}
                tokens={tokenInTokens}
                selectedTokenDenom={tradeTokenInConfig.sendCurrency.coinDenom}
                onSelect={(tokenDenom: string) => {
                  const tokenInCurrency = tradeableCurrenciesRef.current.find(
                    (currency) => currency.coinDenom === tokenDenom
                  );
                  if (tokenInCurrency) {
                    tradeTokenInConfig.setSendCurrency(tokenInCurrency);
                  }
                  closeTokenSelectDropdowns();
                }}
              />
              <div className="flex w-full flex-col items-end">
                <input
                  ref={fromAmountInput}
                  type="number"
                  className={classNames(
                    "w-full bg-transparent text-right text-white-full placeholder:text-white-disabled focus:outline-none md:text-subtitle1",
                    tradeTokenInConfig.amount.length >= 14
                      ? "caption"
                      : "text-h5 font-h5 md:font-subtitle1"
                  )}
                  placeholder="0"
                  onChange={(e) => {
                    e.preventDefault();
                    if (
                      !isNaN(Number(e.target.value)) &&
                      Number(e.target.value) >= 0 &&
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
              "absolute left-[45%] top-[235px] z-30 flex items-center shadow-[0_4px_4px_rgba(0,0,0,0.25)] transition-all duration-500 ease-bounce md:top-[178px]",
              {
                "h-10 w-10 md:h-8 md:w-8": !isHoveringSwitchButton,
                "h-11 w-11 -translate-x-[2px] md:h-9 md:w-9":
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
                "flex h-full w-full items-center rounded-full",
                {
                  "bg-osmoverse-700": !isHoveringSwitchButton,
                  "bg-[#4E477C]": isHoveringSwitchButton,
                }
              )}
            >
              <div className="relative h-full w-full">
                <div
                  className={classNames(
                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/3 transition-all duration-500 ease-bounce",
                    {
                      "rotate-180 opacity-0": isHoveringSwitchButton,
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
                    "absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/3 transition-all duration-500 ease-bounce",
                    {
                      "rotate-180 opacity-100": isHoveringSwitchButton,
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
              "rounded-xl bg-osmoverse-900 px-4 py-[22px] transition-all md:rounded-xl md:px-3 md:py-2.5",
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
              className="flex place-content-between items-center transition-transform"
              style={
                isAnimatingSwitch
                  ? {
                      transform: "scaleY(0.6)",
                    }
                  : undefined
              }
            >
              <TokenSelectWithDrawer
                dropdownOpen={showToTokenSelectDropdown}
                setDropdownState={(isOpen) => {
                  if (isOpen) {
                    setOneTokenSelectOpen("to");
                  } else {
                    closeTokenSelectDropdowns();
                  }
                }}
                sortByBalances
                tokens={tokenOutTokens}
                selectedTokenDenom={tradeTokenInConfig.outCurrency.coinDenom}
                onSelect={(tokenDenom: string) => {
                  const tokenOutCurrency = tradeableCurrenciesRef.current.find(
                    (currency) => currency.coinDenom === tokenDenom
                  );
                  if (tokenOutCurrency) {
                    tradeTokenInConfig.setOutCurrency(tokenOutCurrency);
                  }
                  closeTokenSelectDropdowns();
                }}
              />
              <div className="flex w-full flex-col items-end">
                <h5
                  className={classNames(
                    "md:subtitle1 text-right",
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
              "relative overflow-hidden rounded-lg bg-osmoverse-900 px-4 transition-all duration-300 ease-inOutBack md:px-3",
              showEstimateDetails ? "py-6" : "py-[10px]"
            )}
            style={{
              height: showEstimateDetails
                ? (estimateDetailsContentHeight +
                    estimateDetailsContentOffset ?? 288) +
                  44 + // collapsed height
                  20 // padding
                : 44,
            }}
          >
            <button
              className={classNames(
                "flex w-full place-content-between items-center",
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
                } ≈ ${spotPrice} ${
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
                <Icon
                  id="chevron-down"
                  height={isMobile ? 14 : 18}
                  width={isMobile ? 14 : 18}
                  className={classNames(
                    "text-osmoverse-400 transition-all",
                    showEstimateDetails ? "rotate-180" : "rotate-0",
                    isEstimateDetailRelevant ? "opacity-100" : "opacity-0"
                  )}
                />
              </div>
            </button>
            <div
              ref={estimateDetailsContentRef}
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
                <div className="caption whitespace-nowrap text-osmoverse-200">
                  {`≈ ${tradeTokenInConfig.expectedSwapResult.amount
                    .maxDecimals(
                      tradeTokenInConfig.expectedSwapResult.amount
                        .toDec()
                        .gt(new Dec(1))
                        ? Math.min(
                            tradeTokenInConfig.outCurrency.coinDecimals,
                            12
                          )
                        : Math.min(
                            tradeTokenInConfig.outCurrency.coinDecimals,
                            8
                          )
                    )
                    .trim(true)
                    .toString()} `}
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
                    "caption flex flex-col gap-0.5 text-right text-osmoverse-200"
                  )}
                >
                  <span className="whitespace-nowrap">
                    {minOutAmountLessSlippage.toString()}
                  </span>
                  <span>
                    {`≈ ${
                      priceStore.calculatePrice(minOutAmountLessSlippage) || "0"
                    }`}
                  </span>
                </div>
              </div>
              {!isInModal &&
                tradeTokenInConfig.optimizedRoutePaths
                  .slice(0, 1)
                  .map((route, index) => (
                    <TradeRoute
                      key={index}
                      sendCurrency={tradeTokenInConfig.sendCurrency}
                      outCurrency={tradeTokenInConfig.outCurrency}
                      route={route}
                      isMultihopOsmoFeeDiscount={
                        tradeTokenInConfig.expectedSwapResult
                          .isMultihopOsmoFeeDiscount
                      }
                    />
                  ))}
            </div>
          </div>
        </div>
        {swapButton ?? (
          <Button
            mode={
              showPriceImpactWarning &&
              account?.walletStatus === WalletStatus.Connected
                ? "primary-warning"
                : "primary"
            }
            disabled={
              account?.walletStatus === WalletStatus.Connected &&
              (tradeTokenInConfig.error !== undefined ||
                tradeTokenInConfig.optimizedRoutePaths.length === 0 ||
                account?.txTypeInProgress !== "")
            }
            onClick={swap}
          >
            {account?.walletStatus === WalletStatus.Connected ? (
              tradeTokenInConfig.error ? (
                t(...tError(tradeTokenInConfig.error))
              ) : showPriceImpactWarning ? (
                t("swap.buttonError")
              ) : (
                t("swap.button")
              )
            ) : (
              <h6 className="flex items-center gap-3">
                <Icon id="wallet" className="text-white h-[24px] w-[24px]" />
                {t("connectWallet")}
              </h6>
            )}
          </Button>
        )}
      </div>
    );
  }
);
