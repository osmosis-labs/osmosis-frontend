import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "~/constants/theme-colors";

import { Button } from "../ui/button";

export const ConnectWalletScreen = ({
  onConnect,
  onBack,
}: {
  onConnect: (code: string) => void;
  onBack: () => void;
}) => {
  const [code, setCode] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Button
            title="Back"
            buttonStyle={styles.backButton}
            onPress={onBack}
          />
          <Text style={styles.headerTitle}>Connect Manually</Text>
        </View>

        <View style={styles.imageContainer}>
          {/* Replace with actual laptop illustration */}
          <View style={styles.illustration}>
            <View style={styles.laptop}>
              <View style={styles.screen} />
              <View style={styles.keyboard} />
            </View>
            <View style={styles.pizza} />
          </View>
        </View>

        <Text style={styles.instructions}>
          With your wallet connected, navigate to 'Profile' {">"} 'Link mobile
          device' on Osmosis web app to find your pairing code
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter the code"
            placeholderTextColor={Colors.osmoverse[300]}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Connect"
            onPress={() => onConnect(code)}
            buttonStyle={styles.button}
            disabled={code.length !== 6}
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
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 60,
    paddingHorizontal: 16,
  },
  backButton: {
    position: "absolute",
    left: 0,
  },
  backButtonLabel: {
    fontSize: 16,
    color: Colors.osmoverse[100],
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    marginTop: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  illustration: {
    width: 200,
    height: 200,
    position: "relative",
  },
  laptop: {
    position: "absolute",
    width: 160,
    height: 120,
  },
  screen: {
    width: "100%",
    height: 100,
    backgroundColor: Colors.wosmongton[500],
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  keyboard: {
    width: "100%",
    height: 20,
    backgroundColor: Colors.osmoverse[700],
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  pizza: {
    position: "absolute",
    width: 40,
    height: 40,
    backgroundColor: Colors.wosmongton[300],
    borderRadius: 20,
    bottom: 20,
    right: 20,
    transform: [{ rotate: "45deg" }],
  },
  instructions: {
    fontSize: 16,
    color: Colors.osmoverse[100],
    textAlign: "center",
    marginTop: 32,
    marginBottom: 24,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 32,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: Colors.osmoverse[800],
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "white",
  },
  buttonContainer: {
    width: "100%",
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
