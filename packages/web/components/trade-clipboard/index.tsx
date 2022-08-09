import { FunctionComponent, useEffect, useRef, useState, useMemo } from "react";
import { WalletStatus } from "@keplr-wallet/stores";
import { Currency } from "@keplr-wallet/types";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { Pool } from "@osmosis-labs/pools";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { IS_FRONTIER } from "../../config";
import {
  useBooleanWithWindowEvent,
  useFakeFeeConfig,
  useSlippageConfig,
  useTokenSwapQueryParams,
  useTradeTokenInConfig,
  useWindowSize,
} from "../../hooks";
import { useStore } from "../../stores";
import { Error as ErrorBox } from "../alert";
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
  useEffect(() => {
    // auto collapse on input clear
    if (tradeTokenInConfig.amount === "") setShowEstimateDetails(false);
  }, [tradeTokenInConfig.amount]);

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

  const minAmountLessSlippage = useMemo(
    () =>
      new CoinPretty(
        tradeTokenInConfig.outCurrency,
        tradeTokenInConfig.expectedSwapResult.amount
          .toDec()
          .mul(new Dec(1).sub(slippageConfig.slippage.toDec()))
      ).moveDecimalPointRight(tradeTokenInConfig.outCurrency.coinDecimals),
    [
      tradeTokenInConfig.outCurrency,
      tradeTokenInConfig.expectedSwapResult.amount,
      slippageConfig.slippage,
    ]
  );

  return (
    <div
      className={classNames(
        "relative rounded-[18px] bg-cardInner px-5 md:px-3 pt-5 md:pt-4 pb-6 md:pb-4",
        containerClassName
      )}
    >
      <div className="relative flex items-center justify-end w-full h-11 md:h-[38px] mb-[1.125rem] md:mb-2">
        <h6 className="w-full text-center">Swap</h6>
        <button
          className="absolute right-3 top-1 h-11 md:h-[38px]"
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
          </div>
        )}
      </div>

      <div className="relative">
        <div className="bg-surface rounded-xl md:rounded-xl px-4 md:px-3 pt-3 md:pt-2.5 pb-4 md:pb-2.5 relative">
          <div className="flex items-center place-content-between">
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
                  tradeTokenInConfig && tradeTokenInConfig.fraction === 1
                    ? "bg-primary-50/40"
                    : "bg-transparent"
                )}
                onClick={(e) => {
                  e.preventDefault();

                  if (!tradeTokenInConfig) {
                    return;
                  }

                  if (tradeTokenInConfig.fraction !== 1) {
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
                  tradeTokenInConfig && tradeTokenInConfig.fraction === 0.5
                    ? "bg-primary-50/40"
                    : "bg-transparent"
                )}
                onClick={(e) => {
                  e.preventDefault();

                  if (!tradeTokenInConfig) {
                    return;
                  }

                  if (tradeTokenInConfig.fraction !== 0.5) {
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
          <div className="flex items-center mt-3">
            {tradeTokenInConfig && (
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
            )}
            <div className="flex-1" />
            {tradeTokenInConfig && (
              <div className="flex flex-col items-end">
                <input
                  ref={fromAmountInput}
                  type="number"
                  className="font-h5 md:font-subtitle1 text-h5 md:text-subtitle1 text-white-full bg-transparent text-right focus:outline-none w-full"
                  placeholder="0"
                  onChange={(e) => {
                    e.preventDefault();
                    if (Number(e.target.value) <= Number.MAX_SAFE_INTEGER) {
                      tradeTokenInConfig.setAmount(e.target.value);
                    }
                  }}
                  value={tradeTokenInConfig.amount}
                />
                <div className="subtitle2 md:font-caption md:text-caption text-white-disabled">{`≈ ${
                  tradeTokenInConfig.amount &&
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
                    : "0"
                }`}</div>
              </div>
            )}
          </div>
        </div>

        <button
          className="absolute flex items-center inset-1/2 -translate-x-1/3 -translate-y-1/4 w-12 md:w-9 h-12 md:h-9 z-30"
          onClick={(e) => {
            e.preventDefault();

            tradeTokenInConfig && tradeTokenInConfig.switchInAndOut();
          }}
        >
          <div className="w-full h-full rounded-full flex items-center bg-card shadow-elevation-04dp">
            <div className="m-auto mt-3.5">
              <Image
                width={isMobile ? 12 : 20}
                height={isMobile ? 12 : 20}
                src={
                  IS_FRONTIER
                    ? "/icons/down-arrow.svg"
                    : "/icons/down-arrow.svg"
                }
                alt="hexagon border icon"
              />
            </div>
          </div>
        </button>

        <div className="bg-surface rounded-xl md:rounded-xl p-4 md:p-3 mt-[1.125rem] md:mt-3 relative">
          <div className="flex items-center place-content-between mt-3">
            {tradeTokenInConfig && (
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
            )}
            {tradeTokenInConfig && (
              <div className="flex flex-col items-end">
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
                    ? tradeTokenInConfig.expectedSwapResult.amount
                        .trim(true)
                        .shrink(true)
                        .maxDecimals(
                          Math.min(
                            tradeTokenInConfig.expectedSwapResult.amount
                              .currency.coinDecimals,
                            8
                          )
                        )
                        .hideDenom(true)
                        .toString()
                    : "0"
                }`}</h5>
                <div className="subtitle2 md:font-caption md:text-caption text-white-disabled">
                  {`≈ ${
                    priceStore.calculatePrice(
                      tradeTokenInConfig.expectedSwapResult.amount
                    ) || "0"
                  }`}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {tradeTokenInConfig && (
        <div className="mt-[1.125rem] rounded-lg bg-card py-3 px-4 md:px-3">
          <button
            className={classNames(
              "w-full flex items-center place-content-between",
              {
                "cursor-pointer":
                  tradeTokenInConfig.amount !== "" &&
                  tradeTokenInConfig.amount !== "0",
              }
            )}
            onClick={() => {
              if (
                tradeTokenInConfig.amount !== "" &&
                tradeTokenInConfig.amount !== "0"
              )
                setShowEstimateDetails(!showEstimateDetails);
            }}
          >
            <div className="subtitle2">
              {`1 ${
                tradeTokenInConfig.sendCurrency.coinDenom !== "UNKNOWN"
                  ? tradeTokenInConfig.sendCurrency.coinDenom
                  : ""
              } ≈ ${tradeTokenInConfig.expectedSwapResult.beforeSpotPriceWithoutSwapFeeOutOverIn
                .trim(true)
                .maxDecimals(3)
                .toString()} ${
                tradeTokenInConfig.outCurrency.coinDenom !== "UNKNOWN"
                  ? tradeTokenInConfig.outCurrency.coinDenom
                  : ""
              }`}
            </div>
            <Image
              className={`group-hover:opacity-100 transition-transform ${
                showEstimateDetails ? "rotate-180" : "rotate-0"
              } ${
                tradeTokenInConfig.amount === "" ||
                tradeTokenInConfig.amount === "0"
                  ? "opacity-20"
                  : "opacity-40"
              }`}
              alt="show estimates"
              src="/icons/chevron-down.svg"
              height={isMobile ? 14 : 18}
              width={isMobile ? 14 : 18}
            />
          </button>
          <div
            className={classNames("flex justify-between mt-2.5", {
              hidden: !showEstimateDetails,
            })}
          >
            <div className="caption">Expected Output</div>
            <div className="caption text-wireframes-lightGrey">
              {`≈ ${tradeTokenInConfig.expectedSwapResult.amount.toString()} `}
            </div>
          </div>
          <div
            className={classNames("flex justify-between mt-2.5", {
              hidden: !showEstimateDetails,
            })}
          >
            <div className="caption">Price Impact</div>
            <div className="caption text-wireframes-lightGrey">
              {`-${tradeTokenInConfig.expectedSwapResult.priceImpact.toString()}`}
            </div>
          </div>
          <div
            className={classNames(
              "flex justify-between pt-4 mt-4 border-t border-white-faint",
              { hidden: !showEstimateDetails }
            )}
          >
            <div className="caption text-white-high md:text-wireframes-lightGrey">
              Minimum recieved after slippage{" "}
              {`(${slippageConfig.slippage.trim(true).toString()})`}
            </div>
            <div
              className={classNames(
                "caption flex flex-col text-right gap-0.5 text-wireframes-lightGrey",
                {
                  "text-white-high": !showPriceImpactWarning,
                  "text-error": showPriceImpactWarning,
                }
              )}
            >
              <span>
                {(minAmountLessSlippage.toDec().lt(new Dec(1))
                  ? minAmountLessSlippage
                  : minAmountLessSlippage.maxDecimals(2).trim(true)
                )
                  .hideDenom(true)
                  .toString()}
              </span>
              <span>
                {`≈ ${priceStore.calculatePrice(minAmountLessSlippage) || "0"}`}
              </span>
            </div>
          </div>
          <div
            className={classNames("flex justify-between mt-2.5", {
              hidden: !showEstimateDetails,
            })}
          >
            <div className="caption">Swap Fee</div>
            <div className="caption text-wireframes-lightGrey">
              {`≈ ${
                priceStore.calculatePrice(
                  tradeTokenInConfig.expectedSwapResult.tokenInFeeAmount
                ) ?? "0"
              } `}
            </div>
          </div>
        </div>
      )}
      {tradeTokenInConfig &&
        tradeTokenInConfig.error &&
        account.walletStatus === WalletStatus.Loaded && (
          <ErrorBox
            className="!w-full flex !justify-center items-center mt-4"
            iconSize={isMobile ? "sm" : "md"}
            message={tradeTokenInConfig.error?.message ?? ""}
          />
        )}
      {tradeTokenInConfig && (
        <Button
          color={
            showPriceImpactWarning &&
            account.walletStatus === WalletStatus.Loaded
              ? "error"
              : "primary"
          }
          className="mt-[1.125rem] flex justify-center items-center w-full h-[3.75rem] rounded-lg text-h6 md:text-button font-h6 md:font-button text-white-full shadow-elevation-04dp"
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
                      tradeTokenInConfig.optimizedRoutePaths[0].tokenOutDenoms[
                        i
                      ]
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
                          denom:
                            chainStore.osmosis.stakeCurrency.coinMinimalDenom,
                          amount: "0",
                        },
                      ],
                    },
                    {
                      preferNoSetFee: preferZeroFee,
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
            showPriceImpactWarning ? (
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
      )}
    </div>
  );
});
