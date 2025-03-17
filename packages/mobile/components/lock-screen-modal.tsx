import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  AppState,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import OsmosisIcon from "~/assets/images/splash-icon.png";
import { Colors } from "~/constants/theme-colors";
import {
  BiometricAuthenticationStatus,
  useAuthenticationStore,
  useBiometricPrompt,
} from "~/hooks/biometrics";
import { useWallets } from "~/hooks/use-wallets";
import { useSettingsStore } from "~/stores/settings";

export const LockScreenModal = () => {
  const biometricForAppAccess = useSettingsStore(
    (state) => state.biometricForAppAccess
  );
  const { currentWallet } = useWallets();

  const [showLockScreen, setShowLockScreen] = useState(
    biometricForAppAccess && currentWallet ? true : false
  );

  const { authenticate } = useBiometricPrompt({
    onSuccess: () => {
      setShowLockScreen(false);
    },
  });

  const triggerBiometricCheck = useCallback(async () => {
    if (biometricForAppAccess && currentWallet) {
      await authenticate();
    }
    // Run only on mount so it doesn't trigger a biometric check on setting change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (!biometricForAppAccess || !currentWallet) {
          return;
        }

        const { authenticationStatus } = useAuthenticationStore.getState();

        if (appState.current === "inactive" && nextAppState === "background") {
          if (biometricForAppAccess) {
            setShowLockScreen(true);
          }
        }

        if (appState.current === "active" && nextAppState === "inactive") {
          if (
            biometricForAppAccess &&
            authenticationStatus !==
              BiometricAuthenticationStatus.Authenticating
          ) {
            setShowLockScreen(true);
          }
        }

        if (appState.current === "active" && nextAppState === "background") {
          if (biometricForAppAccess) {
            setShowLockScreen(true);
          }
        }

        if (appState.current === "inactive" && nextAppState === "active") {
          if (
            biometricForAppAccess &&
            authenticationStatus !==
              BiometricAuthenticationStatus.Authenticating &&
            authenticationStatus !== BiometricAuthenticationStatus.Rejected &&
            authenticationStatus !== BiometricAuthenticationStatus.Lockout &&
            authenticationStatus !== BiometricAuthenticationStatus.UserCancel
          ) {
            setShowLockScreen(false);
          }
        }

        if (appState.current === "background" && nextAppState === "active") {
          if (biometricForAppAccess) {
            triggerBiometricCheck();
          }
        }

        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [biometricForAppAccess, triggerBiometricCheck, currentWallet]);

  useLayoutEffect(() => {
    if (currentWallet) {
      triggerBiometricCheck();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!showLockScreen || !currentWallet) {
    return null;
  }

  return (
    <Modal
      visible
      animationType="fade"
      pointerEvents="none"
      presentationStyle="fullScreen"
      transparent={false}
    >
      <Pressable onPress={triggerBiometricCheck}>
        <View style={styles.container}>
          {Platform.OS === "android" ? (
            <Image source={OsmosisIcon} style={styles.androidIcon} />
          ) : (
            <Image
              resizeMode="contain"
              source={OsmosisIcon}
              style={styles.iosIcon}
            />
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    pointerEvents: "none",
    alignItems: "center",
    justifyContent: "center",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    backgroundColor: Colors.background,
  },
  androidIcon: {
    width: 100,
    height: 100,
  },
  iosIcon: {
    width: 200,
    height: 200,
  },
});
