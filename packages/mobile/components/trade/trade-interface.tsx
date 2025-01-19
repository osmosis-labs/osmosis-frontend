import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ArrowDownIcon } from "~/components/icons/arrow-down";
import { ArrowLeftIcon } from "~/components/icons/arrow-left";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { useSwap } from "~/hooks/use-swap";

import { TradeCard } from "./trade-card";

const PREVIEW_BUTTON_HEIGHT = 100;

interface TradeInterfaceProps {
  showSubmitButton?: boolean;
}

export function TradeInterface({
  showSubmitButton = false,
}: TradeInterfaceProps) {
  const [amount, setAmount] = useState("0");
  const [error, setError] = useState("");
  const {
    setToAssetDenom,
    setFromAssetDenom,
    fromAsset,
    toAsset,
    selectableAssets,
    fetchNextPageAssets,
    hasNextPageAssets,
    isFetchingNextPageAssets,
    isLoadingSelectAssets,
  } = useSwap();

  const handleNumberClick = (num: string) => {
    if (amount === "0" && num !== ".") {
      setAmount(num);
    } else {
      setAmount((prev) => {
        if (num === "." && prev.includes(".")) return prev;
        return prev + num;
      });
    }
  };

  const handleDelete = () => {
    setAmount((prev) => {
      if (prev.length <= 1) return "0";
      return prev.slice(0, -1);
    });
  };

  const inset = useSafeAreaInsets();

  return (
    <ScrollView
      style={[
        styles.container,
        { paddingBottom: PREVIEW_BUTTON_HEIGHT - inset.bottom },
      ]}
    >
      <View>
        <Text type="title" style={styles.amountDisplay}>
          ${amount}
        </Text>
      </View>

      <View style={styles.tradeCardsContainer}>
        <TradeCard
          title="Pay"
          subtitle="Choose Asset"
          asset={fromAsset}
          onSelectAsset={(asset) => setFromAssetDenom(asset.coinMinimalDenom)}
          selectableAssets={selectableAssets}
          fetchNextPage={fetchNextPageAssets}
          hasNextPage={hasNextPageAssets ?? false}
          isFetchingNextPage={isFetchingNextPageAssets}
          isLoadingSelectAssets={isLoadingSelectAssets}
        />

        <View style={styles.swapButtonContainer}>
          <TouchableOpacity activeOpacity={0.8} style={styles.swapButton}>
            <ArrowDownIcon width={20} height={20} />
          </TouchableOpacity>
        </View>

        <TradeCard
          title="Receive"
          subtitle="Choose Asset"
          asset={toAsset}
          onSelectAsset={(asset) => setToAssetDenom(asset.coinMinimalDenom)}
          selectableAssets={selectableAssets}
          fetchNextPage={fetchNextPageAssets}
          hasNextPage={hasNextPageAssets ?? false}
          isFetchingNextPage={isFetchingNextPageAssets}
          isLoadingSelectAssets={isLoadingSelectAssets}
        />
      </View>

      <Text style={styles.errorMessage}>{error}</Text>

      <View style={styles.numberPad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.numberButton}
            onPress={() => handleNumberClick(num.toString())}
          >
            <Text style={styles.numberButtonText}>{num}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.numberButton, { paddingTop: 8 }]}
          onPress={handleDelete}
        >
          <ArrowLeftIcon width={32} height={32} />
        </TouchableOpacity>
      </View>

      {showSubmitButton && <Button title="Preview Trade" onPress={() => {}} />}
    </ScrollView>
  );
}

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
