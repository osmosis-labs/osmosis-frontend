import { Stack } from "expo-router";
import React from "react";
import { ScrollView, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RouteHeader } from "~/components/route-header";
import { SettingsItem } from "~/components/settings/settings-item";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";

export default function FaceIDScreen() {
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "black" }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={{ paddingHorizontal: 24 }}>
        <RouteHeader>
          <Text
            style={{
              fontSize: 20,
            }}
          >
            Face ID
          </Text>
        </RouteHeader>
      </View>

      <ScrollView style={{ flex: 1, padding: 24 }}>
        <SettingsItem
          title="App access"
          subtitle="Require Face ID to open app"
          rightElement={
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ true: Colors.wosmongton["500"] }}
            />
          }
        />
        <SettingsItem
          title="Transactions"
          subtitle="Require Face ID to transact"
          rightElement={
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ true: Colors.wosmongton["500"] }}
            />
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}
