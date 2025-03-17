/* eslint-disable unicorn/filename-case */
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RouteHeader } from "~/components/route-header";
import { TradeInterface } from "~/components/trade/trade-interface";
import { Text } from "~/components/ui/text";

const TradeScreen = () => {
  const { fromToken, toToken } = useLocalSearchParams<{
    fromToken: string;
    toToken: string;
  }>();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={{ marginHorizontal: 24, paddingTop: 12 }}>
        <RouteHeader>
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
      </View>

      <TradeInterface
        initialToDenom={toToken}
        initialFromDenom={fromToken}
        showGlobalSubmitButton
      />
    </SafeAreaView>
  );
};

export default TradeScreen;
