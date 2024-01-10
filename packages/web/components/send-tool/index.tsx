import { WalletStatus } from "@cosmos-kit/core";
import { Dec, IntPretty } from "@keplr-wallet/unit";
import { NoRouteError, NotEnoughLiquidityError } from "@osmosis-labs/pools";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  Fragment,
  FunctionComponent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useMeasure } from "react-use";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import IconButton from "~/components/buttons/icon-button";
import { TokenSelectWithDrawer } from "~/components/control/token-select-with-drawer";
import { InputBox } from "~/components/input";
import { tError } from "~/components/localization";
import { Popover } from "~/components/popover";
import SkeletonLoader from "~/components/skeleton-loader";
import { InfoTooltip } from "~/components/tooltip";
import { EventName, SwapPage } from "~/config";
import { useTranslation } from "~/hooks";
import {
  useAmplitudeAnalytics,
  useDisclosure,
  useSlippageConfig,
  useWalletSelect,
  useWindowSize,
} from "~/hooks";
import { useStore } from "~/stores";
import { formatCoinMaxDecimalsByOne, formatPretty } from "~/utils/formatter";

export interface SwapToolProps {
  /** IMPORTANT: Pools should be memoized!! */
  tokenDenoms?: [string, string];
  isInModal?: boolean;
  onRequestModalClose?: () => void;
  swapButton?: React.ReactElement;
  sendTokenDenom?: string;
  outTokenDenom?: string;
  page?: SwapPage;
  forceSwapInPoolId?: string;
}

export const SwapTool: FunctionComponent<SwapToolProps> = observer(
  ({
    isInModal,
    onRequestModalClose,
    swapButton,
    sendTokenDenom,
    outTokenDenom,
    page = "Swap Page",
    forceSwapInPoolId,
  }) => {
    const { chainStore, accountStore } = useStore();
    const { t } = useTranslation();
    const { chainId } = chainStore.osmosis;
    const { isMobile } = useWindowSize();
    const { logEvent } = useAmplitudeAnalytics();
    const { isLoading: isWalletLoading, onOpenWalletSelect } =
      useWalletSelect();

    const account = accountStore.getWallet(chainId);

    const swapState = useSwap({
      initialFromDenom: sendTokenDenom,
      initialToDenom: outTokenDenom,
      useOtherCurrencies: !isInModal,
      useQueryParams: !isInModal,
      forceSwapInPoolId,
    });

    const manualSlippageInputRef = useRef<HTMLInputElement | null>(null);
    const [
      estimateDetailsContentRef,
      { height: estimateDetailsContentHeight, y: estimateDetailsContentOffset },
    ] = useMeasure<HTMLDivElement>();

    const slippageConfig = useSlippageConfig();

    // out amount less slippage calculated from slippage config
    const outAmountLessSlippage = useMemo(
      () =>
        swapState.quote && swapState.toAsset
          ? new IntPretty(
              swapState.quote.amount
                .toDec()
                .mul(new Dec(1).sub(slippageConfig.slippage.toDec()))
            )
          : undefined,
      [swapState.quote, swapState.toAsset, slippageConfig.slippage]
    );

    const routesVisDisclosure = useDisclosure();

    const [showQuoteDetails, setShowEstimateDetails] = useState(false);

    /** User has input and there is enough liquidity and routes for given input. */
    const isQuoteDetailRelevant =
      swapState.inAmountInput.amount &&
      !swapState.inAmountInput.amount.toDec().isZero() &&
      !(swapState.error instanceof NotEnoughLiquidityError) &&
      !(swapState.error instanceof NoRouteError);
    // auto collapse on input clear
    useEffect(() => {
      if (!isQuoteDetailRelevant && !swapState.isQuoteLoading)
        setShowEstimateDetails(false);
    }, [isQuoteDetailRelevant, swapState.isQuoteLoading]);

    // auto focus from amount on token switch
    const fromAmountInputEl = useRef<HTMLInputElement | null>(null);

    const showPriceImpactWarning =
      swapState.quote?.priceImpactTokenOut?.toDec().abs().gt(new Dec(0.1)) ??
      false;

    // token select dropdown
    const [showFromTokenSelectDropdown, setFromTokenSelectDropdownLocal] =
      useState(false);
    const [showToTokenSelectDropdown, setToTokenSelectDropdownLocal] =
      useState(false);
    const setOneTokenSelectOpen = useCallback((dropdown: "to" | "from") => {
      if (dropdown === "to") {
        setToTokenSelectDropdownLocal(true);
        setFromTokenSelectDropdownLocal(false);
      } else {
        setFromTokenSelectDropdownLocal(true);
        setToTokenSelectDropdownLocal(false);
      }
    }, []);
    const closeTokenSelectDropdowns = useCallback(() => {
      setFromTokenSelectDropdownLocal(false);
      setToTokenSelectDropdownLocal(false);
    }, []);

    // to & from box switch animation
    const [isHoveringSwitchButton, setHoveringSwitchButton] = useState(false);

    // user action
    const sendSwapTx = () => {
      // prompt to select wallet insteaad of swapping
      if (account?.walletStatus !== WalletStatus.Connected) {
        return onOpenWalletSelect(chainId);
      }

      if (!swapState.inAmountInput.amount) return;

      const baseEvent = {
        fromToken: swapState.fromAsset?.coinDenom,
        tokenAmount: Number(swapState.inAmountInput.amount),
        toToken: swapState.toAsset?.coinDenom,
        isOnHome: !isInModal,
        isMultiHop: swapState.quote?.split.some(
          ({ pools }) => pools.length !== 1
        ),
        isMultiRoute: (swapState.quote?.split.length ?? 0) > 1,
      };
      logEvent([
        EventName.Swap.swapStarted,
        {
          ...baseEvent,
          quoteTimeMilliseconds: swapState.quote?.timeMs,
          router: swapState.quote?.name,
          page,
        },
      ]);
      swapState
        .sendTradeTokenInTx(slippageConfig.slippage.toDec())
        .then((result) => {
          // onFullfill
          logEvent([
            EventName.Swap.swapCompleted,
            {
              ...baseEvent,
              isMultiHop: result === "multihop",
              quoteTimeMilliseconds: swapState.quote?.timeMs,
              router: swapState.quote?.name,
              page,
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

    const isSwapToolLoading = isWalletLoading || swapState.isQuoteLoading;

    const buttonText = swapState.error
      ? t(...tError(swapState.error))
      : showPriceImpactWarning
      ? t("swap.buttonError")
      : t("swap.button");

    return (
      <>
        <div className="relative flex flex-col gap-6 overflow-hidden rounded-3xl bg-osmoverse-850 px-6 py-9 md:gap-6 md:px-3 md:pt-4 md:pb-4">
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
                                  percentage:
                                    slippageConfig.slippage.toString(),
                                  page,
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
                                fromToken: swapState.fromAsset?.coinDenom,
                                toToken: swapState.toAsset?.coinDenom,
                                isOnHome: !isInModal,
                                percentage: slippageConfig.slippage.toString(),
                                page,
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
            <div className="rounded-xl bg-osmoverse-900 px-4 py-[22px] transition-all md:rounded-xl md:px-3 md:py-2.5">
              <div className="flex place-content-between items-center transition-opacity">
                <div className="flex">
                  <span className="caption text-xs text-white-full">
                    {t("swap.available")}
                  </span>
                  <span className="caption ml-1.5 text-xs text-wosmongton-300">
                    {formatCoinMaxDecimalsByOne(
                      swapState.inAmountInput?.balance,
                      2,
                      Math.min(swapState.fromAsset?.coinDecimals ?? 0, 8)
                    ) || "0 " + (swapState.fromAsset?.coinDenom ?? "")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    mode="amount"
                    className={classNames(
                      "py-1 px-1.5 text-xs",
                      swapState.inAmountInput.fraction === 0.5
                        ? "bg-wosmongton-100/20"
                        : "bg-transparent"
                    )}
                    disabled={
                      !swapState.inAmountInput.balance ||
                      swapState.inAmountInput.balance.toDec().isZero()
                    }
                    onClick={() => swapState.inAmountInput.toggleHalf()}
                  >
                    {t("swap.HALF")}
                  </Button>
                  <Button
                    mode="amount"
                    className={classNames(
                      "py-1 px-1.5 text-xs",
                      swapState.inAmountInput.fraction === 1
                        ? "bg-wosmongton-100/20"
                        : "bg-transparent"
                    )}
                    disabled={
                      !swapState.inAmountInput.balance ||
                      swapState.inAmountInput.balance.toDec().isZero()
                    }
                    onClick={() => swapState.inAmountInput.toggleMax()}
                  >
                    {t("swap.MAX")}
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex place-content-between items-center">
                <SkeletonLoader
                  className={
                    swapState.isLoadingFromAsset
                      ? "h-full w-full"
                      : "h-fit w-fit"
                  }
                  isLoaded={!swapState.isLoadingFromAsset}
                >
                  <TokenSelectWithDrawer
                    isFromSelect
                    dropdownOpen={showFromTokenSelectDropdown}
                    swapState={swapState}
                    setDropdownState={useCallback(
                      (isOpen) => {
                        if (isOpen) {
                          setOneTokenSelectOpen("from");
                        } else {
                          closeTokenSelectDropdowns();
                        }
                      },
                      [setOneTokenSelectOpen, closeTokenSelectDropdowns]
                    )}
                    onSelect={useCallback(
                      (tokenDenom: string) => {
                        swapState.setFromAssetDenom(tokenDenom);
                        closeTokenSelectDropdowns();
                        fromAmountInputEl.current?.focus();
                      },
                      [swapState, closeTokenSelectDropdowns]
                    )}
                  />
                </SkeletonLoader>
                <div className="flex w-full flex-col items-end">
                  <input
                    ref={fromAmountInputEl}
                    type="number"
                    className={classNames(
                      "w-full bg-transparent text-right text-white-full placeholder:text-white-disabled focus:outline-none md:text-subtitle1",
                      "text-h5 font-h5 md:font-subtitle1"
                    )}
                    placeholder="0"
                    onChange={(e) => {
                      e.preventDefault();
                      if (e.target.value.length <= (isMobile ? 19 : 26)) {
                        swapState.inAmountInput.setAmount(e.target.value);
                      }
                    }}
                    value={swapState.inAmountInput.inputAmount}
                  />
                  <span
                    className={classNames(
                      "subtitle1 md:caption whitespace-nowrap text-osmoverse-300 transition-opacity",
                      !swapState.inAmountInput.fiatValue ||
                        swapState.inAmountInput.fiatValue.toDec().isZero()
                        ? "opacity-0"
                        : "opacity-100"
                    )}
                  >{`≈ ${
                    swapState.inAmountInput.fiatValue &&
                    swapState.inAmountInput.fiatValue.toString().length > 15
                      ? formatPretty(swapState.inAmountInput.fiatValue)
                      : swapState.inAmountInput.fiatValue?.toString() ?? "0"
                  }`}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-osmoverse-900 px-4 py-[22px] transition-all md:rounded-xl md:px-3 md:py-2.5">
              <div className="flex place-content-between items-center transition-transform">
                <SkeletonLoader
                  className={
                    swapState.isLoadingToAsset ? "h-full w-full" : "h-fit w-fit"
                  }
                  isLoaded={!swapState.isLoadingToAsset}
                >
                  <TokenSelectWithDrawer
                    isFromSelect={false}
                    dropdownOpen={showToTokenSelectDropdown}
                    swapState={swapState}
                    onSelect={useCallback(
                      (tokenDenom: string) => {
                        swapState.setToAssetDenom(tokenDenom);
                        closeTokenSelectDropdowns();
                      },
                      [swapState, closeTokenSelectDropdowns]
                    )}
                    setDropdownState={useCallback(
                      (isOpen) => {
                        if (isOpen) {
                          setOneTokenSelectOpen("to");
                        } else {
                          closeTokenSelectDropdowns();
                        }
                      },
                      [setOneTokenSelectOpen, closeTokenSelectDropdowns]
                    )}
                  />
                </SkeletonLoader>
                <div className="flex w-full flex-col items-end">
                  <h5
                    className={classNames(
                      "md:subtitle1 whitespace-nowrap text-right transition-opacity",
                      swapState.quote?.amount.toDec().isPositive() &&
                        !swapState.inAmountInput.isTyping &&
                        !swapState.isQuoteLoading
                        ? "text-white-full"
                        : "text-white-disabled",
                      {
                        "opacity-50":
                          isSwapToolLoading ||
                          !swapState.quote ||
                          swapState.inAmountInput.isEmpty,
                      }
                    )}
                  >
                    {`≈ ${formatPretty(
                      swapState.quote?.amount
                        ? swapState.quote.amount.toDec()
                        : new Dec(0),
                      {
                        maxDecimals: 8,
                      }
                    )}`}
                  </h5>
                  <span
                    className={classNames(
                      "subtitle1 md:caption text-osmoverse-300 opacity-100 transition-opacity",
                      {
                        "opacity-0":
                          !swapState.quote?.amountFiatValue ||
                          swapState.quote.amountFiatValue.toDec().isZero() ||
                          swapState.inAmountInput.isEmpty,
                        "opacity-50":
                          (!swapState.quote?.amountFiatValue
                            ?.toDec()
                            .isZero() &&
                            isSwapToolLoading) ||
                          swapState.inAmountInput.isTyping,
                      }
                    )}
                  >
                    {`≈ ${
                      swapState.quote?.amountFiatValue &&
                      swapState.quote.amountFiatValue.toString().length > 15
                        ? formatPretty(swapState.quote.amountFiatValue)
                        : swapState.quote?.amountFiatValue?.toString() ?? "0"
                    }`}
                  </span>
                </div>
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
                isWalletLoading ||
                swapState.isQuoteLoading ||
                (account?.walletStatus === WalletStatus.Connected &&
                  (swapState.inAmountInput.isEmpty ||
                    Boolean(swapState.error) ||
                    account?.txTypeInProgress !== ""))
              }
              onClick={sendSwapTx}
            >
              {account?.walletStatus === WalletStatus.Connected ||
              isSwapToolLoading ? (
                buttonText
              ) : (
                <h6 className="flex items-center gap-3">
                  <Icon id="wallet" className="h-6 w-6" />
                  {t("connectWallet")}
                </h6>
              )}
            </Button>
          )}
        </div>
      </>
    );
  }
);
