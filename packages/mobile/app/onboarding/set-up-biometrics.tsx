import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import { RouteHeader } from "~/components/route-header";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import {
  useBiometricPrompt,
  useDeviceSupportsBiometricAuth,
  useOsBiometricAuthEnabled,
} from "~/hooks/biometrics";
import { useSettingsStore } from "~/stores/settings";

import { Button } from "../../components/ui/button";

export default function Security() {
  const router = useRouter();
  const { faceId } = useDeviceSupportsBiometricAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { isCheckingBiometricAvailability, isBiometricEnabled } =
    useOsBiometricAuthEnabled();

  const { setBiometricForAppAccess, setBiometricForTransactions } =
    useSettingsStore(
      useShallow((state) => ({
        biometricForAppAccess: state.biometricForAppAccess,
        biometricForTransactions: state.biometricForTransactions,
        setBiometricForAppAccess: state.setBiometricForAppAccess,
        setBiometricForTransactions: state.setBiometricForTransactions,
      }))
    );

  const { authenticate: authenticateBiometrics } = useBiometricPrompt({
    onSuccess: () => {
      setBiometricForAppAccess(true);
      setBiometricForTransactions(true);
      router.push("/(tabs)");
    },
  });

  const handleUseDevicePin = () => {
    router.push("/(tabs)");
  };

  useEffect(() => {
    if (!isCheckingBiometricAvailability && !isBiometricEnabled) {
      router.push("/(tabs)");
    }
  }, [isCheckingBiometricAvailability, isBiometricEnabled, router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
        <RouteHeader>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
            }}
          >
            Device Security
          </Text>
        </RouteHeader>
      </View>

      <View style={styles.content}>
        <Image
          source={require("~/assets/images/device-security.png")}
          style={styles.illustration}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          First, let's set up your device security.
        </Text>
        <Text style={styles.subtitle}>
          To ensure your funds are only accessible by you, secure this device
          with {faceId ? "FaceID" : "TouchID"}.
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            buttonStyle={styles.button}
            textStyle={styles.buttonLabel}
            onPress={async () => {
              try {
                setIsAuthenticating(true);
                await authenticateBiometrics();
              } finally {
                setIsAuthenticating(false);
              }
            }}
            title={faceId ? "Use FaceID" : "Use TouchID"}
            disabled={isCheckingBiometricAvailability}
          />
          <Button
            buttonStyle={styles.pinButton}
            textStyle={styles.pinButtonLabel}
            onPress={handleUseDevicePin}
            variant="outline"
            title="Set Up Later"
            disabled={isAuthenticating}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.osmoverse[900],
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  illustration: {
    height: 231,
    position: "relative",
    marginBottom: 32,
  },
  phone: {
    position: "absolute",
    width: 120,
    height: 200,
    backgroundColor: Colors.wosmongton[500],
    borderRadius: 20,
    transform: [{ rotate: "-15deg" }],
  },
  shield: {
    position: "absolute",
    width: 80,
    height: 100,
    backgroundColor: Colors.osmoverse[700],
    borderRadius: 12,
    top: 50,
    left: 60,
  },
  fingerprint: {
    position: "absolute",
    width: 40,
    height: 40,
    backgroundColor: Colors.wosmongton[300],
    borderRadius: 20,
    top: 80,
    left: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.osmoverse[300],
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  button: {
    width: "100%",
    backgroundColor: Colors.wosmongton[500],
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  pinButton: {
    width: "100%",
  },
  pinButtonLabel: {
    fontSize: 16,
    color: Colors.osmoverse[100],
  },
});
