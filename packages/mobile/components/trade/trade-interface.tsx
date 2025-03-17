import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Dec, PricePretty } from "@osmosis-labs/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/utils";
import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import { ArrowDownIcon } from "~/components/icons/arrow-down";
import { ArrowLeftIcon } from "~/components/icons/arrow-left";
import { LimitExceededBottomSheet } from "~/components/trade/limit-exceeded-bottom-sheet";
import { ReviewTradeBottomSheet } from "~/components/trade/review-trade-bottom-sheet";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { useSwapQuote } from "~/hooks/swap/use-swap-quote";
import {
  createSwapStore,
  SwapStoreContext,
  useSwapStore,
  useSwapStoreApi,
} from "~/stores/swap";

import { TradeCard } from "./trade-card";

const PREVIEW_BUTTON_HEIGHT = 100;

interface TradeInterfaceProps {
  showGlobalSubmitButton?: boolean;
  initialFromDenom?: string;
  initialToDenom?: string;
}

const DefaultDenoms = ["ATOM", "OSMO"];

export function TradeInterface({
  showGlobalSubmitButton = false,
  initialFromDenom: initialFromDenomProp,
  initialToDenom: initialToDenomProp,
}: TradeInterfaceProps) {
  const store = useMemo(() => createSwapStore(), []);
  return (
    <SwapStoreContext.Provider value={store}>
      <TradeInterfaceContent
        showGlobalSubmitButton={showGlobalSubmitButton}
        initialFromDenom={initialFromDenomProp}
        initialToDenom={initialToDenomProp}
      />
    </SwapStoreContext.Provider>
  );
}

export function TradeInterfaceContent({
  showGlobalSubmitButton = false,
  initialFromDenom: initialFromDenomProp,
  initialToDenom: initialToDenomProp,
}: TradeInterfaceProps) {
  const initialFromDenom = useMemo(() => {
    if (initialToDenomProp?.toLowerCase() === "usdc") return "OSMO";
    return initialToDenomProp?.toLowerCase() === "atom"
      ? "OSMO"
      : initialFromDenomProp ??
          DefaultDenoms.filter((denom) => denom !== initialToDenomProp)[0];
  }, [initialFromDenomProp, initialToDenomProp]);
  const initialToDenom = useMemo(
    () =>
      initialToDenomProp ??
      DefaultDenoms.filter((denom) => denom !== initialFromDenom)[0],
    [initialToDenomProp, initialFromDenom]
  );

  const switchAssets = useSwapStore((state) => state.switchAssets);

  return (
    <>
      <View style={styles.container}>
        {/* Fixed top section */}
        <View>
          <View>
            <Text
              type="pageTitle"
              style={{
                textAlign: "left",
              }}
            >
              Swap
            </Text>
          </View>

          <View style={styles.tradeCardsContainer}>
            <TradeCard
              title="Pay"
              subtitle="Choose Asset"
              direction="in"
              initialToDenom={initialToDenom}
              initialFromDenom={initialFromDenom}
            />

            <View style={styles.swapButtonContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.swapButton}
                onPress={switchAssets}
              >
                <ArrowDownIcon width={20} height={20} />
              </TouchableOpacity>
            </View>

            <TradeCard
              title="Receive"
              subtitle="Choose Asset"
              direction="out"
              disabled
              initialToDenom={initialToDenom}
              initialFromDenom={initialFromDenom}
            />
          </View>

          {!showGlobalSubmitButton && (
            <SubmitButton showGlobalSubmitButton={showGlobalSubmitButton} />
          )}
          <ErrorMessage />
        </View>

        {/* Scrollable number pad section */}
        <ScrollView
          style={styles.scrollableSection}
          contentContainerStyle={{
            paddingBottom: showGlobalSubmitButton ? PREVIEW_BUTTON_HEIGHT : 0,
          }}
        >
          <NumberPad />
        </ScrollView>
      </View>
      {showGlobalSubmitButton && (
        <SubmitButton showGlobalSubmitButton={showGlobalSubmitButton} />
      )}
    </>
  );
}

const NumberPad = memo(function NumberPad() {
  const [deleteInterval, setDeleteInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const swapStoreApi = useSwapStoreApi();

  const onNumberClick = (num: string) => {
    const { inAmountInput, outAmountInput } = swapStoreApi.getState();

    if (!inAmountInput || !outAmountInput) return;

    const currentText = inAmountInput.inputAmount || "";

    // If attempting to add another '.', skip
    if (num === "." && currentText.includes(".")) {
      return;
    }

    // If text is empty and user types '.', prepend with '0.'
    const actuallyTyped = num === "." && currentText.length === 0 ? "0." : num;

    const newText = currentText + actuallyTyped;

    // Basic leading zero check: if new text starts with "0" but not "0.", trim the leading zero.
    // e.g., "0" + "2" => "2" instead of "02"
    const sanitizedText =
      newText.length > 1 && newText.startsWith("0") && newText[1] !== "."
        ? newText.substring(1)
        : newText;

    inAmountInput.setAmount(sanitizedText);

    if (sanitizedText.length === 0) {
      outAmountInput.setAmount("");
    }
  };

  const onDelete = () => {
    const { inAmountInput, outAmountInput } = swapStoreApi.getState();

    if (!inAmountInput || !outAmountInput) return;

    const currentText = inAmountInput.inputAmount || "";
    // Delete the last character
    const newText = currentText.slice(0, -1);
    inAmountInput.setAmount(newText);

    // Clear outAmount if there's no input left
    if (newText.length === 0) {
      outAmountInput.setAmount("");
    }
  };

  const startContinuousDelete = () => {
    // First delete immediately
    onDelete();

    // Then set up interval to continue deleting
    const interval = setInterval(() => {
      const { inAmountInput } = swapStoreApi.getState();
      if (
        !inAmountInput ||
        !inAmountInput.inputAmount ||
        inAmountInput.inputAmount.length === 0
      ) {
        // Stop deleting if there's nothing left
        if (deleteInterval) {
          clearInterval(deleteInterval);
          setDeleteInterval(null);
        }
        return;
      }
      onDelete();
    }, 150); // Delete every 150ms

    setDeleteInterval(interval);
  };

  const stopContinuousDelete = () => {
    if (deleteInterval) {
      clearInterval(deleteInterval);
      setDeleteInterval(null);
    }
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (deleteInterval) {
        clearInterval(deleteInterval);
      }
    };
  }, [deleteInterval]);

  return (
    <View style={styles.numberPad}>
      <View style={styles.numberRow}>
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => onNumberClick("1")}
        >
          <Text style={styles.numberButtonText}>1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => onNumberClick("2")}
        >
          <Text style={styles.numberButtonText}>2</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => onNumberClick("3")}
        >
          <Text style={styles.numberButtonText}>3</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.numberRow}>
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => onNumberClick("4")}
        >
          <Text style={styles.numberButtonText}>4</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => onNumberClick("5")}
        >
          <Text style={styles.numberButtonText}>5</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => onNumberClick("6")}
        >
          <Text style={styles.numberButtonText}>6</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.numberRow}>
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => onNumberClick("7")}
        >
          <Text style={styles.numberButtonText}>7</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => onNumberClick("8")}
        >
          <Text style={styles.numberButtonText}>8</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => onNumberClick("9")}
        >
          <Text style={styles.numberButtonText}>9</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.numberRow}>
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => onNumberClick(".")}
        >
          <Text style={styles.numberButtonText}>.</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => onNumberClick("0")}
        >
          <Text style={styles.numberButtonText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.numberButton, styles.deleteButton]}
          onPress={onDelete}
          onLongPress={startContinuousDelete}
          onPressOut={stopContinuousDelete}
          delayLongPress={500} // Start continuous delete after 500ms
        >
          <ArrowLeftIcon width={28} height={28} fill="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const ErrorMessage = () => {
  const error = useSwapStore((state) => state.error);
  return (
    <Text style={styles.errorMessage}>
      {error?.message && error.message.length > 50
        ? `${error.message.substring(0, 50)}...`
        : error?.message}
    </Text>
  );
};

const SubmitButton = ({
  showGlobalSubmitButton,
}: {
  showGlobalSubmitButton: boolean;
}) => {
  const { inAmountInput, outAmountInput } = useSwapStore(
    useShallow((state) => ({
      inAmountInput: state.inAmountInput,
      outAmountInput: state.outAmountInput,
    }))
  );
  const {
    isQuoteLoading,
    isLoadingNetworkFee,
    hasOverSpendLimitError,
    error,
    networkFeeError,
    isSlippageOverBalance,
    overspendErrorParams,
    sendTradeTokenInTx,
    quote,
    tokenOutFiatValue,
    networkFee,
    areMessagesLoading,
  } = useSwapQuote();

  const reviewTradeBottomSheetRef = useRef<BottomSheetModal>(null);
  const limitExceededBottomSheetRef = useRef<BottomSheetModal>(null);
  const swapStoreApi = useSwapStoreApi();

  const isSwapToolLoading = useMemo(
    () =>
      isQuoteLoading ||
      !!isLoadingNetworkFee ||
      areMessagesLoading ||
      quote?.amountIn.toCoin().amount !==
        inAmountInput?.amount?.toCoin().amount,
    [
      isQuoteLoading,
      isLoadingNetworkFee,
      areMessagesLoading,
      quote?.amountIn,
      inAmountInput?.amount,
    ]
  );

  useLayoutEffect(() => {
    swapStoreApi.setState({
      isSwapToolLoading,
    });
  }, [isSwapToolLoading, swapStoreApi]);

  useEffect(() => {
    swapStoreApi.setState({
      error,
    });
  }, [error, swapStoreApi]);

  const isSwapButtonDisabled =
    /**
     * We will show a bottom sheet letting the user know that they have overspent their spend limit
     * so they know they have to wait for the spend limit to be reset in a day.
     */
    !hasOverSpendLimitError &&
    (inAmountInput?.isEmpty ||
      !Boolean(quote) ||
      isSwapToolLoading ||
      Boolean(error) ||
      Boolean(networkFeeError) ||
      outAmountInput?.isEmpty);

  const highPriceImpact =
    quote?.priceImpactTokenOut?.toDec().abs().gt(new Dec(0.05)) ?? false;

  let buttonText: string;
  if (highPriceImpact) {
    buttonText = "High price impact";
  } else if (hasOverSpendLimitError) {
    buttonText = "Limit exceeded";
  } else if (
    !!networkFeeError &&
    isSlippageOverBalance &&
    networkFeeError.message.includes("insufficient funds")
  ) {
    buttonText = "Insufficient funds to cover slippage";
  } else {
    buttonText = "Preview Trade";
  }

  const showDangerButton = hasOverSpendLimitError || highPriceImpact;

  const onSuccess = useCallback(() => {
    reviewTradeBottomSheetRef.current?.dismiss();
    inAmountInput?.reset();
    outAmountInput?.reset();
  }, [inAmountInput, outAmountInput, reviewTradeBottomSheetRef]);

  const onReviewTrade = useCallback(() => {
    if (hasOverSpendLimitError) {
      limitExceededBottomSheetRef.current?.present();
    } else {
      reviewTradeBottomSheetRef.current?.present();
    }
  }, [
    hasOverSpendLimitError,
    limitExceededBottomSheetRef,
    reviewTradeBottomSheetRef,
  ]);

  const inset = useSafeAreaInsets();

  return (
    <>
      {!showGlobalSubmitButton ? (
        <Button
          title={buttonText}
          disabled={isSwapButtonDisabled}
          variant={showDangerButton ? "danger" : "primary"}
          onPress={onReviewTrade}
        />
      ) : (
        <View
          style={[
            styles.previewButtonContainer,
            { paddingBottom: inset.bottom },
          ]}
        >
          <Button
            title="Preview Trade"
            onPress={onReviewTrade}
            buttonStyle={styles.previewButton}
            disabled={isSwapButtonDisabled}
            variant={showDangerButton ? "danger" : "primary"}
          />
        </View>
      )}

      {quote && inAmountInput?.amount && (
        <ReviewTradeBottomSheet
          ref={reviewTradeBottomSheetRef}
          inAmount={inAmountInput.amount}
          inAmountFiat={
            inAmountInput.fiatValue ?? new PricePretty(DEFAULT_VS_CURRENCY, 0)
          }
          expectedOutput={quote.amountOut}
          expectedOutputFiat={
            tokenOutFiatValue ?? new PricePretty(DEFAULT_VS_CURRENCY, 0)
          }
          networkFee={networkFee?.gasUsdValueToPay}
          sendTradeTokenInTx={sendTradeTokenInTx}
          onSuccess={onSuccess}
          highPriceImpact={highPriceImpact}
          priceImpact={quote.priceImpactTokenOut}
        />
      )}

      <LimitExceededBottomSheet
        ref={limitExceededBottomSheetRef}
        wouldSpendTotal={overspendErrorParams?.wouldSpendTotal}
        limit={overspendErrorParams?.limit}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  scrollableSection: {
    flex: 1,
    paddingTop: 8,
  },
  amountDisplay: {
    fontWeight: "600",
    alignSelf: "center",
    marginBottom: 32,
  },
  tradeCardsContainer: {
    marginBottom: 16,
    gap: 4,
  },
  swapButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    position: "absolute",
    alignSelf: "center",
    top: "50%",
    transform: [{ translateY: "-50%" }],
  },
  swapButton: {
    backgroundColor: Colors["wosmongton"][700],
    width: 42,
    height: 42,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderColor: Colors["osmoverse"][1000],
    borderWidth: 4,
  },
  numberPad: {
    flexDirection: "column",
    width: "100%",
  },
  numberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    width: "100%",
  },
  numberButton: {
    width: "30%",
    aspectRatio: 1.8,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: Colors["osmoverse"][900],
    borderColor: Colors["osmoverse"][800],
    borderWidth: 1,
  },
  errorMessage: {
    color: Colors["rust"][500],
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  numberButtonText: {
    color: "white",
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "500",
  },
  previewButtonContainer: {
    position: "absolute",
    height: PREVIEW_BUTTON_HEIGHT,
    bottom: 0,
    width: "100%",
    borderTopWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: Colors.background,
  },
  previewButton: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    width: "80%",
  },
  deleteButton: {
    backgroundColor: Colors["wosmongton"][700],
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderColor: Colors["wosmongton"][500],
    borderWidth: 1,
  },
});
