import {
  FunctionComponent,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { WalletStatus } from "@keplr-wallet/stores";
import { Currency } from "@keplr-wallet/types";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { Pool } from "@osmosis-labs/pools";
import { isError } from "@osmosis-labs/stores";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import {
  IS_FRONTIER,
  PoolDetailEvents,
  SwapPageEvents,
  MakeSwapPageEvents,
} from "../../config";
import {
  useBooleanWithWindowEvent,
  useFakeFeeConfig,
  useSlippageConfig,
  useTokenSwapQueryParams,
  useTradeTokenInConfig,
  useWindowSize,
  useMatomoAnalytics,
} from "../../hooks";
import { useStore } from "../../stores";
import { Button } from "../buttons";
import { TokenSelect } from "../control/token-select";
import { InputBox } from "../input";
import { InfoTooltip } from "../tooltip";

export const TradeClipboard: FunctionComponent<{
  // IMPORTANT: Pools should be memoized!!
  pools: Pool[];

  containerClassName?: string;
  isInModal?: boolean;
}> = observer(({ containerClassName, pools, isInModal }) => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    assetsStore: { nativeBalances, ibcBalances },
    priceStore,
  } = useStore();
  const { chainId } = chainStore.osmosis;
  const { isMobile } = useWindowSize();
  const { trackEvent } = useMatomoAnalytics();

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
  const [showEstimateDetails, do_setShowEstimateDetails] = useState(false);
  const setShowEstimateDetails = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        trackEvent(SwapPageEvents.openSwapDetails);
      }
      do_setShowEstimateDetails(isOpen);
    },
    [do_setShowEstimateDetails]
  );
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
            tradeTokenInConfig.expectedSwapResult.amount.currency.coinDecimals,
            8
          )
        )
        .hideDenom(true)
        .toString(),
    [tradeTokenInConfig.expectedSwapResult.amount]
  );

  return (
    <div
      className={classNames(
        "relative rounded-[18px] flex flex-col gap-8 bg-cardInner px-5 md:px-3 pt-12 md:pt-4 pb-7 md:pb-4",
        containerClassName
      )}
    >
      <div className="relative flex items-center justify-end w-full">
        <h6 className="w-full text-center">Swap</h6>
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
              IS_FRONTIER
                ? "/icons/setting-white.svg"
                : `/icons/setting${isSettingOpen ? "-selected" : ""}.svg`
            }
            alt="setting icon"
          />
        </button>
        {isSettingOpen && (
          <div
            className="absolute bottom-[-0.5rem] right-0 translate-y-full bg-card border border-white-faint rounded-2xl p-[1.875rem] md:p-5 z-50 w-full max-w-[23.875rem]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="subtitle1 text-white-emphasis">
              Transaction Settings
            </div>
            <div className="flex items-center mt-2.5">
              <div className="body2 text-white-disabled mr-2">
                Slippage tolerance
              </div>
              <InfoTooltip content="Your transaction will revert if the price changes unfavorably by more than this percentage." />
            </div>

            <ul className="flex gap-x-3 w-full mt-3">
              {slippageConfig.selectableSlippages.map((slippage) => {
                return (
                  <li
                    key={slippage.index}
                    className={classNames(
                      "flex items-center justify-center w-full h-8 cursor-pointer rounded-full text-white-high",
                      slippage.selected ? "bg-primary-200" : "bg-background"
                    )}
                    onClick={(e) => {
                      e.preventDefault();

                      slippageConfig.select(slippage.index);

                      trackEvent(
                        MakeSwapPageEvents.setSlippageTolerance(
                          tradeTokenInConfig.sendCurrency.coinDenom,
                          tradeTokenInConfig.outCurrency.coinDenom,
                          slippageConfig.slippage.toString()
                        )
                      );
                    }}
                  >
                    <button>{slippage.slippage.toString()}</button>
                  </li>
                );
              })}
              <li
                className={classNames(
                  "flex items-center justify-center w-full h-8 cursor-pointer rounded-full",
                  slippageConfig.isManualSlippage
                    ? "text-white-high"
                    : "text-white-faint",
                  slippageConfig.isManualSlippage
                    ? slippageConfig.getManualSlippageError()
                      ? "bg-missionError"
                      : "bg-primary-200"
                    : "bg-background"
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
                      ? "text-white-faint"
                      : "text-white-high"
                  }`}
                  style="no-border"
                  currentValue={slippageConfig.manualSlippageStr}
                  onInput={(value) => {
                    slippageConfig.setManualSlippage(value);

                    trackEvent(
                      MakeSwapPageEvents.setSlippageTolerance(
                        tradeTokenInConfig.sendCurrency.coinDenom,
                        tradeTokenInConfig.outCurrency.coinDenom,
                        slippageConfig.slippage.toString()
                      )
                    );
                  }}
                  onFocus={() => slippageConfig.setIsManualSlippage(true)}
                  inputRef={manualSlippageInputRef}
                  isAutosize
                />
                <span className="shrink-0">%</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="relative flex flex-col gap-3">
        <div
          className={classNames(
            "bg-surface rounded-xl md:rounded-xl px-4 md:px-3 py-[22px] md:py-2.5 transition-all",
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
                Available
              </span>
              <span className="caption text-sm md:text-xs text-primary-50 ml-1.5">
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
              <button
                className={classNames(
                  "button text-primary-50 hover:bg-primary-50/30 border border-primary-50 text-xs py-1 px-1.5 rounded-md",
                  tradeTokenInConfig.fraction === 1
                    ? "bg-primary-50/40"
                    : "bg-transparent"
                )}
                onClick={(e) => {
                  e.preventDefault();

                  if (tradeTokenInConfig.fraction !== 1) {
                    trackEvent(SwapPageEvents.swapMaxAmount);
                    tradeTokenInConfig.setFraction(1);
                  } else {
                    tradeTokenInConfig.setFraction(undefined);
                  }
                }}
              >
                MAX
              </button>
              <button
                className={classNames(
                  "button text-primary-50 hover:bg-primary-50/30 border border-primary-50 text-xs py-1 px-1.5 rounded-md",
                  tradeTokenInConfig.fraction === 0.5
                    ? "bg-primary-50/40"
                    : "bg-transparent"
                )}
                onClick={(e) => {
                  e.preventDefault();

                  if (tradeTokenInConfig.fraction !== 0.5) {
                    trackEvent(SwapPageEvents.swapHalfAmount);
                    tradeTokenInConfig.setFraction(0.5);
                  } else {
                    tradeTokenInConfig.setFraction(undefined);
                  }
                }}
              >
                HALF
              </button>
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
              isMobile={isMobile}
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
                    tradeTokenInConfig.setAmount(e.target.value);
                  }
                }}
                value={tradeTokenInConfig.amount}
              />
              <div
                className={classNames(
                  "caption text-white-disabled transition-opacity",
                  inAmountValue ? "opacity-100" : "opacity-0"
                )}
              >{`≈ ${inAmountValue || "0"}`}</div>
            </div>
          </div>
        </div>

        <button
          className={classNames(
            "absolute flex items-center left-[45%] top-[116px] md:top-[84px] transition-all duration-500 ease-bounce z-30",
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
          onClick={() => setIsAnimatingSwitch(true)}
        >
          <div
            className={classNames(
              "w-full h-full rounded-full flex items-center shadow-elevation-04dp",
              {
                "bg-card": !isHoveringSwitchButton,
                "bg-[#4E477C]": isHoveringSwitchButton,
              }
            )}
          >
            <div className="relative w-full h-full">
              <div
                className={classNames(
                  "absolute left-[10.5px] md:left-[8px] top-[11px] md:top-[7px] transition-all duration-500 ease-bounce",
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
                  "absolute left-[12px] top-1.5 md:left-[10px] md:top-[4px] transition-all duration-500 ease-bounce",
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
            "bg-surface rounded-xl md:rounded-xl px-4 md:px-3 py-[22px] md:py-2.5 transition-all",
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
              isMobile={isMobile}
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
                tradeTokenInConfig.expectedSwapResult.amount.denom !== "UNKNOWN"
                  ? swapResultAmount
                  : "0"
              }`}</h5>
              <div
                className={classNames(
                  "caption text-white-disabled transition-opacity",
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
            "relative rounded-lg bg-card px-4 md:px-3 transition-all ease-inOutBack duration-300 overflow-hidden",
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
                "text-white-disabled": !isEstimateDetailRelevant,
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
                className={`group-hover:opacity-100 transition-all ${
                  showEstimateDetails ? "rotate-180" : "rotate-0"
                } ${isEstimateDetailRelevant ? "opacity-40" : "opacity-0"}`}
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
              <div className="caption">Price Impact</div>
              <div
                className={classNames(
                  "caption",
                  showPriceImpactWarning
                    ? "text-error"
                    : "text-wireframes-lightGrey"
                )}
              >
                {`-${tradeTokenInConfig.expectedSwapResult.priceImpact.toString()}`}
              </div>
            </div>
            <div className="flex justify-between">
              <div className="caption">
                Swap Fee (
                {tradeTokenInConfig.expectedSwapResult.swapFee.toString()})
              </div>
              <div className="caption text-wireframes-lightGrey">
                {`≈ ${
                  priceStore.calculatePrice(
                    tradeTokenInConfig.expectedSwapResult.tokenInFeeAmount
                  ) ?? "0"
                } `}
              </div>
            </div>
            <hr className="text-white-faint" />
            <div className="flex justify-between">
              <div className="caption">Expected Output</div>
              <div className="caption text-wireframes-lightGrey whitespace-nowrap">
                {`≈ ${tradeTokenInConfig.expectedSwapResult.amount.toString()} `}
              </div>
            </div>
            <div className="flex justify-between">
              <div className="caption text-white-high">
                Minimum received after slippage{" "}
                {`(${slippageConfig.slippage.trim(true).toString()})`}
              </div>
              <div
                className={classNames(
                  "caption flex flex-col text-right gap-0.5 text-wireframes-lightGrey",
                  {
                    "text-white-high": !showPriceImpactWarning,
                  }
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
        color={
          showPriceImpactWarning && account.walletStatus === WalletStatus.Loaded
            ? "error"
            : "primary"
        }
        className="flex justify-center items-center w-full h-[3.75rem] rounded-lg text-h6 md:text-button font-h6 md:font-button text-white-full shadow-elevation-04dp"
        disabled={
          account.walletStatus === WalletStatus.Loaded &&
          (tradeTokenInConfig.error !== undefined ||
            tradeTokenInConfig.optimizedRoutePaths.length === 0 ||
            account.txTypeInProgress !== "")
        }
        loading={account.txTypeInProgress !== ""}
        onClick={async () => {
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
              const tokenOutCurrency =
                chainStore.osmosisObservable.currencies.find(
                  (cur) =>
                    cur.coinMinimalDenom ===
                    tradeTokenInConfig.optimizedRoutePaths[0].tokenOutDenoms[i]
                );

              if (!tokenOutCurrency) {
                tradeTokenInConfig.setError(
                  new Error(
                    `Failed to find currency ${tradeTokenInConfig.optimizedRoutePaths[0].tokenOutDenoms[i]}`
                  )
                );
                return;
              }

              routes.push({
                poolId: pool.id,
                tokenOutCurrency,
              });
            }

            const tokenInCurrency =
              chainStore.osmosisObservable.currencies.find(
                (cur) =>
                  cur.coinMinimalDenom ===
                  tradeTokenInConfig.optimizedRoutePaths[0].tokenInDenom
              );

            if (!tokenInCurrency) {
              tradeTokenInConfig.setError(
                new Error(
                  `Failed to find currency ${tradeTokenInConfig.optimizedRoutePaths[0].tokenInDenom}`
                )
              );
              return;
            }

            const tokenIn = {
              currency: tokenInCurrency,
              amount: tradeTokenInConfig.amount,
            };
            const maxSlippage = slippageConfig.slippage.symbol("").toString();

            const trackSwapEvent = (tx: any) => {
              if (isInModal) {
                // Is in pool detail page
                if (isError(tx)) trackEvent(PoolDetailEvents.poolSwapFailure);
                else trackEvent(PoolDetailEvents.poolSwapSuccess);
              } else {
                const inToken = [
                  tokenIn.currency.coinMinimalDenom,
                  tradeTokenInConfig.amount,
                ];
                // is on swap page
                if (isError(tx))
                  trackEvent(MakeSwapPageEvents.swapFailure(...inToken));
                else trackEvent(MakeSwapPageEvents.swapSuccess(...inToken));
              }
            };

            try {
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
                        denom:
                          chainStore.osmosis.stakeCurrency.coinMinimalDenom,
                        amount: "0",
                      },
                    ],
                  },
                  {
                    preferNoSetFee: preferZeroFee,
                  },
                  trackSwapEvent
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
                        denom:
                          chainStore.osmosis.stakeCurrency.coinMinimalDenom,
                        amount: "0",
                      },
                    ],
                  },
                  {
                    preferNoSetFee: preferZeroFee,
                  },
                  (tx) => {
                    trackEvent(SwapPageEvents.multiHopSwap);
                    trackSwapEvent(tx);
                  }
                );
              }
              tradeTokenInConfig.setAmount("");
              tradeTokenInConfig.setFraction(undefined);
            } catch (e) {
              console.error(e);
            }
          }
        }}
      >
        {account.walletStatus === WalletStatus.Loaded ? (
          tradeTokenInConfig.error ? (
            tradeTokenInConfig.error.message
          ) : showPriceImpactWarning ? (
            "Swap Anyway"
          ) : (
            "Swap"
          )
        ) : (
          <div className="flex items-center gap-1">
            <Image
              alt="wallet"
              src="/icons/wallet.svg"
              height={24}
              width={24}
            />
            <span>Connect Wallet</span>
          </div>
        )}
      </Button>
    </div>
  );
});
