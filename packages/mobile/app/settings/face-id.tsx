import { Stack } from "expo-router";
import React from "react";
import { ScrollView, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import { RouteHeader } from "~/components/route-header";
import { SettingsItem } from "~/components/settings/settings-item";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import {
  useBiometricPrompt,
  useOsBiometricAuthEnabled,
} from "~/hooks/biometrics";
import { useSettingsStore } from "~/stores/settings";

export default function FaceIDScreen() {
  const { isBiometricEnabled } = useOsBiometricAuthEnabled();

  const {
    biometricForAppAccess,
    biometricForTransactions,
    setBiometricForAppAccess,
    setBiometricForTransactions,
  } = useSettingsStore(
    useShallow((state) => ({
      biometricForAppAccess: state.biometricForAppAccess,
      biometricForTransactions: state.biometricForTransactions,
      setBiometricForAppAccess: state.setBiometricForAppAccess,
      setBiometricForTransactions: state.setBiometricForTransactions,
    }))
  );

  const { authenticate: authenticateAppAccess } = useBiometricPrompt({
    onSuccess: () => {
      setBiometricForAppAccess(!biometricForAppAccess);
    },
  });

  const { authenticate: authenticateTransactions } = useBiometricPrompt({
    onSuccess: () => {
      setBiometricForTransactions(!biometricForTransactions);
    },
  });

  if (!isBiometricEnabled) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View style={{ paddingHorizontal: 24 }}>
          <RouteHeader>
            <Text style={{ fontSize: 20 }}>Face ID</Text>
          </RouteHeader>
        </View>
        <View style={{ flex: 1, padding: 24 }}>
          <Text style={{ color: Colors.wosmongton["500"] }}>
            Face ID is not available on this device
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={{ paddingHorizontal: 24 }}>
        <RouteHeader>
          <Text style={{ fontSize: 20 }}>Face ID</Text>
        </RouteHeader>
      </View>

      <ScrollView style={{ flex: 1, padding: 24 }}>
        <SettingsItem
          title="App access"
          subtitle="Require Face ID to open app"
          rightElement={
            <Switch
              value={biometricForAppAccess}
              onValueChange={async () => {
                await authenticateAppAccess();
              }}
              trackColor={{ true: Colors.wosmongton["500"] }}
            />
          }
        />
        <SettingsItem
          title="Transactions"
          subtitle="Require Face ID to transact"
          rightElement={
            <Switch
              value={biometricForTransactions}
              onValueChange={async () => {
                await authenticateTransactions();
              }}
              trackColor={{ true: Colors.wosmongton["500"] }}
            />
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}
