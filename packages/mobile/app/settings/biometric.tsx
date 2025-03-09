import { Stack } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import { useBiometricsText } from "~/components/icons/biometrics";
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
  const biometricsText = useBiometricsText();

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

  const routeHeader = (
    <View style={styles.headerContainer}>
      <RouteHeader>
        <Text style={styles.headerText}>{biometricsText}</Text>
      </RouteHeader>
    </View>
  );

  if (!isBiometricEnabled) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        {routeHeader}
        <View style={styles.messageContainer}>
          <Text style={styles.disabledText}>
            {biometricsText} is not available on this device
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {routeHeader}

      <ScrollView style={styles.scrollView}>
        <SettingsItem
          title="App access"
          subtitle={`Require ${biometricsText} to open app`}
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
          subtitle={`Require ${biometricsText} to transact`}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
  },
  messageContainer: {
    flex: 1,
    padding: 24,
  },
  disabledText: {
    color: Colors.wosmongton["500"],
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
});
