import { WalletStatus } from "@cosmos-kit/core";
import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { ObservableQueryPool } from "@osmosis-labs/stores";
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

import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useDisclosure,
  useFakeFeeConfig,
  useSlippageConfig,
  useTokenSwapQueryParams,
  useTradeTokenInConfig,
  useWindowSize,
} from "~/hooks";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { useWalletSelect } from "~/hooks/wallet-select";
import { useStore } from "~/stores";

import { AdBanner } from "../ad-banner";
import { Ad } from "../ad-banner/ad-banner-types";
import { Icon } from "../assets";
import { Button } from "../buttons";
import IconButton from "../buttons/icon-button";
import { TokenSelectWithDrawer } from "../control/token-select-with-drawer";
import {
  showConcentratedLiquidityPromo,
  SwapToolPromo as ConcentratedLiquidityPromo,
} from "../funnels/concentrated-liquidity/swap-tool-promo";
import { InputBox } from "../input";
import { tError } from "../localization";
import { Popover } from "../popover";
import { InfoTooltip } from "../tooltip";
import { PromoDrawer } from "./promo-drawer";
import { SplitRoute } from "./split-route";

export const SwapTool: FunctionComponent<{
  // IMPORTANT: Pools should be memoized!!
  pools: ObservableQueryPool[];

  containerClassName?: string;
  isInModal?: boolean;
  onRequestModalClose?: () => void;
  swapButton?: React.ReactElement;
  ads?: Ad[];
}> = observer(
  ({
    containerClassName,
    pools,
    isInModal,
    onRequestModalClose,
    swapButton,
    ads,
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
    const featureFlags = useFeatureFlags();

    const tradeableCurrencies = chainStore.getChain(
      chainStore.osmosis.chainId
    ).currencies;
    const tradeableCurrenciesRef = useLatest(tradeableCurrencies);

    const account = accountStore.getWallet(chainId);
    const queries = queriesStore.get(chainId);

    const manualSlippageInputRef = useRef<HTMLInputElement | null>(null);
    const [
      estimateDetailsContentRef,
      { height: estimateDetailsContentHeight, y: estimateDetailsContentOffset },
    ] = useMeasure<HTMLDivElement>();

    const slippageConfig = useSlippageConfig();
    const { tradeTokenInConfig, tradeTokenIn } = useTradeTokenInConfig(
      chainId,
      pools
    );

    const gasForecasted =
      250000 *
      (tradeTokenInConfig.optimizedRoutes?.flatMap(({ pools }) => pools)
        .length ?? 1);

    const feeConfig = useFakeFeeConfig(
      chainStore,
      chainStore.osmosis.chainId,
      gasForecasted
    );
    tradeTokenInConfig.setFeeConfig(feeConfig);

    const routesVisDisclosure = useDisclosure();

    const [willDisplayPromo, setWillDisplayPromo] = useState(false);

    // show details
    const [showEstimateDetails, setShowEstimateDetails] = useState(false);
    const isEstimateDetailRelevant = !tradeTokenInConfig.isEmptyInput;
    // auto collapse on input clear
    useEffect(() => {
      if (!isEstimateDetailRelevant && !tradeTokenInConfig.isQuoteLoading)
        setShowEstimateDetails(false);
    }, [
      isEstimateDetailRelevant,
      tradeTokenInConfig.isQuoteLoading,
      setShowEstimateDetails,
    ]);

    // auto focus from amount on token switch
    const fromAmountInput = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
      fromAmountInput.current?.focus();
    }, [tradeTokenInConfig.sendCurrency]);

    const showPriceImpactWarning =
      tradeTokenInConfig.expectedSwapResult.priceImpact
        .toDec()
        .abs()
        .gt(new Dec(0.1));

    // token select dropdown
    const fetchedRemainingPoolsRef = useRef(false);
    const fetchRemainingPoolsOnce = useCallback(() => {
      if (!fetchedRemainingPoolsRef.current) {
        fetchedRemainingPoolsRef.current = true;
        queries.osmosis?.queryPools.fetchRemainingPools();
      }
    }, [queries.osmosis?.queryPools]);
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

    // to & from box switch animation
    const [isHoveringSwitchButton, setHoveringSwitchButton] = useState(false);
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
    const swap = () => {
      if (account?.walletStatus !== WalletStatus.Connected) {
        return onOpenWalletSelect(chainId);
      }

      if (tradeTokenInConfig.isEmptyInput) return;

      const baseEvent = {
        fromToken: tradeTokenInConfig.sendCurrency.coinDenom,
        tokenAmount: Number(tradeTokenInConfig.amount),
        toToken: tradeTokenInConfig.outCurrency.coinDenom,
        isOnHome: !isInModal,
        isMultiHop: tradeTokenInConfig.optimizedRoutes?.some(
          ({ pools }) => pools.length !== 1
        ),
      };
      logEvent([EventName.Swap.swapStarted, baseEvent]);
      tradeTokenIn(slippageConfig.slippage.toDec())
        .then((result) => {
          // onFullfill
          logEvent([
            EventName.Swap.swapCompleted,
            {
              ...baseEvent,
              isMultiHop: result === "multihop",
            },
          ]);
        })
        .catch((error) => {
          // failed broadcast txs are handled elsewhere
          // this is likely a signature rejection
          console.error("swap error", error);
        })
        .finally(() => {
          onRequestModalClose?.();
        });
    };

    useTokenSwapQueryParams(tradeTokenInConfig, tradeableCurrencies, isInModal);

    const outAmountLessSlippage = tradeTokenInConfig.outAmountLessSlippage(
      slippageConfig.slippage.toDec()
    );

    const flags = useFeatureFlags();
    const shouldShowConcentratedLiquidityPromo = showConcentratedLiquidityPromo(
      flags.concentratedLiquidity,
      pools,
      tradeTokenInConfig.sendCurrency,
      tradeTokenInConfig.outCurrency
    );

    return (
      <>
        {ads &&
          featureFlags.swapsAdBanner &&
          !shouldShowConcentratedLiquidityPromo && <AdBanner ads={ads} />}
        <div
          className={classNames(
            "relative overflow-hidden",
            containerClassName,
            willDisplayPromo && "-translate-y-[6%] transform"
          )}
        >
          {!isInModal && (
            <PromoDrawer
              show={shouldShowConcentratedLiquidityPromo}
              beforeEnter={() => setWillDisplayPromo(true)}
            >
              <ConcentratedLiquidityPromo
                pools={pools}
                sendCurrency={tradeTokenInConfig.sendCurrency}
                outCurrency={tradeTokenInConfig.outCurrency}
              />
            </PromoDrawer>
          )}
          <div className="relative flex flex-col gap-8 overflow-hidden rounded-3xl bg-osmoverse-800 px-6 py-8 md:gap-6 md:px-3 md:pt-4 md:pb-4">
            <Popover>
              {({ open, close }) => (
                <>
                  <Popover.Overlay className="absolute inset-0 z-40 !rounded-3xl bg-osmoverse-1000/80" />

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
                        <InfoTooltip
                          content={t("swap.settings.slippageInfo")}
                        />
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
                                    percentage:
                                      slippageConfig.slippage.toString(),
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
                                  toToken:
                                    tradeTokenInConfig.outCurrency.coinDenom,
                                  isOnHome: !isInModal,
                                  percentage:
                                    slippageConfig.slippage.toString(),
                                },
                              ]);
                            }}
                            onFocus={() =>
                              slippageConfig.setIsManualSlippage(true)
                            }
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
                        .getQueryBech32Address(account?.address ?? "")
                        .getBalanceFromCurrency(tradeTokenInConfig.sendCurrency)
                        .trim(true)
                        .hideDenom(true)
                        .maxDecimals(8)
                        .toString()}{" "}
                      {tradeTokenInConfig.sendCurrency.coinDenom}
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
                              fromToken:
                                tradeTokenInConfig.sendCurrency.coinDenom,
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
                              fromToken:
                                tradeTokenInConfig.sendCurrency.coinDenom,
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
                    selectedTokenDenom={
                      tradeTokenInConfig.sendCurrency.coinDenom
                    }
                    onSelect={(tokenDenom: string) => {
                      const tokenInCurrency =
                        tradeableCurrenciesRef.current.find(
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
                              fromToken:
                                tradeTokenInConfig.sendCurrency.coinDenom,
                              toToken: tradeTokenInConfig.outCurrency.coinDenom,
                              isOnHome: !isInModal,
                            },
                          ]);
                          tradeTokenInConfig.setAmount(e.target.value);
                        }
                      }}
                      value={tradeTokenInConfig.amount}
                    />
                    <span
                      className={classNames(
                        "subtitle1 md:caption text-osmoverse-300 transition-opacity",
                        tradeTokenInConfig.sendValue.toDec().isZero()
                          ? "opacity-0"
                          : "opacity-100"
                      )}
                    >{`≈ ${tradeTokenInConfig.sendValue}`}</span>
                  </div>
                </div>
              </div>

              <button
                className={classNames(
                  "absolute left-[45%] top-[220px] z-30 flex items-center transition-all duration-500 ease-bounce md:top-[174px]",
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
                    selectedTokenDenom={
                      tradeTokenInConfig.outCurrency.coinDenom
                    }
                    onSelect={(tokenDenom: string) => {
                      const tokenOutCurrency =
                        tradeableCurrenciesRef.current.find(
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
                        "md:subtitle1 whitespace-nowrap text-right",
                        tradeTokenInConfig.expectedSwapResult.amount
                          .toDec()
                          .isPositive()
                          ? "text-white-full"
                          : "text-white-disabled"
                      )}
                    >{`≈ ${tradeTokenInConfig.expectedSwapResult.amount
                      .trim(true)
                      .shrink(true)
                      .maxDecimals(
                        Math.min(
                          tradeTokenInConfig.expectedSwapResult.amount.currency
                            .coinDecimals,
                          8
                        )
                      )
                      .hideDenom(true)}`}</h5>
                    <span
                      className={classNames(
                        "subtitle1 md:caption text-osmoverse-300 transition-opacity",
                        tradeTokenInConfig.outValue.toDec().isZero()
                          ? "opacity-0"
                          : "opacity-100"
                      )}
                    >
                      {`≈ ${tradeTokenInConfig.outValue}`}
                    </span>
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
                  <span
                    className={classNames("subtitle2 transition-all", {
                      "text-osmoverse-600": !isEstimateDetailRelevant,
                    })}
                  >
                    {`1 ${
                      tradeTokenInConfig.sendCurrency.coinDenom
                    } ≈ ${tradeTokenInConfig.expectedSpotPrice
                      .trim(true)
                      .maxDecimals(
                        Math.min(tradeTokenInConfig.outCurrency.coinDecimals, 8)
                      )} ${tradeTokenInConfig.outCurrency.coinDenom}`}
                  </span>
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
                    className={classNames("flex justify-between gap-1", {
                      "text-error": showPriceImpactWarning,
                    })}
                  >
                    <span className="caption">{t("swap.priceImpact")}</span>
                    <span
                      className={classNames(
                        "caption",
                        showPriceImpactWarning
                          ? "text-error"
                          : "text-osmoverse-200"
                      )}
                    >
                      {`${tradeTokenInConfig.expectedSwapResult.priceImpact
                        .maxDecimals(4)
                        .toString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="caption">
                      {t("swap.fee", {
                        fee: tradeTokenInConfig.expectedSwapResult.swapFee.toString(),
                      })}
                    </span>
                    <span className="caption text-osmoverse-200">
                      {`≈ ${
                        priceStore.calculatePrice(
                          tradeTokenInConfig.expectedSwapResult.tokenInFeeAmount
                        ) ?? "0"
                      } `}
                    </span>
                  </div>
                  <hr className="text-white-faint" />
                  <div className="flex justify-between gap-1">
                    <span className="caption max-w-[140px]">
                      {t("swap.expectedOutput")}
                    </span>
                    <span className="caption whitespace-nowrap text-osmoverse-200">
                      {`≈ ${tradeTokenInConfig.expectedSwapResult.amount
                        .maxDecimals(
                          tradeTokenInConfig.expectedSwapResult.amount
                            .toDec()
                            .gt(new Dec(1))
                            ? Math.min(
                                tradeTokenInConfig.outCurrency.coinDecimals,
                                8
                              )
                            : Math.min(
                                tradeTokenInConfig.outCurrency.coinDecimals,
                                12
                              )
                        )
                        .trim(true)
                        .toString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between gap-1">
                    <span className="caption max-w-[140px]">
                      {t("swap.minimumSlippage", {
                        slippage: slippageConfig.slippage.trim(true).toString(),
                      })}
                    </span>
                    <div
                      className={classNames(
                        "caption flex flex-col gap-0.5 text-right text-osmoverse-200"
                      )}
                    >
                      <span className="whitespace-nowrap">
                        {outAmountLessSlippage
                          .maxDecimals(
                            outAmountLessSlippage.toDec().gt(new Dec(1))
                              ? Math.min(
                                  tradeTokenInConfig.outCurrency.coinDecimals,
                                  8
                                )
                              : Math.min(
                                  tradeTokenInConfig.outCurrency.coinDecimals,
                                  12
                                )
                          )
                          .toString()}
                      </span>
                      <span>{`≈ ${
                        priceStore.calculatePrice(outAmountLessSlippage) || "0"
                      }`}</span>
                    </div>
                  </div>
                  {!isInModal &&
                    tradeTokenInConfig.optimizedRoutes.length > 0 && (
                      <SplitRoute
                        {...routesVisDisclosure}
                        split={tradeTokenInConfig.optimizedRoutes}
                      />
                    )}
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
                  (tradeTokenInConfig.isEmptyInput ||
                    Boolean(tradeTokenInConfig.error) ||
                    account?.txTypeInProgress !== "" ||
                    tradeTokenInConfig.isQuoteLoading)
                }
                onClick={swap}
              >
                {account?.walletStatus === WalletStatus.Connected ? (
                  Boolean(tradeTokenInConfig.error) ? (
                    t(...tError(tradeTokenInConfig.error))
                  ) : showPriceImpactWarning ? (
                    t("swap.buttonError")
                  ) : (
                    t("swap.button")
                  )
                ) : (
                  <h6 className="flex items-center gap-3">
                    <Icon id="wallet" className="h-6 w-6" />
                    {t("connectWallet")}
                  </h6>
                )}
              </Button>
            )}
          </div>
        </div>
      </>
    );
  }
);
