import * as LocalAuthentication from "expo-local-authentication";
import { useCallback, useEffect, useState } from "react";

import { useSettingsStore } from "~/stores/settings";

type AuthenticationType = "app-access" | "transaction";

export const useFaceId = () => {
  const [isFaceIdAvailable, setIsFaceIdAvailable] = useState(false);
  const { faceIdForAppAccess, faceIdForTransactions } = useSettingsStore();

  useEffect(() => {
    const checkBiometricAvailability = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsFaceIdAvailable(hasHardware && isEnrolled);
    };

    checkBiometricAvailability();
  }, []);

  const authenticate = useCallback(
    async (type: AuthenticationType = "app-access") => {
      if (!isFaceIdAvailable) {
        return true;
      }

      // Check if the specific type of Face ID is enabled
      const isTypeEnabled =
        type === "app-access" ? faceIdForAppAccess : faceIdForTransactions;

      if (!isTypeEnabled) {
        return true;
      }

      try {
        const promptMessage = type
          ? type === "app-access"
            ? "Authenticate to access the app"
            : "Authenticate to confirm transaction"
          : "Authenticate";

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage,
          fallbackLabel: "Use passcode",
          disableDeviceFallback: false, // Allow fallback to device passcode
        });

        return result.success;
      } catch (error) {
        console.error(`Face ID authentication error (${type}):`, error);
        return false;
      }
    },
    [faceIdForAppAccess, faceIdForTransactions, isFaceIdAvailable]
  );

  return {
    isFaceIdAvailable,
    authenticate,
    authenticateAppAccess: useCallback(
      () => authenticate("app-access"),
      [authenticate]
    ),
    authenticateTransaction: useCallback(
      () => authenticate("transaction"),
      [authenticate]
    ),
  };
};
