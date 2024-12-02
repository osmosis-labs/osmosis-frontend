import { Dec } from "@osmosis-labs/unit";
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
import { SafeAreaView } from "react-native-safe-area-context";

import { AssetChart, AssetChartHeader } from "~/components/asset-chart";
import { AssetDetails } from "~/components/asset-details";
import { ChevronLeftIcon } from "~/components/icons/chevron-left";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { getChangeColor } from "~/utils/price";
import { api } from "~/utils/trpc";

const TRADE_BUTTON_HEIGHT = 100;

const AssetRoute = () => {
  const { id, coinDenom, coinImageUrl } = useLocalSearchParams<{
    id: string;
    coinDenom: string;
    coinImageUrl: string;
  }>();
  const router = useRouter();

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
        <Button
          title="Trade"
          onPress={() => {}}
          buttonStyle={styles.tradeButton}
        />
      </View>
    </SafeAreaView>
  );
};

const AssetContent = ({ id }: { id: string }) => {
  const { data: asset, isLoading } = api.local.assets.getMarketAsset.useQuery(
    { findMinDenomOrSymbol: id.replace(/-/g, "/") },
    { enabled: !!id }
  );

  if (isLoading) {
    return (
      <View style={styles.assetContent}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!asset) {
    return <Text>No data available</Text>;
  }

  return (
    <ScrollView style={styles.assetContent}>
      <AssetChartHeader asset={asset} />
      <AssetChart asset={asset} />

      {false && (
        <View style={{ gap: 10, marginTop: 40 }}>
          <Text type="subtitle">Your Balance:</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Text type="title">{asset.currentPrice?.toString()}</Text>
            <Text
              style={{
                color: getChangeColor(
                  asset.priceChange24h?.toDec() || new Dec(0)
                ),
              }}
            >
              {asset.priceChange24h?.toString()}
            </Text>
          </View>
          <Text style={{ fontWeight: "400", fontSize: 20 }}>
            {asset.currentPrice?.toDec().toString()}
          </Text>
        </View>
      )}

      {asset && <AssetDetails asset={asset} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    paddingBottom: TRADE_BUTTON_HEIGHT,
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
  assetContent: {
    paddingVertical: 24,
    height: "100%",
  },
  tradeButtonContainer: {
    position: "absolute",
    height: TRADE_BUTTON_HEIGHT,
    bottom: 0,
    width: "100%",
    paddingTop: 10,
    borderTopWidth: 1,
    alignItems: "center",
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  tradeButton: {
    backgroundColor: Colors["wosmongton"][500],
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 255,
    alignItems: "center",
    width: "80%",
  },
});

export default AssetRoute;
