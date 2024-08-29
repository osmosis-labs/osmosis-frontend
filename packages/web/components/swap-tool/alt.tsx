import { WalletStatus } from "@cosmos-kit/core";
import { Dec, DecUtils, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { isNil } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { parseAsBoolean, useQueryState } from "nuqs";
import {
  FunctionComponent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useMeasure, useMount } from "react-use";

import { Icon } from "~/components/assets";
import {
  AssetFieldset,
  AssetFieldsetFooter,
  AssetFieldsetHeader,
  AssetFieldsetHeaderBalance,
  AssetFieldsetHeaderLabel,
  AssetFieldsetInput,
  AssetFieldsetTokenSelector,
} from "~/components/complex/asset-fieldset";
import { tError } from "~/components/localization";
import { TradeDetails } from "~/components/swap-tool/trade-details";
import { GenericDisclaimer } from "~/components/tooltip/generic-disclaimer";
import { Button } from "~/components/ui/button";
import { EventName, EventPage } from "~/config";
import {
  useAmplitudeAnalytics,
  useDisclosure,
  useFeatureFlags,
  useOneClickTradingSession,
  useSlippageConfig,
  useTranslation,
  useWalletSelect,
  useWindowSize,
} from "~/hooks";
import {
  QuoteType,
  useAmountWithSlippage,
  useDynamicSlippageConfig,
  useSwap,
} from "~/hooks/use-swap";
import { useGlobalIs1CTIntroModalScreen } from "~/modals";
import { AddFundsModal } from "~/modals/add-funds";
import { ReviewOrder } from "~/modals/review-order";
import { TokenSelectModalLimit } from "~/modals/token-select-modal-limit";
import { useStore } from "~/stores";
import { formatPretty, getPriceExtendedFormatOptions } from "~/utils/formatter";
import { trimPlaceholderZeros } from "~/utils/number";

export interface SwapToolProps {
  fixedWidth?: boolean;
  useOtherCurrencies: boolean | undefined;
  useQueryParams: boolean | undefined;
  onRequestModalClose?: () => void;
  swapButton?: React.ReactElement;
  initialSendTokenDenom?: string;
  initialOutTokenDenom?: string;
  page: EventPage;
  forceSwapInPoolId?: string;
  onSwapSuccess?: (params: {
    sendTokenDenom: string;
    outTokenDenom: string;
  }) => void;
}

export const AltSwapTool: FunctionComponent<SwapToolProps> = observer(
  ({
    useOtherCurrencies,
    useQueryParams,
    onRequestModalClose,
    swapButton,
    initialSendTokenDenom,
    initialOutTokenDenom,
    page,
    forceSwapInPoolId,
    onSwapSuccess,
  }) => {
    const { chainStore, accountStore } = useStore();
    const { t } = useTranslation();
    const { chainId } = chainStore.osmosis;
    const { isMobile } = useWindowSize();
    const { logEvent } = useAmplitudeAnalytics();
    const { isLoading: isWalletLoading, onOpenWalletSelect } =
      useWalletSelect();
    const featureFlags = useFeatureFlags();
    const [, setIs1CTIntroModalScreen] = useGlobalIs1CTIntroModalScreen();
    const { isOneClickTradingEnabled } = useOneClickTradingSession();
    const [isSendingTx, setIsSendingTx] = useState(false);
    const [quoteType, setQuoteType] = useState<QuoteType>("out-given-in");
    // auto focus from amount on token switch
    const fromAmountInputEl = useRef<HTMLInputElement | null>(null);
    const toAmountInputEl = useRef<HTMLInputElement | null>(null);

    const [_, setType] = useQueryState("type");

    useMount(() => {
      setType(null);
    });

    useEffect(() => {
      if (!featureFlags.inGivenOut && quoteType === "in-given-out") {
        setQuoteType("out-given-in");
        fromAmountInputEl.current?.focus();
      }
    }, [featureFlags.inGivenOut, quoteType]);

    const account = accountStore.getWallet(chainId);
    const slippageConfig = useSlippageConfig({
      defaultSlippage: quoteType === "in-given-out" ? "0.5" : "0.5",
      selectedIndex: quoteType === "in-given-out" ? 0 : 0,
    });

    const swapState = useSwap({
      initialFromDenom: initialSendTokenDenom,
      initialToDenom: initialOutTokenDenom,
      useOtherCurrencies,
      useQueryParams,
      forceSwapInPoolId,
      maxSlippage: slippageConfig.slippage.toDec(),
      quoteType,
    });

    useDynamicSlippageConfig({
      slippageConfig,
      feeError: swapState.networkFeeError,
      quoteType,
    });

    if (swapState.fromAsset?.coinDenom === swapState.toAsset?.coinDenom) {
      if (swapState.toAsset?.coinDenom === "OSMO") {
        swapState.setToAssetDenom("USDC");
      } else {
        swapState.setToAssetDenom("OSMO");
      }
    }

    const outputDifference = new RatePretty(
      swapState.inAmountInput?.fiatValue
        ?.toDec()
        .sub(swapState.tokenOutFiatValue?.toDec())
        .quo(swapState.inAmountInput?.fiatValue?.toDec()) ?? new Dec(0)
    );

    const showOutputDifferenceWarning = outputDifference
      .toDec()
      .abs()
      .gt(new Dec(0.05));

    const showPriceImpactWarning =
      swapState.quote?.priceImpactTokenOut?.toDec().abs().gt(new Dec(0.05)) ??
      false;

    // token select dropdown
    const [showFromTokenSelectModal, setFromTokenSelectDropdownLocal] =
      useState(false);
    const [sellOpen, setSellOpen] = useQueryState(
      "sellOpen",
      parseAsBoolean.withDefault(false)
    );

    const [buyOpen, setBuyOpen] = useQueryState(
      "buyOpen",
      parseAsBoolean.withDefault(false)
    );

    const [showToTokenSelectModal, setToTokenSelectDropdownLocal] =
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
    const closeTokenSelectModals = useCallback(() => {
      setFromTokenSelectDropdownLocal(false);
      setToTokenSelectDropdownLocal(false);
      setSellOpen(false);
      setBuyOpen(false);
    }, [setBuyOpen, setSellOpen]);

    const resetSlippage = useCallback(() => {
      const defaultSlippage = quoteType === "in-given-out" ? "0.5" : "0.5";
      if (
        slippageConfig.slippage.toDec() ===
        new Dec(defaultSlippage).quo(DecUtils.getTenExponentN(2))
      ) {
        return;
      }
      slippageConfig.select(quoteType === "in-given-out" ? 0 : 0);
      slippageConfig.setDefaultSlippage(defaultSlippage);
    }, [quoteType, slippageConfig]);

    const { amountWithSlippage, fiatAmountWithSlippage } =
      useAmountWithSlippage({
        swapState,
        slippageConfig,
        quoteType,
      });

    // reivew swap modal
    const [showSwapReviewModal, setShowSwapReviewModal] = useState(false);

    // user action
    const sendSwapTx = () => {
      if (!swapState.inAmountInput.amount) return;

      const baseEvent = {
        fromToken: swapState.fromAsset?.coinDenom,
        tokenAmount: Number(swapState.inAmountInput.amount.toDec().toString()),
        toToken: swapState.toAsset?.coinDenom,
        isOnHome: page === "Swap Page",
        isMultiHop: swapState.quote?.split.some(
          ({ pools }) => pools.length !== 1
        ),
        isMultiRoute: (swapState.quote?.split.length ?? 0) > 1,
        valueUsd: Number(
          swapState.inAmountInput.fiatValue?.toDec().toString() ?? "0"
        ),
        feeValueUsd: Number(swapState.totalFee?.toString() ?? "0"),
        page,
        quoteTimeMilliseconds: swapState.quote?.timeMs,
      };
      logEvent([EventName.Swap.swapStarted, baseEvent]);
      setIsSendingTx(true);
      swapState
        .sendTradeTokenInTx()
        .then((result) => {
          // onFullfill
          logEvent([
            EventName.Swap.swapCompleted,
            {
              ...baseEvent,
              isMultiHop: result === "multihop",
            },
          ]);

          if (swapState.toAsset && swapState.fromAsset) {
            onSwapSuccess?.({
              outTokenDenom: swapState.toAsset.coinDenom,
              sendTokenDenom: swapState.fromAsset.coinDenom,
            });
          }

          resetSlippage();
        })
        .catch((error) => {
          console.error("swap failed", error);
          if (error instanceof Error && error.message === "Request rejected") {
            // don't log when the user rejects in wallet
            return;
          }
          logEvent([EventName.Swap.swapFailed, baseEvent]);
        })
        .finally(() => {
          setIsSendingTx(false);
          onRequestModalClose?.();
          setShowSwapReviewModal(false);
        });
    };

    const isSwapToolLoading =
      isWalletLoading ||
      swapState.isQuoteLoading ||
      swapState.isLoadingNetworkFee;

    let buttonText: string;
    if (swapState.error) {
      buttonText = t(...tError(swapState.error));
    } else if (showPriceImpactWarning) {
      buttonText = t("swap.buttonError");
    } else if (swapState.hasOverSpendLimitError) {
      buttonText = t("swap.continueAnyway");
    } else if (
      !!swapState.networkFeeError &&
      swapState.isSlippageOverBalance &&
      swapState.networkFeeError.message.includes("insufficient funds")
    ) {
      buttonText = t("swap.slippageOverBalance");
    } else {
      buttonText = t("swap.button");
    }

    let warningText: string | ReactNode;
    if (swapState.hasOverSpendLimitError) {
      warningText = (
        <span>
          {t("swap.warning.exceedsSpendLimit")}{" "}
          <Button
            variant="link"
            className="!inline !h-auto !px-0 !py-0 text-wosmongton-300"
            onClick={() => {
              setIs1CTIntroModalScreen("settings-no-back-button");
            }}
          >
            {t("swap.warning.increaseSpendLimit")}
          </Button>
        </span>
      );
    }

    const isLoadingMaxButton =
      featureFlags.swapToolSimulateFee &&
      !isNil(account?.address) &&
      !swapState.inAmountInput.hasErrorWithCurrentBalanceQuote &&
      !swapState.inAmountInput?.balance?.toDec().isZero() &&
      swapState.inAmountInput.isLoadingCurrentBalanceNetworkFee;

    const isConfirmationDisabled =
      isSendingTx ||
      isWalletLoading ||
      (account?.walletStatus === WalletStatus.Connected &&
        ((quoteType === "out-given-in" && swapState.inAmountInput.isEmpty) ||
          (quoteType === "in-given-out" && swapState.outAmountInput.isEmpty) ||
          !Boolean(swapState.quote) ||
          isSwapToolLoading ||
          Boolean(swapState.error) ||
          Boolean(swapState.networkFeeError)));

    const showTokenSelectRecommendedTokens = isNil(forceSwapInPoolId);

    const {
      isOpen: isAddFundsModalOpen,
      onClose: closeAddFundsModal,
      onOpen: openAddFundsModal,
    } = useDisclosure();

    const [containerRef, { width }] = useMeasure<HTMLDivElement>();

    return (
      <>
        <div ref={containerRef} className="relative flex flex-col">
          <div className="flex flex-col gap-3">
            <div className="relative flex flex-col">
              <AssetFieldset>
                <AssetFieldsetHeader>
                  <AssetFieldsetHeaderLabel>
                    <span className="body2 py-1.5 text-osmoverse-300">
                      From
                    </span>
                  </AssetFieldsetHeaderLabel>
                  <AssetFieldsetHeaderBalance
                    onMax={() => {
                      if (quoteType !== "out-given-in") {
                        setQuoteType("out-given-in");
                      }
                      swapState.inAmountInput.toggleMax();
                      fromAmountInputEl.current?.focus();
                    }}
                    availableBalance={
                      swapState.inAmountInput.balance &&
                      formatPretty(
                        swapState.inAmountInput.balance.toDec(),
                        swapState.inAmountInput.balance.toDec().gt(new Dec(0))
                          ? {
                              minimumSignificantDigits: 6,
                              maximumSignificantDigits: 6,
                              maxDecimals: 10,
                              notation: "standard",
                            }
                          : undefined
                      )
                    }
                    showAddFundsButton={
                      !account?.isWalletConnected ||
                      (swapState.inAmountInput.balance &&
                        swapState.inAmountInput.balance.toDec().isZero())
                    }
                    openAddFundsModal={openAddFundsModal}
                    isLoadingMaxButton={isLoadingMaxButton}
                    isMaxButtonDisabled={
                      !swapState.inAmountInput.balance ||
                      swapState.inAmountInput.balance.toDec().isZero() ||
                      swapState.inAmountInput.notEnoughBalanceForMax ||
                      isLoadingMaxButton
                    }
                  />
                </AssetFieldsetHeader>
                <div className="flex items-center justify-between py-3">
                  <AssetFieldsetInput
                    ref={fromAmountInputEl}
                    inputValue={
                      quoteType === "in-given-out" &&
                      swapState.inAmountInput.amount
                        ? trimPlaceholderZeros(
                            formatPretty(
                              swapState.inAmountInput.amount?.toDec(),
                              {
                                minimumSignificantDigits: 6,
                                maximumSignificantDigits: 6,
                                maxDecimals: 10,
                                notation: "standard",
                              }
                            )
                          ).replace(/,/g, "")
                        : swapState.inAmountInput.inputAmount
                    }
                    onInputChange={(e) => {
                      e.preventDefault();

                      if (quoteType !== "out-given-in") {
                        setQuoteType("out-given-in");
                      }
                      if (e.target.value.length <= (isMobile ? 19 : 26)) {
                        swapState.inAmountInput.setAmount(e.target.value);
                      }

                      if (e.target.value.length === 0) {
                        swapState.outAmountInput.setAmount("");
                      }

                      resetSlippage();
                    }}
                    data-testid="trade-input-swap"
                    wrapperClassNames={classNames({
                      "opacity-50":
                        quoteType === "in-given-out" && isSwapToolLoading,
                    })}
                  />
                  <AssetFieldsetTokenSelector
                    selectedCoinDenom={swapState.fromAsset?.coinDenom}
                    selectedCoinImageUrl={swapState.fromAsset?.coinImageUrl}
                    isModalExternal
                    onSelectorClick={() =>
                      showTokenSelectRecommendedTokens &&
                      setOneTokenSelectOpen("from")
                    }
                    isLoadingSelectAssets={swapState.isLoadingSelectAssets}
                    data-testid="token-in"
                  />
                </div>
                <AssetFieldsetFooter>
                  <span
                    className={classNames(
                      "body2 h-5 text-osmoverse-300 transition-all",
                      {
                        "!text-osmoverse-600":
                          !swapState.inAmountInput?.fiatValue,
                      }
                    )}
                  >
                    {formatPretty(
                      swapState.inAmountInput?.fiatValue ??
                        new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0)),
                      swapState.inAmountInput?.fiatValue?.toDec() && {
                        ...getPriceExtendedFormatOptions(
                          swapState.inAmountInput?.fiatValue?.toDec()
                        ),
                      }
                    )}
                  </span>
                </AssetFieldsetFooter>
              </AssetFieldset>
              <div className="relative flex w-full">
                <div
                  className="absolute top-0 h-0.5 -translate-x-5 bg-[#3C356D4A]"
                  style={{ width: width + 40 }}
                />
                <button
                  className="group absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-solid border-[#3C356D4A] bg-osmoverse-900"
                  onClick={() => {
                    const inAmount = swapState.inAmountInput.inputAmount;
                    const outAmount = swapState.outAmountInput.inputAmount;

                    swapState.switchAssets();
                    resetSlippage();

                    if (quoteType === "out-given-in") {
                      if (featureFlags.inGivenOut) {
                        setQuoteType("in-given-out");
                        swapState.outAmountInput.setAmount(inAmount);
                      } else {
                        swapState.inAmountInput.setAmount(outAmount);
                      }
                    } else {
                      setQuoteType("out-given-in");
                      swapState.inAmountInput.setAmount(outAmount);
                    }
                  }}
                >
                  <Icon
                    id="switch"
                    className="h-6 w-6 text-wosmongton-200 transition-transform group-hover:rotate-180"
                  />
                </button>
              </div>
              <AssetFieldset>
                <AssetFieldsetHeader>
                  <AssetFieldsetHeaderLabel>
                    <span className="body2 py-1.5 text-osmoverse-300">
                      {t("assets.transfer.to")}
                    </span>
                  </AssetFieldsetHeaderLabel>
                </AssetFieldsetHeader>
                <div className="flex items-center justify-between py-3">
                  <AssetFieldsetInput
                    ref={toAmountInputEl}
                    wrapperClassNames={classNames({
                      "opacity-50":
                        quoteType === "out-given-in" && isSwapToolLoading,
                    })}
                    inputValue={
                      quoteType === "out-given-in" &&
                      swapState.outAmountInput.amount
                        ? trimPlaceholderZeros(
                            formatPretty(
                              swapState.outAmountInput.amount?.toDec(),
                              {
                                minimumSignificantDigits: 6,
                                maximumSignificantDigits: 6,
                                maxDecimals: 10,
                                notation: "standard",
                              }
                            )
                          ).replace(/,/g, "")
                        : swapState.outAmountInput.inputAmount
                    }
                    onInputChange={(e) => {
                      e.preventDefault();

                      if (quoteType !== "in-given-out")
                        setQuoteType("in-given-out");
                      if (e.target.value.length <= (isMobile ? 19 : 26)) {
                        swapState.outAmountInput.setAmount(e.target.value);
                      }

                      if (e.target.value.length === 0) {
                        swapState.inAmountInput.setAmount("");
                      }

                      resetSlippage();
                    }}
                    disabled={!featureFlags.inGivenOut}
                  />
                  <AssetFieldsetTokenSelector
                    selectedCoinDenom={swapState.toAsset?.coinDenom}
                    selectedCoinImageUrl={swapState.toAsset?.coinImageUrl}
                    isModalExternal
                    onSelectorClick={() =>
                      showTokenSelectRecommendedTokens &&
                      setOneTokenSelectOpen("to")
                    }
                    isLoadingSelectAssets={swapState.isLoadingSelectAssets}
                    data-testid="token-out"
                  />
                </div>
                <AssetFieldsetFooter>
                  <div
                    className={classNames(
                      "body2 flex h-5 text-osmoverse-300 transition-all",
                      {
                        "!text-osmoverse-600": swapState.tokenOutFiatValue
                          ?.toDec()
                          .isZero(),
                      }
                    )}
                  >
                    {swapState.tokenOutFiatValue ? (
                      <>
                        <span>
                          {formatPretty(
                            swapState.tokenOutFiatValue,
                            swapState.tokenOutFiatValue?.toDec().gt(new Dec(0))
                              ? {
                                  ...getPriceExtendedFormatOptions(
                                    swapState.tokenOutFiatValue.toDec()
                                  ),
                                }
                              : undefined
                          )}
                        </span>
                        <span
                          className={classNames(
                            "opacity-0 transition-opacity",
                            {
                              "opacity-100": swapState.tokenOutFiatValue
                                ?.toDec()
                                .gt(new Dec(0)),
                              "text-rust-400": showOutputDifferenceWarning,
                              "text-osmoverse-600":
                                !showOutputDifferenceWarning,
                              hidden: outputDifference
                                .toDec()
                                .lt(new Dec(0.01)),
                            }
                          )}
                        >
                          <GenericDisclaimer
                            title={t("tradeDetails.outputDifference.header")}
                            body={t("tradeDetails.outputDifference.content")}
                            childWrapperClassName="ml-1"
                          >{` (-${outputDifference})`}</GenericDisclaimer>
                        </span>
                      </>
                    ) : (
                      ""
                    )}
                  </div>
                </AssetFieldsetFooter>
              </AssetFieldset>
            </div>
          </div>
          {!isNil(warningText) && (
            <div
              className={classNames(
                "body2 flex animate-[fadeIn_0.3s_ease-in-out_0s] items-center justify-center rounded-xl border border-rust-600 px-3 py-2 text-center text-rust-500",
                swapState.isLoadingNetworkFee && "animate-pulse"
              )}
            >
              {warningText}
            </div>
          )}
          {swapButton ?? (
            <div className="flex w-full pb-3">
              <Button
                disabled={
                  isSendingTx ||
                  isWalletLoading ||
                  (account?.walletStatus === WalletStatus.Connected &&
                    (swapState.inAmountInput.isEmpty ||
                      !Boolean(swapState.quote) ||
                      isSwapToolLoading ||
                      Boolean(swapState.error) ||
                      (Boolean(swapState.networkFeeError) &&
                        !swapState.hasOverSpendLimitError)))
                }
                isLoading={
                  /**
                   * While 1-Click is enabled, display a loading spinner when simulation
                   * is in progress since we don't have a wallet to compute the fee for
                   * us. We need the network fee to be calculated before we can proceed
                   * with the trade.
                   */
                  isOneClickTradingEnabled &&
                  swapState.isLoadingNetworkFee &&
                  !swapState.inAmountInput.isEmpty
                }
                loadingText={buttonText}
                onClick={() => {
                  if (account?.walletStatus !== WalletStatus.Connected) {
                    return onOpenWalletSelect({
                      walletOptions: [
                        { walletType: "cosmos", chainId: chainId },
                      ],
                    });
                  }

                  setShowSwapReviewModal(true);
                }}
                className="w-full"
                data-testid="trade-button-swap"
              >
                <h6>
                  {account?.walletStatus === WalletStatus.Connected
                    ? buttonText
                    : t("connectWallet")}
                </h6>
              </Button>
            </div>
          )}
          <TradeDetails
            type="market"
            swapState={swapState}
            slippageConfig={slippageConfig}
          />
        </div>
        <TokenSelectModalLimit
          headerTitle={t("limitOrders.selectAnAssetTo.sell")}
          isOpen={showFromTokenSelectModal || sellOpen}
          onClose={closeTokenSelectModals}
          selectableAssets={swapState.selectableAssets}
          onSelect={useCallback(
            (tokenDenom: string) => {
              // If the selected token is the same as the current "to" token, switch the assets
              if (tokenDenom === swapState.toAsset?.coinDenom) {
                swapState.switchAssets();
              } else {
                swapState.setFromAssetDenom(tokenDenom);
              }

              closeTokenSelectModals();
              fromAmountInputEl.current?.focus();
            },
            [swapState, closeTokenSelectModals]
          )}
          showRecommendedTokens={showTokenSelectRecommendedTokens}
          setAssetQueryInput={swapState.setAssetsQueryInput}
          assetQueryInput={swapState.assetsQueryInput}
          fetchNextPageAssets={swapState.fetchNextPageAssets}
          hasNextPageAssets={swapState.hasNextPageAssets}
          isFetchingNextPageAssets={swapState.isFetchingNextPageAssets}
          isLoadingSelectAssets={swapState.isLoadingSelectAssets}
        />
        <TokenSelectModalLimit
          headerTitle={t("limitOrders.selectAnAssetTo.buy")}
          isOpen={showToTokenSelectModal || buyOpen}
          onClose={closeTokenSelectModals}
          selectableAssets={swapState.selectableAssets}
          onSelect={useCallback(
            (tokenDenom: string) => {
              // If the selected token is the same as the current "from" token, switch the assets
              if (tokenDenom === swapState.fromAsset?.coinDenom) {
                swapState.switchAssets();
              } else {
                swapState.setToAssetDenom(tokenDenom);
              }

              closeTokenSelectModals();
            },
            [swapState, closeTokenSelectModals]
          )}
          showRecommendedTokens={showTokenSelectRecommendedTokens}
          hideBalances
          setAssetQueryInput={swapState.setAssetsQueryInput}
          assetQueryInput={swapState.assetsQueryInput}
          fetchNextPageAssets={swapState.fetchNextPageAssets}
          hasNextPageAssets={swapState.hasNextPageAssets}
          isFetchingNextPageAssets={swapState.isFetchingNextPageAssets}
          isLoadingSelectAssets={swapState.isLoadingSelectAssets}
        />
        <ReviewOrder
          title={t("limitOrders.reviewTrade")}
          isOpen={showSwapReviewModal}
          onClose={() => setShowSwapReviewModal(false)}
          confirmAction={sendSwapTx}
          isConfirmationDisabled={isConfirmationDisabled}
          slippageConfig={slippageConfig}
          amountWithSlippage={amountWithSlippage}
          fiatAmountWithSlippage={fiatAmountWithSlippage}
          outputDifference={outputDifference}
          showOutputDifferenceWarning={showOutputDifferenceWarning}
          fromAsset={swapState.fromAsset}
          toAsset={swapState.toAsset}
          inAmountToken={swapState.inAmountInput.amount}
          inAmountFiat={swapState.inAmountInput.fiatValue}
          expectedOutput={swapState.quote?.amountOut}
          expectedOutputFiat={swapState.tokenOutFiatValue}
          gasAmount={swapState.networkFee?.gasUsdValueToPay}
          isGasLoading={swapState.isLoadingNetworkFee}
          gasError={swapState.networkFeeError}
          quoteType={swapState.quoteType}
        />
        <AddFundsModal
          isOpen={isAddFundsModalOpen}
          onRequestClose={() => {
            closeAddFundsModal();
            onRequestModalClose?.();
          }}
          from="swap"
          fromAsset={swapState.fromAsset}
          setFromAssetDenom={swapState.setFromAssetDenom}
          setToAssetDenom={swapState.setToAssetDenom}
          standalone={!showTokenSelectRecommendedTokens}
        />
      </>
    );
  }
);
