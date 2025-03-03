import { Stack } from "expo-router";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import { AlertTriangle } from "~/components/icons/alert-triangle";
import {
  BiometricsIcon,
  useBiometricsText,
} from "~/components/icons/biometrics";
import { RouteHeader } from "~/components/route-header";
import { SettingsGroup } from "~/components/settings/settings-group";
import { SettingsItem } from "~/components/settings/settings-item";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { useSettingsStore } from "~/stores/settings";

export default function SettingsScreen() {
  const biometricsText = useBiometricsText();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
        <RouteHeader>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
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

        <SettingsGroup title="Preferences">
          <PreviewAssetsToggle />
        </SettingsGroup>

        <SettingsGroup title="Security">
          <SettingsItem
            title={biometricsText}
            icon={<BiometricsIcon />}
            onPress={() => router.push("/settings/face-id")}
          />
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
      icon={<AlertTriangle />}
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
