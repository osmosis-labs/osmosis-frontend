import { WalletStatus } from "@keplr-wallet/stores";
import { Currency } from "@keplr-wallet/types";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { Pool } from "@osmosis-labs/pools";
import { Buffer } from "buffer";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, {
  FunctionComponent,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import {
  IS_FRONTIER,
  REGISTRY_ADDRESSES,
  WRAPPER_ADDRESSES,
} from "../../config";
import {
  useBooleanWithWindowEvent,
  useOrderTokenInConfig,
  useSlippageConfig,
  useTokenSwapQueryParams,
  useWindowSize,
} from "../../hooks";
import { useStore } from "../../stores";
// import { Error as ErrorBox } from "../alert";
import { Button } from "../buttons";
import { CheckBox } from "../control/checkbox";
import { TokenSelect } from "../control/token-select";
import { InputBox } from "../input";
import { InfoTooltip } from "../tooltip";

export const TradeClipboard: FunctionComponent<{
  // IMPORTANT: Pools should be memoized!!
  pools: Pool[];
  type: "Limit" | "StopLoss";
  containerClassName?: string;
  isInModal?: boolean;
}> = observer(({ containerClassName, pools, isInModal, type = "Limit" }) => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    assetsStore: { nativeBalances, ibcBalances },
    priceStore,
  } = useStore();
  const { chainId } = chainStore.osmosis;
  const { isMobile } = useWindowSize();

  const allTokenBalances = nativeBalances.concat(ibcBalances);

  const account = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);

  const [isSettingOpen, setIsSettingOpen] = useBooleanWithWindowEvent(false);
  const manualSlippageInputRef = useRef<HTMLInputElement | null>(null);

  const slippageConfig = useSlippageConfig();
  const orderTokenInConfig = useOrderTokenInConfig(
    chainStore,
    chainId,
    account.bech32Address,
    queriesStore,
    pools
  );

  // show details
  const [showEstimateDetails, setShowEstimateDetails] = useState(false);
  const isEstimateDetailRelevant = !(
    orderTokenInConfig.amount === "" || orderTokenInConfig.amount === "0"
  );
  useEffect(() => {
    // auto collapse on input clear
    if (!isEstimateDetailRelevant) setShowEstimateDetails(false);
  }, [isEstimateDetailRelevant]);

  // auto focus from amount on token switch
  const fromAmountInput = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    fromAmountInput.current?.focus();
  }, [orderTokenInConfig.sendCurrency]);

  useTokenSwapQueryParams(orderTokenInConfig, allTokenBalances, isInModal);

  const showPriceImpactWarning = useMemo(
    () =>
      orderTokenInConfig.expectedSwapResult.priceImpact
        .toDec()
        .gt(new Dec(0.1)),
    [orderTokenInConfig.expectedSwapResult.priceImpact]
  );

  useEffect(() => {
    if (isSettingOpen && slippageConfig.isManualSlippage) {
      // Whenever the setting opened, give a focus to the input if the manual slippage setting mode is on.
      manualSlippageInputRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const spotPrice = useMemo(
    () =>
      orderTokenInConfig.beforeSpotPriceWithoutSwapFeeOutOverIn
        .trim(true)
        .maxDecimals(orderTokenInConfig.outCurrency.coinDecimals),
    [
      orderTokenInConfig.beforeSpotPriceWithoutSwapFeeOutOverIn,
      orderTokenInConfig.outCurrency,
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
        orderTokenInConfig.switchInAndOut();
        setSwitchOutBack(true);
      }, duration / 3);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
      if (timeout2) clearTimeout(timeout2);
    };
  }, [isAnimatingSwitch, orderTokenInConfig]);

  const inAmountValue =
    orderTokenInConfig.amount !== "" &&
    new Dec(orderTokenInConfig.amount).gt(new Dec(0))
      ? priceStore.calculatePrice(
          new CoinPretty(
            orderTokenInConfig.sendCurrency,
            new Dec(orderTokenInConfig.amount).mul(
              DecUtils.getTenExponentNInPrecisionRange(
                orderTokenInConfig.sendCurrency.coinDecimals
              )
            )
          )
        )
      : undefined;
  const outAmountValue =
    (!orderTokenInConfig.realOutputAmount.toDec().isZero() &&
      priceStore.calculatePrice(
        new CoinPretty(
          orderTokenInConfig.expectedSwapResult.amount.currency,
          orderTokenInConfig.realOutputAmount
        )
        // orderTokenInConfig.expectedSwapResult.amount
      )) ||
    undefined;

  return (
    <div
      className={classNames(
        "relative rounded-[18px] flex flex-col gap-8 bg-cardInner px-5 md:px-3 pt-12 md:pt-4 pb-7 md:pb-4",
        containerClassName
      )}
    >
      <div className="relative flex items-center justify-end w-full">
        <h6 className="w-full text-center">
          {type === "Limit" ? "Limit Order" : "Stop Loss"}
        </h6>
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
                  onInput={(value) => slippageConfig.setManualSlippage(value)}
                  onFocus={() => slippageConfig.setIsManualSlippage(true)}
                  inputRef={manualSlippageInputRef}
                  isAutosize
                />
                <span className="shrink-0">%</span>
              </li>
            </ul>

            <div className="flex items-center mt-4">
              <CheckBox
                isOn={
                  type === "Limit"
                    ? orderTokenInConfig.smallerRateEnabled
                    : orderTokenInConfig.largerRateEnabled
                }
                onToggle={() =>
                  type === "Limit"
                    ? orderTokenInConfig.toggleSmallerRateEnabled()
                    : orderTokenInConfig.toggleLargerRateEnabled()
                }
                className="after:!bg-transparent after:!border-2 after:!border-iconDefault mt-1"
              >
                <span className="caption md:text-xs text-sm ml-1">
                  Enable {type === "Limit" ? "smaller" : "larger"} rate than
                  market price.
                </span>
              </CheckBox>
            </div>
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
                  .getBalanceFromCurrency(orderTokenInConfig.sendCurrency)
                  .trim(true)
                  .hideDenom(true)
                  .maxDecimals(orderTokenInConfig.sendCurrency.coinDecimals)
                  .toString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                className={classNames(
                  "button text-primary-50 hover:bg-primary-50/30 border border-primary-50 text-xs py-1 px-1.5 rounded-md",
                  orderTokenInConfig.fraction === 1
                    ? "bg-primary-50/40"
                    : "bg-transparent"
                )}
                onClick={(e) => {
                  e.preventDefault();

                  if (orderTokenInConfig.fraction !== 1) {
                    orderTokenInConfig.setFraction(1);
                  } else {
                    orderTokenInConfig.setFraction(undefined);
                  }
                }}
              >
                MAX
              </button>
              <button
                className={classNames(
                  "button text-primary-50 hover:bg-primary-50/30 border border-primary-50 text-xs py-1 px-1.5 rounded-md",
                  orderTokenInConfig.fraction === 0.5
                    ? "bg-primary-50/40"
                    : "bg-transparent"
                )}
                onClick={(e) => {
                  e.preventDefault();

                  if (orderTokenInConfig.fraction !== 0.5) {
                    orderTokenInConfig.setFraction(0.5);
                  } else {
                    orderTokenInConfig.setFraction(undefined);
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
                    orderTokenInConfig.outCurrency.coinDenom
                )
                .filter((tokenBalance) =>
                  orderTokenInConfig.sendableCurrencies.some(
                    (sendableCurrency) =>
                      sendableCurrency.coinDenom ===
                      tokenBalance.balance.currency.coinDenom
                  )
                )
                .map((tokenBalance) => tokenBalance.balance)}
              selectedTokenDenom={orderTokenInConfig.sendCurrency.coinDenom}
              onSelect={(tokenDenom: string) => {
                const tokenInBalance = allTokenBalances.find(
                  (tokenBalance) =>
                    tokenBalance.balance.currency.coinDenom === tokenDenom
                );
                if (tokenInBalance) {
                  orderTokenInConfig.setSendCurrency(
                    tokenInBalance.balance.currency
                  );
                }
                closeTokenSelectDropdowns();
              }}
              isMobile={isMobile}
            />
            <div className="flex flex-col items-end">
              <input
                ref={fromAmountInput}
                type="number"
                className="font-h5 md:font-subtitle1 text-h5 md:text-subtitle1 text-white-full bg-transparent text-right focus:outline-none w-full placeholder:text-white-disabled"
                placeholder="0"
                onChange={(e) => {
                  e.preventDefault();
                  if (e.target.value.length < 17) {
                    orderTokenInConfig.setAmount(e.target.value);
                  }
                }}
                value={orderTokenInConfig.amount}
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
          onMouseEnter={() => setHoveringSwitchButton(true)}
          onMouseLeave={() => setHoveringSwitchButton(false)}
          onClick={(e) => {
            e.preventDefault();

            setIsAnimatingSwitch(true);
          }}
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
                  "absolute left-[10.5px] md:left-2 top-[11px] md:top-2 transition-all duration-500 ease-bounce",
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
            "bg-surface rounded-xl md:rounded-xl px-4 md:px-3 py-[22px] md:py-2.5 transition-all ease-outBack",
            {
              "opacity-30": isAnimatingSwitch,
            }
          )}
        >
          <div className="flex justify-between items-center">
            <span className="subtitle1 md:subtitle2 text-white-full">Rate</span>
          </div>
          {orderTokenInConfig && (
            <div className="flex items-center">
              <button
                className="button h-[1.375rem] border-2 border-primary-200 rounded-lg bg-primary-200/30 select-none hover:bg-primary-200/60"
                onClick={() => orderTokenInConfig.setCurrentPrice()}
              >
                <span className="mx-2 text-caption">Current</span>
              </button>
              <input
                type="number"
                className="font-h5 md:font-subtitle1 text-h5 md:text-subtitle1 text-white-full bg-transparent text-right focus:outline-none w-full"
                placeholder="0"
                onChange={(e) => {
                  e.preventDefault();
                  if (Number(e.target.value) <= Number.MAX_SAFE_INTEGER) {
                    orderTokenInConfig.setPrice(e.target.value);
                  }
                }}
                value={orderTokenInConfig.price}
              />
            </div>
          )}
        </div>

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
            className="flex items-center place-content-between transition-all"
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
                    orderTokenInConfig.sendCurrency.coinDenom
                )
                .filter((tokenBalance) =>
                  orderTokenInConfig.sendableCurrencies.some(
                    (sendableCurrency) =>
                      sendableCurrency.coinDenom ===
                      tokenBalance.balance.currency.coinDenom
                  )
                )
                .map((tokenBalance) => tokenBalance.balance)}
              selectedTokenDenom={orderTokenInConfig.outCurrency.coinDenom}
              onSelect={(tokenDenom: string) => {
                const tokenOutBalance = allTokenBalances.find(
                  (tokenBalance) =>
                    tokenBalance.balance.currency.coinDenom === tokenDenom
                );
                if (tokenOutBalance) {
                  orderTokenInConfig.setOutCurrency(
                    tokenOutBalance.balance.currency
                  );
                }
                closeTokenSelectDropdowns();
              }}
              isMobile={isMobile}
            />
            <div className="flex flex-col items-end">
              <h5
                className={classNames(
                  "text-right md:subtitle1",
                  orderTokenInConfig.expectedSwapResult.amount
                    .toDec()
                    .isPositive()
                    ? "text-white-full"
                    : "text-white-disabled"
                )}
              >{`≈ ${
                orderTokenInConfig.expectedSwapResult.amount.denom !== "UNKNOWN"
                  ? orderTokenInConfig.realOutputAmount
                      .trim(true)
                      .shrink(true)
                      .maxDecimals(
                        Math.min(
                          orderTokenInConfig.expectedSwapResult.amount.currency
                            .coinDecimals,
                          8
                        )
                      )
                      .toString()
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
            showEstimateDetails ? "h-32 py-6" : "h-11 py-[10px]"
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
                orderTokenInConfig.sendCurrency.coinDenom !== "UNKNOWN"
                  ? orderTokenInConfig.sendCurrency.coinDenom
                  : ""
              } ≈ ${
                spotPrice.toDec().lt(new Dec(1))
                  ? spotPrice.toString()
                  : spotPrice.maxDecimals(6).toString()
              } ${
                orderTokenInConfig.outCurrency.coinDenom !== "UNKNOWN"
                  ? orderTokenInConfig.outCurrency.coinDenom
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
                {`-${orderTokenInConfig.expectedSwapResult.priceImpact.toString()}`}
              </div>
            </div>
            <div className="flex justify-between">
              <div className="caption">Compare to Market Price</div>
              <div
                className={classNames(
                  "caption",
                  type === "Limit" &&
                    orderTokenInConfig.priceChangePercentage >= 0
                    ? "text-success"
                    : "text-error"
                )}
              >
                {Math.abs(orderTokenInConfig.priceChangePercentage).toFixed(2)}%{" "}
                {orderTokenInConfig.priceChangePercentage >= 0
                  ? "above "
                  : "below "}
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
          (orderTokenInConfig.error !== undefined ||
            orderTokenInConfig.optimizedRoutePaths.length === 0 ||
            account.txTypeInProgress !== "" ||
            (type === "Limit" &&
              orderTokenInConfig.priceChangePercentage < 0 &&
              !orderTokenInConfig.smallerRateEnabled) ||
            (type === "StopLoss" &&
              orderTokenInConfig.priceChangePercentage >= 0 &&
              !orderTokenInConfig.largerRateEnabled))
        }
        loading={account.txTypeInProgress !== ""}
        onClick={async () => {
          if (account.walletStatus !== WalletStatus.Loaded) {
            return account.init();
          }

          if (orderTokenInConfig.optimizedRoutePaths.length > 0) {
            const routes: {
              poolId: number;
              tokenOutCurrency: Currency;
            }[] = [];

            for (
              let i = 0;
              i < orderTokenInConfig.optimizedRoutePaths[0].pools.length;
              i++
            ) {
              const pool = orderTokenInConfig.optimizedRoutePaths[0].pools[i];
              const tokenOutCurrency =
                chainStore.osmosisObservable.currencies.find(
                  (cur) =>
                    cur.coinMinimalDenom ===
                    orderTokenInConfig.optimizedRoutePaths[0].tokenOutDenoms[i]
                );

              if (!tokenOutCurrency) {
                orderTokenInConfig.setError(
                  new Error(
                    `Failed to find currency ${orderTokenInConfig.optimizedRoutePaths[0].tokenOutDenoms[i]}`
                  )
                );
                return;
              }

              routes.push({
                poolId: Number(pool.id),
                tokenOutCurrency,
              });
            }

            const tokenInCurrency =
              chainStore.osmosisObservable.currencies.find(
                (cur) =>
                  cur.coinMinimalDenom ===
                  orderTokenInConfig.optimizedRoutePaths[0].tokenInDenom
              );

            if (!tokenInCurrency) {
              orderTokenInConfig.setError(
                new Error(
                  `Failed to find currency ${orderTokenInConfig.optimizedRoutePaths[0].tokenInDenom}`
                )
              );
              return;
            }

            const tokenInUAmount = new Dec(orderTokenInConfig.amount)
              .mul(
                DecUtils.getTenExponentNInPrecisionRange(
                  tokenInCurrency.coinDecimals
                )
              )
              .truncate();

            const { tokenOutCurrency } = routes[routes.length - 1];
            const tokenOutUAmount = orderTokenInConfig.realOutputAmount
              .toDec()
              .mul(
                DecUtils.getTenExponentNInPrecisionRange(
                  tokenOutCurrency.coinDecimals
                )
              )
              .truncate();

            try {
              const first = routes.shift();
              const swap = {
                user: account.bech32Address,
                amount: tokenInUAmount.toString(),
                min_output: type === "Limit" ? tokenOutUAmount.toString() : "0",
                max_output:
                  type === "Limit"
                    ? "18446744073709551615"
                    : tokenOutUAmount.toString(),
                first: {
                  pool_id: first!.poolId,
                  denom_in: tokenInCurrency.coinMinimalDenom,
                  denom_out: first!.tokenOutCurrency.coinMinimalDenom,
                },
                route: [],
              } as any;
              swap.route = routes.map((route) => ({
                pool_id: route.poolId,
                denom_out: route.tokenOutCurrency.coinMinimalDenom,
              }));
              const msg = Buffer.from(JSON.stringify({ swap })).toString(
                "base64"
              );

              const isNative =
                tokenInCurrency.coinMinimalDenom.startsWith("u") ||
                tokenInCurrency.coinMinimalDenom.startsWith("ibc/");

              if (!isNative) {
                await account.cosmwasm.sendExecuteContractMsg(
                  "executeWasm",
                  tokenInCurrency.coinMinimalDenom,
                  {
                    increase_allowance: {
                      spender: REGISTRY_ADDRESSES[chainId],
                      amount: tokenInUAmount.toString(),
                      expires: undefined,
                    },
                  },
                  [],
                  "",
                  { gas: "350000" }
                );
              }

              const input_asset = isNative
                ? {
                    info: {
                      native_token: {
                        denom: tokenInCurrency.coinMinimalDenom,
                      },
                    },
                    amount: tokenInUAmount.toString(),
                  }
                : {
                    info: {
                      token: {
                        contract_addr: tokenInCurrency.coinMinimalDenom,
                      },
                    },
                    amount: tokenInUAmount.toString(),
                  };

              const funds = [];
              if (tokenInCurrency.coinMinimalDenom !== "uosmo") {
                funds.push({
                  denom: tokenInCurrency.coinMinimalDenom,
                  amount: tokenInUAmount.toString(),
                });
                funds.push({ denom: "uosmo", amount: "1000" }); // fee amount in usomo
              } else {
                funds.push({
                  denom: "uosmo",
                  amount: new Dec(orderTokenInConfig.amount)
                    .add(new Dec("0.001"))
                    .mul(
                      DecUtils.getTenExponentNInPrecisionRange(
                        tokenInCurrency.coinDecimals
                      )
                    )
                    .truncate()
                    .toString(),
                });
              }

              await account.cosmwasm.sendExecuteContractMsg(
                "executeWasm",
                REGISTRY_ADDRESSES[chainId],
                {
                  create_request: {
                    target: WRAPPER_ADDRESSES[chainId],
                    msg,
                    input_asset,
                  },
                },
                funds,
                "",
                { gas: "350000" },
                undefined,
                (e) => console.log(e)
              );
              orderTokenInConfig.setAmount("");
              orderTokenInConfig.setFraction(undefined);
            } catch (e) {
              console.error(e);
            }
          }
        }}
      >
        {account.walletStatus === WalletStatus.Loaded ? (
          orderTokenInConfig.error ? (
            orderTokenInConfig.error.message
          ) : showPriceImpactWarning ? (
            "Place Order Anyway"
          ) : (
            "Place Order"
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
