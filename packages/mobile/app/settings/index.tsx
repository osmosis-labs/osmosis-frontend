import { PricePretty } from "@osmosis-labs/unit";
import { formatSpendLimit } from "@osmosis-labs/utils";
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
import { MobileSessionIcon } from "~/components/icons/mobile-session";
import { RouteHeader } from "~/components/route-header";
import { SettingsGroup } from "~/components/settings/settings-group";
import { SettingsItem } from "~/components/settings/settings-item";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { useRemainingSpendLimit } from "~/hooks/use-remaining-spend-limit";
import { useWallets } from "~/hooks/use-wallets";
import { useSettingsStore } from "~/stores/settings";

export default function SettingsScreen() {
  const biometricsText = useBiometricsText();
  const { currentWallet } = useWallets();

  const data = useRemainingSpendLimit({
    authenticatorId:
      currentWallet?.type === "smart-account"
        ? currentWallet.authenticatorId
        : "",
    walletAddress: currentWallet?.address ?? "",
    enabled: currentWallet?.type === "smart-account",
  });

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
        {currentWallet?.type === "smart-account" && (
          <SettingsGroup title="Loss protection limit">
            <SpendLimitDisplay
              remainingSpendLimit={data.remainingSpendLimit}
              totalSpendLimit={data.totalSpendLimit}
            />
          </SettingsGroup>
        )}

        <SettingsGroup title="Preferences">
          <PreviewAssetsToggle />
        </SettingsGroup>

        <SettingsGroup title="Security">
          <SettingsItem
            title={biometricsText}
            icon={<BiometricsIcon />}
            onPress={() => router.push("/settings/biometric")}
          />
          {currentWallet?.type === "smart-account" && (
            <SettingsItem
              title="End session"
              icon={<MobileSessionIcon width={24} height={24} />}
              onPress={() => router.push("/settings/end-session")}
            />
          )}
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

interface SpendLimitDisplayProps {
  remainingSpendLimit?: PricePretty;
  totalSpendLimit?: PricePretty;
}

const SpendLimitDisplay: React.FC<SpendLimitDisplayProps> = ({
  remainingSpendLimit,
  totalSpendLimit,
}) => {
  return (
    <SettingsItem
      title="Remaining limit"
      value={`${formatSpendLimit(remainingSpendLimit)} / ${formatSpendLimit(
        totalSpendLimit
      )}`}
    />
  );
};
