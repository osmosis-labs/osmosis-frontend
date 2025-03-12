import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Dec, PricePretty } from "@osmosis-labs/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/utils";
import React, {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ArrowDownIcon } from "~/components/icons/arrow-down";
import { ArrowLeftIcon } from "~/components/icons/arrow-left";
import { LimitExceededBottomSheet } from "~/components/trade/limit-exceeded-bottom-sheet";
import { ReviewTradeBottomSheet } from "~/components/trade/review-trade-bottom-sheet";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import {
  useSwapAmountInput,
  UseSwapAmountInputReturn,
} from "~/hooks/swap/use-swap-amount-input";
import { useSwapQuote } from "~/hooks/swap/use-swap-quote";
import { useSwapStore } from "~/stores/swap";

import { TradeCard } from "./trade-card";

const PREVIEW_BUTTON_HEIGHT = 100;

interface TradeInterfaceProps {
  showGlobalSubmitButton?: boolean;
  initialFromDenom?: string;
  initialToDenom?: string;
}

const atomMinimalDenom =
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";

export function TradeInterface({
  showGlobalSubmitButton = false,
  initialFromDenom: initialFromDenomProp,
  initialToDenom: initialToDenomProp,
}: TradeInterfaceProps) {
  const initialFromDenom = useMemo(
    () =>
      initialToDenomProp?.toLowerCase() === atomMinimalDenom.toLowerCase()
        ? "OSMO"
        : initialFromDenomProp ?? "ATOM",
    [initialFromDenomProp, initialToDenomProp]
  );
  const initialToDenom = useMemo(
    () => initialToDenomProp ?? "OSMO",
    [initialToDenomProp]
  );

  const setInitialDenoms = useSwapStore((state) => state.setInitialDenoms);
  const switchAssets = useSwapStore((state) => state.switchAssets);

  useLayoutEffect(() => {
    setInitialDenoms(initialFromDenom, initialToDenom);
  }, [initialFromDenom, initialToDenom, setInitialDenoms]);

  const inAmountInput = useSwapAmountInput({
    direction: "in",
  });
  const outAmountInput = useSwapAmountInput({
    direction: "out",
  });

  // const isSwapToolLoading = isQuoteLoading || !!isLoadingNetworkFee;
  const isSwapToolLoading = false;

  const handleNumberClick = useCallback(
    (num: string) => {
      const currentText = inAmountInput.inputAmount || "";

      // If attempting to add another '.', skip
      if (num === "." && currentText.includes(".")) {
        return;
      }

      // If text is empty and user types '.', prepend with '0.'
      const actuallyTyped =
        num === "." && currentText.length === 0 ? "0." : num;

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
    },
    [inAmountInput, outAmountInput]
  );

  const handleDelete = useCallback(() => {
    const currentText = inAmountInput.inputAmount || "";
    // Delete the last character
    const newText = currentText.slice(0, -1);
    inAmountInput.setAmount(newText);

    // Clear outAmount if there's no input left
    if (newText.length === 0) {
      outAmountInput.setAmount("");
    }
  }, [inAmountInput, outAmountInput]);

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
              amountInput={inAmountInput}
              isSwapToolLoading={isSwapToolLoading}
              direction="in"
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
              amountInput={outAmountInput}
              title="Receive"
              subtitle="Choose Asset"
              direction="out"
              disabled
              isSwapToolLoading={isSwapToolLoading}
            />
          </View>

          {!showGlobalSubmitButton && (
            <SubmitButton
              inAmountInput={inAmountInput}
              outAmountInput={outAmountInput}
              isSwapToolLoading={isSwapToolLoading}
              showGlobalSubmitButton={showGlobalSubmitButton}
            />
          )}
        </View>

        {/* Scrollable number pad section */}
        <ScrollView
          style={styles.scrollableSection}
          contentContainerStyle={{
            paddingBottom: showGlobalSubmitButton ? PREVIEW_BUTTON_HEIGHT : 0,
          }}
        >
          <NumberPad
            onNumberClick={handleNumberClick}
            onDelete={handleDelete}
          />
        </ScrollView>
      </View>
      {showGlobalSubmitButton && (
        <SubmitButton
          inAmountInput={inAmountInput}
          outAmountInput={outAmountInput}
          isSwapToolLoading={isSwapToolLoading}
          showGlobalSubmitButton={showGlobalSubmitButton}
        />
      )}
    </>
  );
}

const NumberPad = memo(function NumberPad({
  onNumberClick,
  onDelete,
}: {
  onNumberClick: (numStr: string) => void;
  onDelete: () => void;
}) {
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
        >
          <ArrowLeftIcon width={28} height={28} fill="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const SubmitButton = ({
  inAmountInput,
  outAmountInput,
  isSwapToolLoading,

  showGlobalSubmitButton,
}: {
  inAmountInput: UseSwapAmountInputReturn;
  outAmountInput: UseSwapAmountInputReturn;
  isSwapToolLoading: boolean;

  showGlobalSubmitButton: boolean;
}) => {
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
  } = useSwapQuote({
    inAmountInput,
    outAmountInput,
  });

  const reviewTradeBottomSheetRef = useRef<BottomSheetModal>(null);
  const limitExceededBottomSheetRef = useRef<BottomSheetModal>(null);

  const isSwapButtonDisabled =
    /**
     * We will show a bottom sheet letting the user know that they have overspent their spend limit
     * so they know they have to wait for the spend limit to be reset in a day.
     */
    !hasOverSpendLimitError &&
    (inAmountInput.isEmpty ||
      !Boolean(quote) ||
      isSwapToolLoading ||
      Boolean(error) ||
      Boolean(networkFeeError));

  const highPriceImpact =
    quote?.priceImpactTokenOut?.toDec().abs().gt(new Dec(0.05)) ?? false;

  let buttonText: string;
  if (highPriceImpact) {
    buttonText = "Swap anyway";
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
    inAmountInput.reset();
    outAmountInput.reset();
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
        <>
          <Button
            title={buttonText}
            disabled={isSwapButtonDisabled}
            variant={showDangerButton ? "danger" : "primary"}
            onPress={onReviewTrade}
          />

          <Text style={styles.errorMessage}>
            {error?.message && error.message.length > 50
              ? `${error.message.substring(0, 50)}...`
              : error?.message}
          </Text>
        </>
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

      {quote && inAmountInput.amount && (
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
