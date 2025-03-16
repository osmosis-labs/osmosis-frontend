import MaskedView from "@react-native-masked-view/masked-view";
import { useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { QrCodeIcon } from "~/components/icons/qr-code";
import { Colors } from "~/constants/theme-colors";

import { Button } from "../../components/ui/button";

export default function Welcome() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  const handleLinkDesktop = async () => {
    if (permission?.granted) {
      router.push("/onboarding/camera-scan");
    } else if (permission?.canAskAgain) {
      await requestPermission();
      router.push("/onboarding/camera-scan");
    } else {
      router.push("/onboarding/enable-qr-code");
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("~/assets/images/onboarding-welcome-assets.png")}
          style={{
            height: 378,
            width: Dimensions.get("window").width,
            paddingHorizontal: 7,
          }}
        />

        <Text style={styles.title}>Welcome to the</Text>
        <MaskedView
          style={{ height: 40, flexDirection: "row", marginBottom: 16 }}
          maskElement={
            <View
              style={{
                // Transparent background because mask is based off alpha channel.
                backgroundColor: "transparent",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={styles.title}>Osmosis Mobile App</Text>
            </View>
          }
        >
          <LinearGradient
            colors={["#FFDACF", "#FF9A10", "#CA2EBD"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            locations={[0.1964, 0.507, 0.8502]}
            style={{ flex: 1 }}
          />
        </MaskedView>

        <Text style={styles.subtitle}>
          Link your desktop wallet, or skip this step and just browse the
          assets. Don't worry, you can always link your wallet at any time.
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            buttonStyle={styles.button}
            onPress={handleLinkDesktop}
            icon={<QrCodeIcon />}
            title="Link via desktop"
            textStyle={styles.buttonLabel}
            disabled={!permission}
          />
          {/* <Button
            buttonStyle={styles.skipButton}
            onPress={handleSkip}
            title="Skip for now"
            textStyle={styles.skipButtonLabel}
            variant="outline"
          /> */}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  tokensContainer: {
    width: 200,
    height: 200,
    position: "relative",
    marginBottom: 48,
  },
  token: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  tokenCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  centerToken: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    color: "white",
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
    flex: 1,
    paddingBottom: 24,
    justifyContent: "flex-end",
  },
  button: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    width: "100%",
  },
  skipButtonLabel: {
    fontSize: 16,
    color: Colors.osmoverse[100],
  },
});
