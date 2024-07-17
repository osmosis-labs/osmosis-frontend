import { WalletStatus } from "@cosmos-kit/core";
import { Dec, IntPretty, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { isNil } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
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
import { Spinner } from "~/components/loaders";
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
import { ReviewSwapModal } from "~/modals/review-swap";
import { TokenSelectModalLimit } from "~/modals/token-select-modal-limit";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

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

    // auto focus from amount on token switch
    const fromAmountInputEl = useRef<HTMLInputElement | null>(null);

    const showPriceImpactWarning =
      swapState.quote?.priceImpactTokenOut?.toDec().abs().gt(new Dec(0.1)) ??
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

    const isUnsufficentBalance = useMemo(
      () => swapState.error?.message === "Insufficient balance",
      [swapState.error?.message]
    );

    const {
      isOpen: isAddFundsModalOpen,
      onClose: closeAddFundsModal,
      onOpen: openAddFundsModal,
    } = useDisclosure();

    return (
      <>
        <div className="relative flex flex-col gap-6 overflow-hidden">
          <div className="flex flex-col gap-3">
            <div className="relative flex flex-col">
              <div className="flex rounded-2xl bg-osmoverse-1000 py-2 px-4 transition-all">
                <div className="flex w-full flex-col">
                  <div className="flex items-center justify-between">
                    {swapState.fromAsset && (
                      <div className="flex items-center gap-4 py-3">
                        <Image
                          src={swapState.fromAsset.coinImageUrl ?? ""}
                          alt={`${swapState.fromAsset.coinDenom} icon`}
                          width={48}
                          height={48}
                          className="h-12 w-12"
                        />
                        <button
                          onClick={() => setOneTokenSelectOpen("from")}
                          className="flex flex-col"
                        >
                          <div className="flex items-center gap-1">
                            <h5>{swapState.fromAsset.coinDenom}</h5>
                            <div className="flex h-6 w-6 items-center justify-center">
                              <Icon
                                id="chevron-down"
                                className="h-auto w-4.5 text-osmoverse-400"
                              />
                            </div>
                          </div>
                          <p className="whitespace-nowrap text-osmoverse-300">
                            {swapState.fromAsset.coinName}
                          </p>
                        </button>
                      </div>
                    )}
                    <div className="flex flex-col items-end py-2">
                      <input
                        ref={fromAmountInputEl}
                        type="number"
                        className={classNames(
                          "w-full bg-transparent text-right text-white-full transition-colors placeholder:text-white-disabled focus:outline-none md:text-subtitle1",
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
                      <span
                        className={classNames(
                          "body1 md:caption whitespace-nowrap text-osmoverse-300 transition-opacity"
                        )}
                      >{`≈ ${formatPretty(
                        swapState.inAmountInput.fiatValue ?? new Dec(0),
                        {
                          maxDecimals: 8,
                        }
                      )}`}</span>
                    </div>
                  </div>
                  {account?.isWalletConnected && (
                    <div className="body2 flex justify-between pb-1">
                      <span className="pt-1.5 text-osmoverse-400">
                        {formatPretty(
                          swapState.inAmountInput.balance ?? new Dec(0)
                        )}{" "}
                        {t("pool.available").toLowerCase()}
                      </span>
                      {swapState.inAmountInput.balance &&
                      swapState.inAmountInput.balance.toDec().gt(new Dec(0)) ? (
                        <button
                          disabled={
                            !swapState.inAmountInput.balance ||
                            swapState.inAmountInput.balance.toDec().isZero() ||
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
              <div className="relative flex h-3 w-full">
                <button
                  className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-osmoverse-825"
                  onClick={() => {
                    const out = formatPretty(
                      swapState.quote?.amount
                        ? swapState.quote.amount.toDec()
                        : new Dec(0)
                    );
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
                <div className="flex w-full items-center justify-between">
                  {swapState.toAsset && (
                    <div className="flex items-center gap-4 py-3">
                      <Image
                        src={swapState.toAsset.coinImageUrl ?? ""}
                        alt={`${swapState.toAsset.coinDenom} icon`}
                        width={48}
                        height={48}
                        className="h-12 w-12"
                      />
                      <button
                        onClick={() => setOneTokenSelectOpen("to")}
                        className="flex flex-col"
                      >
                        <div className="flex items-center gap-1">
                          <h5>{swapState.toAsset.coinDenom}</h5>
                          <div className="flex h-6 w-6 items-center justify-center">
                            <Icon
                              id="chevron-down"
                              className="h-auto w-4.5 text-osmoverse-400"
                            />
                          </div>
                        </div>
                        <p className="whitespace-nowrap text-osmoverse-300">
                          {swapState.toAsset.coinName}
                        </p>
                      </button>
                    </div>
                  )}
                  <div className="flex flex-col items-end py-2">
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
                      {formatPretty(
                        swapState.quote?.amount
                          ? swapState.quote.amount.toDec()
                          : new Dec(0)
                      )}
                    </h5>
                    <span className="body1 md:caption whitespace-nowrap text-osmoverse-300 transition-opacity">{`≈ ${formatPretty(
                      swapState.tokenOutFiatValue ?? new Dec(0),
                      {
                        maxDecimals: 8,
                      }
                    )}`}</span>
                  </div>
                </div>
              </div>
            </div>
            <TradeDetails
              swapState={swapState}
              slippageConfig={slippageConfig}
              outAmountLessSlippage={outAmountLessSlippage}
              outFiatAmountLessSlippage={outFiatAmountLessSlippage}
              inDenom={swapState.fromAsset?.coinDenom}
              inPrice={swapState.inBaseOutQuoteSpotPrice}
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
        />
        <ReviewSwapModal
          isOpen={showSwapReviewModal}
          onClose={() => setShowSwapReviewModal(false)}
          swapState={swapState}
          confirmAction={sendSwapTx}
          isConfirmationDisabled={isConfirmationDisabled}
          outAmountLessSlippage={outAmountLessSlippage}
          outFiatAmountLessSlippage={outFiatAmountLessSlippage}
        />
        <AddFundsModal
          isOpen={isAddFundsModalOpen}
          onRequestClose={closeAddFundsModal}
          from="swap"
          fromAsset={swapState.fromAsset}
        />
      </>
    );
  }
);
