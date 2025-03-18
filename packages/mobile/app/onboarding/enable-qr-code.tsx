import * as Linking from "expo-linking";
import React from "react";
import { Image, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RouteHeader } from "~/components/route-header";
import { Text } from "~/components/ui/text";

import { Button } from "../../components/ui/button";
import { Colors } from "../../constants/theme-colors";

export default function LinkViaDesktop() {
  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const handleConnectManually = () => {
    // TODO: Implement manual connection flow
    console.log("Connect manually pressed");
  };

  const deviceType = Platform.OS === "ios" ? "iPhone" : "Android";

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
            Link via Desktop
          </Text>
        </RouteHeader>
      </View>

      <View style={styles.content}>
        <Image
          source={require("~/assets/images/qr-code-connection.png")}
          style={styles.illustration}
          resizeMode="contain"
        />

        <Text style={styles.description}>
          To Connect via QR Code, you need to allow access to the camera through
          the {deviceType} settings and connect using QR code.
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            buttonStyle={styles.button}
            onPress={handleOpenSettings}
            title="Open Settings"
            textStyle={styles.buttonLabel}
          />
          {/* <Button
            buttonStyle={styles.manualButton}
            onPress={handleConnectManually}
            title="Connect Manually"
            textStyle={styles.manualButtonLabel}
            variant="outline"
          /> */}
        </View>

        <Text style={styles.alternateText}>
          Or you can connect manually with your desktop account using your
          pairing code.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.osmoverse[1000],
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  illustration: {
    width: "100%",
    height: 258,
    marginBottom: 40,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 24,
  },
  button: {
    width: "100%",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  manualButton: {
    width: "100%",
  },
  manualButtonLabel: {
    fontSize: 16,
    color: Colors.osmoverse[100],
  },
  alternateText: {
    fontSize: 14,
    color: Colors.osmoverse[300],
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
