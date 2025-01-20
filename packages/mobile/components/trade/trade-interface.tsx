import { Dec } from "@osmosis-labs/unit";
import React, { memo, useCallback } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { create } from "zustand";

import { ArrowDownIcon } from "~/components/icons/arrow-down";
import { ArrowLeftIcon } from "~/components/icons/arrow-left";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { useSwap } from "~/hooks/use-swap";

import { TradeCard } from "./trade-card";

const PREVIEW_BUTTON_HEIGHT = 100;

interface SelectionState {
  selection: { start: number; end: number };
  setSelection: (selection: { start: number; end: number }) => void;
}

export const useInputSelectionStore = create<SelectionState>((set) => ({
  selection: { start: 0, end: 0 },
  setSelection: (selection) => set({ selection }),
}));

interface TradeInterfaceProps {
  showSubmitButton?: boolean;
}

export function TradeInterface({
  showSubmitButton = false,
}: TradeInterfaceProps) {
  const {
    inAmountInput,
    outAmountInput,
    setToAssetDenom,
    setFromAssetDenom,
    fromAsset,
    toAsset,
    selectableAssets,
    fetchNextPageAssets,
    hasNextPageAssets,
    isFetchingNextPageAssets,
    isLoadingSelectAssets,
    recommendedAssets,
    switchAssets,
    error,
    isQuoteLoading,
    isLoadingNetworkFee,
    isSlippageOverBalance,
    networkFeeError,
    quote,
  } = useSwap();
  const { selection, setSelection } = useInputSelectionStore();

  const isSwapToolLoading = isQuoteLoading || !!isLoadingNetworkFee;

  /**
   * Attempts to insert the user's typed character (num) into the inAmountInput,
   * respecting the selection and preventing invalid numeric formats.
   */
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

      const newText =
        currentText.slice(0, selection.start) +
        actuallyTyped +
        currentText.slice(selection.end);

      // Basic leading zero check: if new text starts with "0" but not "0.", trim the leading zero.
      // e.g., "0" + "2" => "2" instead of "02"
      const sanitizedText =
        newText.length > 1 && newText.startsWith("0") && newText[1] !== "."
          ? newText.substring(1)
          : newText;

      inAmountInput.setAmount(sanitizedText);

      // Update cursor position after the inserted character(s)
      const newPosition = selection.start + actuallyTyped.length;
      setSelection({ start: newPosition, end: newPosition });

      if (sanitizedText.length === 0) {
        outAmountInput.setAmount("");
      }
    },
    [
      inAmountInput,
      outAmountInput,
      selection.start,
      selection.end,
      setSelection,
    ]
  );

  /**
   * Deletes the character(s) within the selection or just before the cursor,
   * and updates cursor position accordingly.
   */
  const handleDelete = useCallback(() => {
    const currentText = inAmountInput.inputAmount || "";

    // If there's a selection range, delete the selected text
    if (selection.start !== selection.end) {
      const newText =
        currentText.slice(0, selection.start) +
        currentText.slice(selection.end);

      inAmountInput.setAmount(newText);
      // Place cursor at the start of the selection
      setSelection({ start: selection.start, end: selection.start });

      // Clear outAmount if there's no input left
      if (newText.length === 0) {
        outAmountInput.setAmount("");
      }
      return;
    }

    // If cursor is at the start, do nothing
    if (selection.start === 0) return;

    // Delete the character before the cursor
    const newText =
      currentText.slice(0, selection.start - 1) +
      currentText.slice(selection.start);

    inAmountInput.setAmount(newText);

    // Move cursor back one position
    const newPosition = selection.start - 1;
    setSelection({ start: newPosition, end: newPosition });

    // Clear outAmount if there's no input left
    if (newText.length === 0) {
      outAmountInput.setAmount("");
    }
  }, [
    inAmountInput,
    outAmountInput,
    selection.start,
    selection.end,
    setSelection,
  ]);

  const isSwapButtonDisabled =
    inAmountInput.isEmpty ||
    !Boolean(quote) ||
    isSwapToolLoading ||
    Boolean(error) ||
    Boolean(networkFeeError);

  const inset = useSafeAreaInsets();

  let buttonText: string;
  if (error) {
    buttonText = error.message;
  } else if (
    quote?.priceImpactTokenOut?.toDec().abs().gt(new Dec(0.05)) ??
    false
  ) {
    buttonText = "Swap anyway";
  } else if (
    !!networkFeeError &&
    isSlippageOverBalance &&
    networkFeeError.message.includes("insufficient funds")
  ) {
    buttonText = "Insufficient funds to cover slippage";
  } else {
    buttonText = "Preview Trade";
  }

  return (
    <ScrollView
      style={[
        styles.container,
        { paddingBottom: PREVIEW_BUTTON_HEIGHT - inset.bottom },
      ]}
    >
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
          amountInput={inAmountInput}
          title="Pay"
          subtitle="Choose Asset"
          recommendedAssets={recommendedAssets}
          asset={fromAsset}
          onSelectAsset={(asset) => setFromAssetDenom(asset.coinMinimalDenom)}
          selectableAssets={selectableAssets}
          fetchNextPage={fetchNextPageAssets}
          hasNextPage={hasNextPageAssets ?? false}
          isFetchingNextPage={isFetchingNextPageAssets}
          isLoadingSelectAssets={isLoadingSelectAssets}
          onPressMax={() => {
            inAmountInput.toggleMax();
          }}
          isSwapToolLoading={isSwapToolLoading}
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
          recommendedAssets={recommendedAssets}
          asset={toAsset}
          onSelectAsset={(asset) => setToAssetDenom(asset.coinMinimalDenom)}
          selectableAssets={selectableAssets}
          fetchNextPage={fetchNextPageAssets}
          hasNextPage={hasNextPageAssets ?? false}
          isFetchingNextPage={isFetchingNextPageAssets}
          isLoadingSelectAssets={isLoadingSelectAssets}
          disabled
          isSwapToolLoading={isSwapToolLoading}
        />
      </View>

      <Button
        title={buttonText}
        disabled={isSwapButtonDisabled}
        onPress={() => {}}
      />
      <Text style={styles.errorMessage}>{error?.message}</Text>

      <NumberPad onNumberClick={handleNumberClick} onDelete={handleDelete} />

      {showSubmitButton && (
        <Button
          title={buttonText}
          disabled={isSwapButtonDisabled}
          onPress={() => {}}
        />
      )}
    </ScrollView>
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
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0].map((num) => (
        <TouchableOpacity
          key={num}
          style={styles.numberButton}
          onPress={() => onNumberClick(num.toString())}
        >
          <Text style={styles.numberButtonText}>{num}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.numberButton, { paddingTop: 8 }]}
        onPress={onDelete}
      >
        <ArrowLeftIcon width={32} height={32} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
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
  errorMessage: {
    color: "#ff4444",
    fontSize: 14,
    textAlign: "center",
  },
  numberPad: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  numberButton: {
    width: "30%",
    aspectRatio: 1.3,
    justifyContent: "center",
    alignItems: "center",
  },
  numberButtonText: {
    color: "white",
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "500",
  },
});
