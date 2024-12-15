import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RouteHeader } from "~/components/route-header";
import { TradeInterface } from "~/components/trade/trade-interface";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

type Props = {};

const PREVIEW_BUTTON_HEIGHT = 100;

const TradeScreen = (props: Props) => {
  const { toToken } = useLocalSearchParams<{
    toToken: string;
  }>();

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

const styles = StyleSheet.create({
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
