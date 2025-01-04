import { BlurView } from "expo-blur";
import React from "react";
import { Dimensions, Image, Modal, StyleSheet, View } from "react-native";

import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";

type ConnectionProgressState =
  | "connecting"
  | "failed"
  | "success"
  | "verifying"
  | "input-code";

interface ConnectionProgressModalProps {
  state: ConnectionProgressState;
  verificationCode?: string;
  onRetry?: () => void;
  onClose?: () => void;
}

export const ConnectionProgressModal = ({
  state,
  verificationCode,
  onRetry,
  onClose,
}: ConnectionProgressModalProps) => {
  const renderContent = () => {
    switch (state) {
      case "verifying":
      case "connecting":
        return (
          <>
            <Image
              source={require("~/assets/images/connecting-onboarding.png")}
              style={styles.connectingImage}
            />
            <View style={styles.textContainer}>
              <Text style={styles.title}>Connecting</Text>
              <Text style={styles.subtitle}>
                {state === "verifying"
                  ? "Sit tight, we're setting up your mobile wallet..."
                  : "Connecting to Osmosis Web..."}
              </Text>
            </View>
            {onClose && (
              <Button
                title="Cancel"
                onPress={onClose}
                variant="secondary"
                buttonStyle={styles.button}
                loading
              />
            )}
          </>
        );
      case "failed":
        return (
          <>
            <Image
              source={require("~/assets/images/error-onboarding.png")}
              style={styles.errorImage}
            />
            <View style={styles.textContainer}>
              <Text style={styles.title}>Connection Failed</Text>
              <Text style={styles.subtitle}>
                Something went wrong during the connection, please try again
              </Text>
            </View>
            {onRetry && (
              <Button
                title="Try Again"
                onPress={onRetry}
                variant="primary"
                buttonStyle={styles.button}
              />
            )}
          </>
        );
      case "success":
        return (
          <>
            <Image
              source={require("~/assets/images/success-onboarding.png")}
              style={styles.successImage}
            />
            <View style={styles.textContainer}>
              <Text style={styles.title}>Pairing Successful</Text>
              <Text style={styles.subtitle}>
                Your mobile wallet is now connected
              </Text>
            </View>
            {onClose && (
              <Button
                title="Continue"
                onPress={onClose}
                variant="primary"
                buttonStyle={styles.button}
              />
            )}
          </>
        );
      case "input-code":
        return (
          <>
            <Text style={styles.icon}>👀</Text>
            <View style={styles.codeContainer}>
              {verificationCode?.split("").map((char, index) => (
                <React.Fragment key={index}>
                  {index === 3 && (
                    <Text style={styles.verificationCode}>-</Text>
                  )}
                  <View key={index} style={styles.codeCharContainer}>
                    <Text style={styles.verificationCode}>{char}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.subtitle}>Input the code on Osmosis web</Text>
            </View>
          </>
        );
    }
  };

  return (
    <Modal visible animationType="fade" transparent>
      <BlurView intensity={80} style={styles.container}>
        <View style={styles.content}>{renderContent()}</View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: Colors.osmoverse[900],
    borderColor: Colors.osmoverse[700],
    borderWidth: 1,
    borderRadius: 40,
    padding: 24,
    width: Dimensions.get("window").width - 24,
    alignItems: "center",
    gap: 32,
    minHeight: 400,
    justifyContent: "center",
  },
  icon: {
    fontSize: 60,
    lineHeight: 60,
  },
  failedIcon: {
    backgroundColor: Colors.rust[500],
  },
  codeIcon: {
    backgroundColor: Colors.wosmongton[500],
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.white.full,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.osmoverse[300],
    textAlign: "center",
  },
  verificationCode: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: "600",
    color: Colors.white.full,
  },
  button: {
    width: "100%",
  },
  connectingImage: {
    width: 238,
    height: 169.33,
    resizeMode: "contain",
    paddingHorizontal: 7,
  },
  successImage: {
    width: 238,
    height: 169.33,
    resizeMode: "contain",
    paddingHorizontal: 7,
  },
  errorImage: {
    width: 238,
    height: 169.33,
    resizeMode: "contain",
    paddingHorizontal: 7,
  },
  textContainer: {
    gap: 8,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  codeCharContainer: {
    backgroundColor: Colors.osmoverse[700],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
});
