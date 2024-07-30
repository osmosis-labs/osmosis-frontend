import { WalletStatus } from "@cosmos-kit/core";
import { Dec, IntPretty, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { isNil } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { parseAsBoolean, useQueryState } from "nuqs";
import {
  FunctionComponent,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

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
import { useSwap } from "~/hooks/use-swap";
import { useGlobalIs1CTIntroModalScreen } from "~/modals";
import { AddFundsModal } from "~/modals/add-funds";
import { ReviewOrder } from "~/modals/review-order";
import { TokenSelectModalLimit } from "~/modals/token-select-modal-limit";
import { useStore } from "~/stores";
import { formatPretty, getPriceExtendedFormatOptions } from "~/utils/formatter";

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

    const account = accountStore.getWallet(chainId);
    const slippageConfig = useSlippageConfig();

    const swapState = useSwap({
      initialFromDenom: initialSendTokenDenom,
      initialToDenom: initialOutTokenDenom,
      useOtherCurrencies,
      useQueryParams,
      forceSwapInPoolId,
      maxSlippage: slippageConfig.slippage.toDec(),
    });

    if (swapState.fromAsset?.coinDenom === swapState.toAsset?.coinDenom) {
      if (swapState.toAsset?.coinDenom === "OSMO") {
        swapState.setToAssetDenom("USDC");
      } else {
        swapState.setToAssetDenom("OSMO");
      }
    }

    // auto focus from amount on token switch
    const fromAmountInputEl = useRef<HTMLInputElement | null>(null);

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

    const { outAmountLessSlippage, outFiatAmountLessSlippage } = useMemo(() => {
      // Compute ratio of 1 - slippage
      const oneMinusSlippage = new Dec(1).sub(slippageConfig.slippage.toDec());

      // Compute out amount less slippage
      const outAmountLessSlippage =
        swapState.quote && swapState.toAsset
          ? new IntPretty(swapState.quote.amount.toDec().mul(oneMinusSlippage))
          : undefined;

      // Compute out fiat amount less slippage
      const outFiatAmountLessSlippage = swapState.tokenOutFiatValue
        ? new PricePretty(
            DEFAULT_VS_CURRENCY,
            swapState.tokenOutFiatValue?.toDec().mul(oneMinusSlippage)
          )
        : undefined;

      return { outAmountLessSlippage, outFiatAmountLessSlippage };
    }, [
      slippageConfig.slippage,
      swapState.quote,
      swapState.toAsset,
      swapState.tokenOutFiatValue,
    ]);

    // reivew swap modal
    const [showSwapReviewModal, setShowSwapReviewModal] = useState(false);

    // user action
    const sendSwapTx = () => {
      // // prompt to select wallet insteaad of swapping
      // if (account?.walletStatus !== WalletStatus.Connected) {
      //   return onOpenWalletSelect({
      //     walletOptions: [{ walletType: "cosmos", chainId: chainId }],
      //   });
      // }

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
        router: swapState.quote?.name,
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

    const isSwapToolLoading = isWalletLoading || swapState.isQuoteLoading;

    let buttonText: string;
    if (swapState.error) {
      buttonText = t(...tError(swapState.error));
    } else if (showPriceImpactWarning) {
      buttonText = t("swap.buttonError");
    } else if (swapState.hasOverSpendLimitError) {
      buttonText = t("swap.continueAnyway");
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

    const isLoadingMaxButton = useMemo(
      () =>
        featureFlags.swapToolSimulateFee &&
        !isNil(account?.address) &&
        !swapState.inAmountInput.hasErrorWithCurrentBalanceQuote &&
        !swapState.inAmountInput?.balance?.toDec().isZero() &&
        swapState.inAmountInput.isLoadingCurrentBalanceNetworkFee,
      [
        account?.address,
        featureFlags.swapToolSimulateFee,
        swapState.inAmountInput?.balance,
        swapState.inAmountInput.hasErrorWithCurrentBalanceQuote,
        swapState.inAmountInput.isLoadingCurrentBalanceNetworkFee,
      ]
    );

    const isConfirmationDisabled = useMemo(() => {
      return (
        isSendingTx ||
        isWalletLoading ||
        (account?.walletStatus === WalletStatus.Connected &&
          (swapState.inAmountInput.isEmpty ||
            !Boolean(swapState.quote) ||
            isSwapToolLoading ||
            Boolean(swapState.error) ||
            Boolean(swapState.networkFeeError)))
      );
    }, [
      account?.walletStatus,
      isSendingTx,
      isSwapToolLoading,
      isWalletLoading,
      swapState.error,
      swapState.inAmountInput.isEmpty,
      swapState.networkFeeError,
      swapState.quote,
    ]);

    const showTokenSelectRecommendedTokens = useMemo(
      () => isNil(forceSwapInPoolId),
      [forceSwapInPoolId]
    );

    const {
      isOpen: isAddFundsModalOpen,
      onClose: closeAddFundsModal,
      onOpen: openAddFundsModal,
    } = useDisclosure();

    return (
      <>
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="relative flex flex-col">
              <AssetFieldset>
                <AssetFieldsetHeader>
                  <AssetFieldsetHeaderLabel>
                    <span className="pt-1.5 text-osmoverse-400">From</span>
                  </AssetFieldsetHeaderLabel>
                  <AssetFieldsetHeaderBalance
                    onMax={() => swapState.inAmountInput.toggleMax()}
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
                      swapState.inAmountInput.balance &&
                      swapState.inAmountInput.balance.toDec().isZero()
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
                    inputValue={swapState.inAmountInput.inputAmount}
                    onInputChange={(e) => {
                      e.preventDefault();
                      if (e.target.value.length <= (isMobile ? 19 : 26)) {
                        swapState.inAmountInput.setAmount(e.target.value);
                      }
                    }}
                  />
                  <AssetFieldsetTokenSelector
                    selectedCoinDenom={swapState.fromAsset?.coinDenom}
                    selectedCoinImageUrl={swapState.fromAsset?.coinImageUrl}
                    isModalExternal
                    onSelectorClick={() =>
                      showTokenSelectRecommendedTokens &&
                      setOneTokenSelectOpen("from")
                    }
                  />
                </div>
                <AssetFieldsetFooter>
                  <span className="body2 h-5 text-osmoverse-300 transition-opacity">
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
                <div className="absolute top-0 h-0.5 w-[512px] -translate-x-5 bg-[#3C356D4A]" />
                <button
                  className="group absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-solid border-[#3C356D4A] bg-osmoverse-900"
                  onClick={() => {
                    const out = swapState.quote?.amount
                      ? formatPretty(swapState.quote.amount.toDec())
                      : "";
                    swapState.inAmountInput.setAmount(out);
                    swapState.switchAssets();
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
                    <span className="pt-1.5 text-osmoverse-400">To</span>
                  </AssetFieldsetHeaderLabel>
                </AssetFieldsetHeader>
                <div className="flex items-center justify-between py-3">
                  <AssetFieldsetInput
                    outputValue={
                      <h3
                        className={classNames(
                          "whitespace-nowrap transition-opacity",
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
                        {swapState.quote?.amount
                          ? formatPretty(swapState.quote.amount.toDec(), {
                              minimumSignificantDigits: 6,
                              maximumSignificantDigits: 6,
                              maxDecimals: 10,
                              notation: "standard",
                            })
                          : "0"}
                      </h3>
                    }
                  />
                  <AssetFieldsetTokenSelector
                    selectedCoinDenom={swapState.toAsset?.coinDenom}
                    selectedCoinImageUrl={swapState.toAsset?.coinImageUrl}
                    isModalExternal
                    onSelectorClick={() =>
                      showTokenSelectRecommendedTokens &&
                      setOneTokenSelectOpen("to")
                    }
                  />
                </div>
                <AssetFieldsetFooter>
                  <span className="body2 h-5 text-osmoverse-300 transition-opacity">
                    {swapState.tokenOutFiatValue?.toDec().gt(new Dec(0)) ? (
                      <span>
                        {formatPretty(swapState.tokenOutFiatValue, {
                          ...getPriceExtendedFormatOptions(
                            swapState.tokenOutFiatValue.toDec()
                          ),
                        })}
                        <span
                          className={
                            showOutputDifferenceWarning
                              ? "text-rust-400"
                              : "text-osmoverse-600"
                          }
                        >{` (-${outputDifference})`}</span>
                      </span>
                    ) : (
                      ""
                    )}
                  </span>
                </AssetFieldsetFooter>
              </AssetFieldset>
              {/* <div className="flex rounded-2xl bg-osmoverse-1000 py-2 px-4 transition-all">
                <div className="flex w-full flex-col">
                  <div className="body2 flex justify-between pb-1">
                    <span className="pt-1.5 text-osmoverse-400">From</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col py-2">
                      <input
                        ref={fromAmountInputEl}
                        type="text"
                        className={classNames(
                          "w-full bg-transparent text-white-full transition-colors placeholder:text-white-disabled focus:outline-none md:text-subtitle1",
                          "text-h5 font-h5 md:font-subtitle1",
                          {
                            "text-rust-300": isUnsufficentBalance,
                          }
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
                    </div>
                    <div className="flex flex-col items-end py-2">
                      {swapState.fromAsset && (
                        <div className="flex items-center gap-4 py-3">
                          <Image
                            src={swapState.fromAsset.coinImageUrl ?? ""}
                            alt={`${swapState.fromAsset.coinDenom} icon`}
                            width={48}
                            height={48}
                            className="h-8 w-8"
                          />
                          <button
                            onClick={() =>
                              showTokenSelectRecommendedTokens &&
                              setOneTokenSelectOpen("from")
                            }
                            className={classNames("flex flex-col", {
                              "pointer-events-none":
                                !showTokenSelectRecommendedTokens,
                            })}
                          >
                            <div className="flex items-center gap-2">
                              <h5>{swapState.fromAsset.coinDenom}</h5>
                              {showTokenSelectRecommendedTokens && (
                                <div className="flex h-6 w-6 items-center justify-center">
                                  <Icon
                                    id="chevron-down"
                                    className="h-auto w-4.5 text-osmoverse-400"
                                  />
                                </div>
                              )}
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="body2 flex justify-between pb-1">
                    <span
                      className={classNames(
                        "md:caption whitespace-nowrap pt-1.5 text-osmoverse-400 transition-opacity"
                      )}
                    >
                      {swapState.inAmountInput?.fiatValue
                        ?.toDec()
                        .gt(new Dec(0))
                        ? `${formatPretty(swapState.inAmountInput?.fiatValue, {
                            ...getPriceExtendedFormatOptions(
                              swapState.inAmountInput?.fiatValue?.toDec()
                            ),
                          })}`
                        : ""}
                    </span>
                    {account?.isWalletConnected && (
                      <div className="body2 flex justify-between gap-2 pb-1">
                        <span className="pt-1.5 text-osmoverse-400">
                          {t("pool.available") +
                            ": " +
                            formatPretty(
                              swapState.inAmountInput.balance?.toDec() ??
                                new Dec(0),
                              {
                                minimumSignificantDigits: 6,
                                maximumSignificantDigits: 6,
                                maxDecimals: 10,
                                notation: "standard",
                              }
                            ) +
                            "  "}
                        </span>
                        {swapState.inAmountInput.balance &&
                        swapState.inAmountInput.balance
                          .toDec()
                          .gt(new Dec(0)) ? (
                          <button
                            disabled={
                              !swapState.inAmountInput.balance ||
                              swapState.inAmountInput.balance
                                .toDec()
                                .isZero() ||
                              swapState.inAmountInput.notEnoughBalanceForMax ||
                              isLoadingMaxButton
                            }
                            onClick={() => swapState.inAmountInput.toggleMax()}
                            className={classNames(
                              "flex h-8 items-center justify-center gap-1 rounded-5xl border border-osmoverse-700 bg-transparent py-1.5 px-3 text-wosmongton-200 transition-colors hover:bg-osmoverse-700 disabled:pointer-events-none disabled:opacity-50",
                              {
                                "text-rust-300": isUnsufficentBalance,
                              }
                            )}
                          >
                            {isLoadingMaxButton && (
                              <Spinner className="h-2.5 w-2.5" />
                            )}
                            Max
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={openAddFundsModal}
                            className="flex items-center justify-center rounded-5xl bg-wosmongton-700 py-1.5 px-3"
                          >
                            {t("limitOrders.addFunds")}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="relative flex h-3 w-full">
                <button
                  className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-osmoverse-825"
                  onClick={() => {
                    const out = swapState.quote?.amount
                      ? formatPretty(swapState.quote.amount.toDec())
                      : "";
                    swapState.inAmountInput.setAmount(out);
                    swapState.switchAssets();
                  }}
                >
                  <Icon
                    id="arrows-swap-16"
                    className="h-4 w-4 text-wosmongton-200"
                  />
                </button>
              </div>
              <div className="flex rounded-2xl bg-osmoverse-1000 py-2 px-4 transition-all">
                <div className="flex w-full flex-col">
                  <div className="body2 flex justify-between pb-1">
                    <span className="pt-1.5 text-osmoverse-400">To</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col py-2">
                      <h5
                        className={classNames(
                          "md:subtitle1 whitespace-nowrap transition-opacity",
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
                        {swapState.quote?.amount
                          ? formatPretty(swapState.quote.amount.toDec(), {
                              minimumSignificantDigits: 6,
                              maximumSignificantDigits: 6,
                              maxDecimals: 10,
                              notation: "standard",
                            })
                          : "0"}
                      </h5>
                    </div>
                    <div className="flex flex-col items-end py-2">
                      {swapState.toAsset && (
                        <div className="flex items-center gap-4 py-3">
                          <Image
                            src={swapState.toAsset.coinImageUrl ?? ""}
                            alt={`${swapState.toAsset.coinDenom} icon`}
                            width={40}
                            height={40}
                            className="h-8 w-8"
                          />
                          <button
                            onClick={() =>
                              showTokenSelectRecommendedTokens &&
                              setOneTokenSelectOpen("to")
                            }
                            className={classNames("flex flex-col", {
                              "pointer-events-none":
                                !showTokenSelectRecommendedTokens,
                            })}
                          >
                            <div className="flex items-center gap-2">
                              <h5>{swapState.toAsset.coinDenom}</h5>
                              {showTokenSelectRecommendedTokens && (
                                <div className="flex h-6 w-6 items-center justify-center">
                                  <Icon
                                    id="chevron-down"
                                    className="h-auto w-4.5 text-osmoverse-400"
                                  />
                                </div>
                              )}
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="body2 flex justify-between pb-1">
                    <span
                      className={classNames(
                        "md:caption whitespace-nowrap pt-1.5 text-osmoverse-400 transition-opacity"
                      )}
                    >
                      {swapState.tokenOutFiatValue?.toDec().gt(new Dec(0)) ? (
                        <span>
                          {formatPretty(swapState.tokenOutFiatValue, {
                            ...getPriceExtendedFormatOptions(
                              swapState.tokenOutFiatValue.toDec()
                            ),
                          })}
                          <span
                            className={
                              showOutputDifferenceWarning
                                ? "text-rust-400"
                                : "text-osmoverse-600"
                            }
                          >{` (-${outputDifference})`}</span>
                        </span>
                      ) : (
                        ""
                      )}
                    </span>
                  </div>
                </div>
              </div> */}
            </div>
            <TradeDetails
              type="market"
              swapState={swapState}
              slippageConfig={slippageConfig}
              outAmountLessSlippage={outAmountLessSlippage}
              outFiatAmountLessSlippage={outFiatAmountLessSlippage}
            />
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
            <Button
              disabled={
                isSendingTx ||
                isWalletLoading ||
                (account?.walletStatus === WalletStatus.Connected &&
                  (swapState.inAmountInput.isEmpty ||
                    !Boolean(swapState.quote) ||
                    Boolean(swapState.error) ||
                    account?.txTypeInProgress !== ""))
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
                    walletOptions: [{ walletType: "cosmos", chainId: chainId }],
                  });
                }

                setShowSwapReviewModal(true);
              }}
            >
              <h6>
                {account?.walletStatus === WalletStatus.Connected ||
                isSwapToolLoading
                  ? buttonText
                  : t("connectWallet")}
              </h6>
            </Button>
          )}
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
          title="Swap"
          isOpen={showSwapReviewModal}
          onClose={() => setShowSwapReviewModal(false)}
          swapState={swapState}
          confirmAction={sendSwapTx}
          isConfirmationDisabled={isConfirmationDisabled}
          slippageConfig={slippageConfig}
          outAmountLessSlippage={outAmountLessSlippage}
          outFiatAmountLessSlippage={outFiatAmountLessSlippage}
          outputDifference={outputDifference}
          showOutputDifferenceWarning={showOutputDifferenceWarning}
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
