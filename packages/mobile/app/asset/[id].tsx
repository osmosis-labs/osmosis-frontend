import { Dec } from "@keplr-wallet/unit";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { GraphPoint, LineGraph } from "react-native-graph";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChevronLeftIcon } from "~/components/icons/chevron-left";
import { SubscriptDecimal } from "~/components/subscript-decimal";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/colors";
import { getChangeColor } from "~/utils/price";
import { api } from "~/utils/trpc";

const AssetRoute = () => {
  const { id, coinDenom, coinImageUrl } = useLocalSearchParams<{
    id: string;
    coinDenom: string;
    coinImageUrl: string;
  }>();
  const router = useRouter();

  const { data: asset, isLoading } = api.local.assets.getMarketAsset.useQuery(
    { findMinDenomOrSymbol: id.replace(/-/g, "/") },
    { enabled: !!id }
  );

  console.log(asset);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.chevronLeftIcon}
            onPress={() => router.back()}
          >
            <ChevronLeftIcon width={24} height={24} />
          </TouchableOpacity>
          <View style={styles.assetInfo}>
            <Image
              source={{ uri: coinImageUrl }}
              style={{ width: 24, height: 24 }}
            />
            <Text style={styles.assetDenom}>{coinDenom}</Text>
          </View>
        </View>

        <AssetContent id={id} />
      </View>

      <View style={styles.tradeButtonContainer}>
        <TouchableOpacity style={styles.tradeButton}>
          <Text>Trade</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
function gaussian(mean: number, variance: number) {
  return {
    ppf: (p: number) => {
      // Using the inverse error function to approximate the inverse CDF of a Gaussian distribution
      const a1 = 0.254829592;
      const a2 = -0.284496736;
      const a3 = 1.421413741;
      const a4 = -1.453152027;
      const a5 = 1.061405429;
      const p_low = 0.02425;
      const p_high = 1 - p_low;

      if (p < p_low) {
        const q = Math.sqrt(-2 * Math.log(p));
        return (
          mean +
          (Math.sqrt(variance) *
            ((((a5 * q + a4) * q + a3) * q + a2) * q + a1)) /
            (1 + q)
        );
      } else if (p_high < p) {
        const q = Math.sqrt(-2 * Math.log(1 - p));
        return (
          mean -
          (Math.sqrt(variance) *
            ((((a5 * q + a4) * q + a3) * q + a2) * q + a1)) /
            (1 + q)
        );
      } else {
        const q = p - 0.5;
        const r = q * q;
        return (
          mean +
          (Math.sqrt(variance) *
            q *
            ((((a5 * r + a4) * r + a3) * r + a2) * r + a1)) /
            (1 + r)
        );
      }
    },
  };
}

function weightedRandom(mean: number, variance: number): number {
  const distribution = gaussian(mean, variance);
  // Take a random sample using inverse transform sampling method.
  return distribution.ppf(Math.random());
}

export function generateRandomGraphData(length: number): GraphPoint[] {
  return Array<number>(length)
    .fill(0)
    .map((_, index) => ({
      date: new Date(
        new Date(2000, 0, 1).getTime() + 1000 * 60 * 60 * 24 * index
      ),
      value: weightedRandom(10, Math.pow(index + 1, 2)),
    }));
}

const AssetContent = ({ id }: { id: string }) => {
  const { data: asset, isLoading } = api.local.assets.getMarketAsset.useQuery(
    { findMinDenomOrSymbol: id.replace(/-/g, "/") },
    { enabled: !!id }
  );

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (!asset) {
    return <Text>No data available</Text>;
  }

  return (
    <ScrollView style={styles.assetContent}>
      <View style={styles.assetPriceContainer}>
        <Text type="title">
          {asset.currentPrice?.symbol}
          {asset.currentPrice ? (
            <SubscriptDecimal decimal={asset.currentPrice.toDec()} />
          ) : null}
        </Text>
        <Text
          type="subtitle"
          style={{
            color: getChangeColor(asset.priceChange24h?.toDec() || new Dec(0)),
            marginBottom: 5,
          }}
        >
          {asset.priceChange24h?.toString()}
        </Text>
      </View>

      <LineGraph
        animated
        color={getChangeColor(asset.priceChange24h?.toDec() || new Dec(0))}
        points={generateRandomGraphData(100)}
        enablePanGesture
        style={{
          height: 220,
          width: "100%",
        }}
        gradientFillColors={["#ff00005D", "#ff000000"]}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
  content: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  assetInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chevronLeftIcon: {
    position: "absolute",
    left: 0,
  },
  assetDenom: {
    fontSize: 20,
    fontWeight: "600",
  },
  assetPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  assetContent: {
    paddingVertical: 24,
    height: "100%",
  },
  tradeButtonContainer: {
    position: "absolute",
    height: 100,
    bottom: 0,
    width: "100%",
    paddingTop: 10,
    borderTopWidth: 1,
    alignItems: "center",
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  tradeButton: {
    backgroundColor: Colors["wosmongton"][500],
    padding: 15,
    borderRadius: 255,
    alignItems: "center",
    width: "80%",
  },
});

export default AssetRoute;
