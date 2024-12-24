import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "~/constants/theme-colors";

import { Button } from "../ui/button";

export const DeviceSecurityScreen = ({
  onUseFaceID,
  onUseDevicePin,
}: {
  onUseFaceID: () => void;
  onUseDevicePin: () => void;
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Device Security</Text>
        </View>

        <View style={styles.imageContainer}>
          {/* Replace with actual security illustration */}
          <View style={styles.illustration}>
            <View style={styles.phone} />
            <View style={styles.shield} />
            <View style={styles.fingerprint} />
          </View>
        </View>

        <Text style={styles.title}>
          First, let's set up your device security.
        </Text>
        <Text style={styles.subtitle}>
          To ensure your funds are only accessible by you, secure this device
          with FaceID or a passcode.
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            buttonStyle={styles.button}
            textStyle={styles.buttonLabel}
            onPress={onUseFaceID}
            title="Use FaceID"
          />
          <Button
            buttonStyle={styles.pinButton}
            textStyle={styles.pinButtonLabel}
            onPress={onUseDevicePin}
            title="Use Device Pin"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

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
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  illustration: {
    width: 200,
    height: 200,
    position: "relative",
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
  },
  subtitle: {
    fontSize: 16,
    color: Colors.osmoverse[300],
    textAlign: "center",
    marginBottom: 48,
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
