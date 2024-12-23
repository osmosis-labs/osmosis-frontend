import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "../../config/colors";
import { Button } from "../ui/button";

export const WelcomeScreen = ({
  onLinkDesktop,
  onSkip,
}: {
  onLinkDesktop: () => void;
  onSkip: () => void;
}) => {
  const tokens = [
    { id: "eth", angle: 0 },
    { id: "usd", angle: 45 },
    { id: "diamond", angle: 90 },
    { id: "globe", angle: 135 },
    { id: "osmo", angle: 180 },
    { id: "btc", angle: 225 },
    { id: "star", angle: 270 },
    { id: "infinity", angle: 315 },
  ];

  const floatingStyle = (angle: number) =>
    useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateX: withRepeat(withSpring(Math.cos(angle) * 10), -1, true),
          },
          {
            translateY: withRepeat(withSpring(Math.sin(angle) * 10), -1, true),
          },
        ],
      };
    });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.tokensContainer}>
          {tokens.map((token) => (
            <Animated.View
              key={token.id}
              style={[
                styles.token,
                floatingStyle(token.angle * (Math.PI / 180)),
              ]}
            >
              {/* Replace with actual token icons */}
              <View
                style={[
                  styles.tokenCircle,
                  { backgroundColor: Colors.wosmongton[500] },
                ]}
              />
            </Animated.View>
          ))}
          <View style={styles.centerToken}>
            <View
              style={[
                styles.tokenCircle,
                { backgroundColor: Colors.purple[500] },
              ]}
            />
          </View>
        </View>

        <Text style={styles.title}>Welcome to the</Text>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: Colors.wosmongton[500] }]}>
            Osmosis
          </Text>
          <Text style={[styles.title, { color: Colors.purple[500] }]}>
            Mobile App
          </Text>
        </View>

        <Text style={styles.subtitle}>
          Link your desktop wallet, or skip this step and just browse the
          assets. Don't worry, you can always link your wallet at any time.
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={onLinkDesktop}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Link via desktop
          </Button>
          <Button
            mode="text"
            onPress={onSkip}
            style={styles.skipButton}
            labelStyle={styles.skipButtonLabel}
          >
            Skip for now
          </Button>
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
  titleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "white",
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
  skipButton: {
    width: "100%",
  },
  skipButtonLabel: {
    fontSize: 16,
    color: Colors.osmoverse[100],
  },
});
