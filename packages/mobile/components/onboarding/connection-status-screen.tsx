import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "~/constants/theme-colors";

import { Button } from "../ui/button";

type ConnectionStatus = "connecting" | "success" | "failure";

export const ConnectionStatusScreen = ({
  status,
  onRetry,
  onContinue,
}: {
  status: ConnectionStatus;
  onRetry: () => void;
  onContinue: () => void;
}) => {
  const spinStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withRepeat(withTiming(`${360}deg`, { duration: 1000 }), -1),
        },
      ],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withTiming(1.2, { duration: 1000 }),
              withTiming(1, { duration: 1000 })
            ),
            -1,
            true
          ),
        },
      ],
    };
  });

  const renderContent = () => {
    switch (status) {
      case "connecting":
        return (
          <>
            <View style={styles.imageContainer}>
              <View style={styles.illustration}>
                <View style={styles.phone} />
                <Animated.View style={[styles.loadingCircle, spinStyle]} />
                <View style={styles.mouse} />
              </View>
            </View>
            <Text style={styles.title}>Connecting</Text>
            <Text style={styles.subtitle}>
              Sit tight, we're setting up your mobile wallet...
            </Text>
          </>
        );
      case "success":
        return (
          <>
            <View style={styles.imageContainer}>
              <View style={styles.illustration}>
                <View style={styles.phone} />
                <Animated.View style={[styles.checkmark, pulseStyle]} />
                <View style={styles.mouse} />
              </View>
            </View>
            <Text style={styles.title}>Pairing Successful</Text>
            <View style={styles.buttonContainer}>
              <Button
                buttonStyle={styles.button}
                textStyle={styles.buttonLabel}
                onPress={onContinue}
                title="Continue"
              />
            </View>
          </>
        );
      case "failure":
        return (
          <>
            <View style={styles.imageContainer}>
              <View style={styles.illustration}>
                <View style={styles.phone} />
                <View style={styles.errorIcon} />
                <View style={styles.mouse} />
              </View>
            </View>
            <Text style={styles.title}>Pairing Unsuccessful</Text>
            <Text style={styles.subtitle}>
              Something went wrong during the connection, please try again
            </Text>
            <View style={styles.buttonContainer}>
              <Button
                buttonStyle={styles.button}
                textStyle={styles.buttonLabel}
                onPress={onRetry}
                title="Try again"
              />
            </View>
          </>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>{renderContent()}</View>
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
  loadingCircle: {
    position: "absolute",
    width: 60,
    height: 60,
    backgroundColor: Colors.wosmongton[300],
    borderRadius: 30,
    top: 70,
    left: 70,
  },
  checkmark: {
    position: "absolute",
    width: 60,
    height: 60,
    backgroundColor: Colors.wosmongton[500],
    borderRadius: 30,
    top: 70,
    left: 70,
  },
  errorIcon: {
    position: "absolute",
    width: 60,
    height: 60,
    backgroundColor: Colors.rust[500],
    borderRadius: 30,
    top: 70,
    left: 70,
  },
  mouse: {
    position: "absolute",
    width: 40,
    height: 40,
    backgroundColor: Colors.osmoverse[700],
    borderRadius: 20,
    bottom: 20,
    right: 20,
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
    marginTop: 32,
  },
  button: {
    width: "100%",
    backgroundColor: Colors.wosmongton[500],
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});
