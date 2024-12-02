import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ArrowDownIcon } from "~/components/icons/arrow-down";
import { ArrowLeftIcon } from "~/components/icons/arrow-left";
import { PlusIcon } from "~/components/icons/plus-icon";
import { RouteHeader } from "~/components/route-header";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";

type Props = {};

const TradeScreen = (props: Props) => {
  const { toToken } = useLocalSearchParams<{
    toToken: string;
  }>();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <RouteHeader headerStyle={{ marginHorizontal: 24 }}>
        <Text
          type="subtitle"
          style={{
            fontSize: 20,
            fontWeight: "600",
          }}
        >
          Trade
        </Text>
      </RouteHeader>

      <TradeInterface />

      <View style={styles.previewButtonContainer}>
        <Button
          title="Preview Trade"
          onPress={() => {}}
          buttonStyle={styles.previewButton}
        />
      </View>
    </SafeAreaView>
  );
};

const PREVIEW_BUTTON_HEIGHT = 100;

export function TradeInterface() {
  const [amount, setAmount] = useState("0");
  const [error, setError] = useState("");

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
      {/* Amount Display */}
      <View>
        <Text type="title" style={styles.amountDisplay}>
          ${amount}
        </Text>
      </View>

      {/* Trade Cards */}
      <View style={styles.tradeCardsContainer}>
        <TradeCard title="Pay" subtitle="Choose Asset" />

        <View style={styles.swapButtonContainer}>
          <TouchableOpacity activeOpacity={0.8} style={styles.swapButton}>
            <ArrowDownIcon width={20} height={20} />
          </TouchableOpacity>
        </View>

        <TradeCard title="Receive" subtitle="Choose Asset" />
      </View>

      {/* Error Message */}
      <Text style={styles.errorMessage}>{error}</Text>

      {/* Number Pad */}
      <View style={styles.numberPad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0].map((num, i) => (
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
    </ScrollView>
  );
}

const TradeCard = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <TouchableOpacity style={styles.tradeCard} activeOpacity={0.8}>
    <View style={styles.addButton}>
      <PlusIcon width={24} height={24} />
    </View>
    <View>
      <Text style={styles.tradeCardTitle}>{title}</Text>
      <Text style={styles.tradeCardSubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
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
  tradeCard: {
    backgroundColor: Colors["osmoverse"][825],
    borderRadius: 12,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  tradeCardTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 300,
  },
  tradeCardSubtitle: {
    color: Colors["osmoverse"][400],
    fontSize: 16,
    fontWeight: 300,
  },
  addButton: {
    backgroundColor: "#2c2d43",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 24,
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
    fontWeight: 500,
  },
  previewButtonContainer: {
    position: "absolute",
    height: PREVIEW_BUTTON_HEIGHT,
    bottom: 0,
    width: "100%",
    paddingTop: 10,
    borderTopWidth: 1,
    alignItems: "center",
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  previewButton: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    width: "80%",
  },
});

export default TradeScreen;
