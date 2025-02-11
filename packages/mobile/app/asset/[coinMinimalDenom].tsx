import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AssetChart, AssetChartHeader } from "~/components/asset/asset-chart";
import { AssetDetails } from "~/components/asset/asset-details";
import { RouteHeader } from "~/components/route-header";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { api } from "~/utils/trpc";

const TRADE_BUTTON_HEIGHT = 100;

const AssetRoute = () => {
  const { coinMinimalDenom, coinDenom, coinImageUrl } = useLocalSearchParams<{
    coinMinimalDenom: string;
    coinDenom: string;
    coinImageUrl: string;
  }>();
  const router = useRouter();

  const inset = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingBottom: TRADE_BUTTON_HEIGHT - inset.bottom },
      ]}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.headerContainer}>
        <RouteHeader>
          <View style={styles.assetInfo}>
            <Image source={{ uri: coinImageUrl }} style={styles.assetImage} />
            <Text style={styles.assetDenom}>{coinDenom}</Text>
          </View>
        </RouteHeader>
      </View>

      <AssetContent coinMinimalDenom={coinMinimalDenom} />

      <View style={styles.tradeButtonContainer}>
        <Button
          title="Trade"
          onPress={() => {
            router.push({
              pathname: "/trade",
              params: {
                toToken: coinMinimalDenom,
              },
            });
          }}
          buttonStyle={styles.tradeButton}
        />
      </View>
    </SafeAreaView>
  );
};

const AssetContent = ({ coinMinimalDenom }: { coinMinimalDenom: string }) => {
  const { data: asset, isLoading } = api.local.assets.getMarketAsset.useQuery(
    { findMinDenomOrSymbol: coinMinimalDenom.replace(/-/g, "/") },
    { enabled: !!coinMinimalDenom }
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

      {/* {false && (
        <View style={styles.balanceContainer}>
          <Text type="subtitle">Your Balance:</Text>
          <View style={styles.balanceRow}>
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
          <Text style={styles.balanceAmount}>
            {asset.currentPrice?.toDec().toString()}
          </Text>
        </View>
      )} */}

      {asset && <AssetDetails asset={asset} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  assetInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  assetImage: {
    width: 24,
    height: 24,
  },
  assetDenom: {
    fontSize: 20,
    fontWeight: "600",
  },
  assetContent: {
    padding: 24,
    flex: 1,
  },
  balanceContainer: {
    gap: 10,
    marginTop: 40,
  },
  balanceRow: {
    flexDirection: "row",
    gap: 8,
  },
  balanceAmount: {
    fontWeight: "400",
    fontSize: 20,
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
    paddingHorizontal: 15,
    paddingVertical: 15,
    width: "80%",
  },
});

export default AssetRoute;
