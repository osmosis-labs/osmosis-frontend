import { Stack } from "expo-router";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import { RouteHeader } from "~/components/route-header";
import { SettingsGroup } from "~/components/settings/settings-group";
import { SettingsItem } from "~/components/settings/settings-item";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { useSettingsStore } from "~/stores/settings";

export default function SettingsScreen() {
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
            Settings
          </Text>
        </RouteHeader>
      </View>

      <ScrollView style={{ flex: 1, padding: 24 }}>
        {/* <SettingsGroup title="Preferences">
          <SettingsItem
            title="Appearance"
            value="Device settings"
            onPress={() => {}}
          />
          <SettingsItem title="Local currency" value="USD" onPress={() => {}} />
          <SettingsItem title="Language" value="English" onPress={() => {}} />
          <SettingsItem
            title="Hide small balances"
            rightElement={
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ true: Colors.wosmongton["500"] }}
              />
            }
          />
          
          <SettingsItem
            title="Hide unknown tokens"
            rightElement={
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ true: Colors.wosmongton["500"] }}
              />
            }
          />
          <SettingsItem
            title="Haptic touch"
            rightElement={
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ true: Colors.wosmongton["500"] }}
              />
            }
          />
          <SettingsItem title="Privacy" onPress={() => {}} />
          <SettingsItem
            title="Testnet mode"
            rightElement={<Switch value={false} onValueChange={() => {}} />}
          />
        </SettingsGroup> */}

        <SettingsGroup title="Security">
          <SettingsItem
            title="Face ID"
            onPress={() => router.push("/settings/face-id")}
          />
          <PreviewAssetsToggle />
          {/* <SettingsItem title="Recovery phrase" onPress={() => {}} />
          <SettingsItem title="iCloud backup" onPress={() => {}} /> */}
        </SettingsGroup>
      </ScrollView>
    </SafeAreaView>
  );
}

const PreviewAssetsToggle: React.FC = () => {
  const { showUnverifiedAssets, setShowUnverifiedAssets } = useSettingsStore(
    useShallow((state) => ({
      showUnverifiedAssets: state.showUnverifiedAssets,
      setShowUnverifiedAssets: state.setShowUnverifiedAssets,
    }))
  );

  return (
    <SettingsItem
      title="Show unverified assets"
      rightElement={
        <Switch
          value={showUnverifiedAssets}
          onValueChange={setShowUnverifiedAssets}
          trackColor={{ true: Colors.wosmongton["500"] }}
        />
      }
    />
  );
};
