import {
  authenticateAsync,
  AuthenticationType,
  hasHardwareAsync,
  isEnrolledAsync,
  LocalAuthenticationOptions,
  supportedAuthenticationTypesAsync,
} from "expo-local-authentication";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { create } from "zustand";

export enum BiometricAuthenticationStatus {
  Unsupported = "Unsupported",
  MissingEnrollment = "Missing Enrollment",
  Rejected = "Rejected",
  Authenticated = "Authenticated",
  Canceled = "Canceled",
  Authenticating = "Authenticating",
  Lockout = "Lockout",
  UserCancel = "User Cancel",
  SystemCancel = "System Cancel",
}

export async function tryLocalAuthenticate(
  authenticateOptions?: LocalAuthenticationOptions
): Promise<BiometricAuthenticationStatus> {
  try {
    const compatible = await hasHardwareAsync();

    if (!compatible) {
      return BiometricAuthenticationStatus.Unsupported;
    }

    const enrolled = await isEnrolledAsync();
    const result = await authenticateAsync({
      promptMessage: "Please authenticate",
      // Temporary disabled due to the android AppState forground -> background triggers of biometrics popup with pin fallback
      disableDeviceFallback: Platform.OS === "android" ? true : false,
      cancelLabel: "Cancel",
      ...authenticateOptions,
    });

    if (result.success === false && result.error === "lockout") {
      return BiometricAuthenticationStatus.Lockout;
    }

    if (result.success === false && result.error === "user_cancel") {
      return BiometricAuthenticationStatus.UserCancel;
    }

    if (result.success === false && result.error === "system_cancel") {
      return BiometricAuthenticationStatus.SystemCancel;
    }

    if (!enrolled) {
      return BiometricAuthenticationStatus.MissingEnrollment;
    }

    if (result.success === false) {
      return BiometricAuthenticationStatus.Rejected;
    }

    return BiometricAuthenticationStatus.Authenticated;
  } catch (error) {
    console.error(error);
    return BiometricAuthenticationStatus.Rejected;
  }
}

type AuthenticationState = {
  authenticationStatus: BiometricAuthenticationStatus | undefined;
  setAuthenticationStatus: (
    status: BiometricAuthenticationStatus | undefined
  ) => void;
};

export const useAuthenticationStore = create<AuthenticationState>((set) => ({
  authenticationStatus: undefined,
  setAuthenticationStatus: (
    status: BiometricAuthenticationStatus | undefined
  ) => set({ authenticationStatus: status }),
}));

export const useBiometricPrompt = ({
  onSuccess,
  onFailure,
}: {
  onSuccess?: () => void;
  onFailure?: () => void;
} = {}) => {
  const setAuthenticationStatus = useAuthenticationStore(
    (state) => state.setAuthenticationStatus
  );

  const authenticate = useCallback(
    async ({
      authOptions,
    }: {
      authOptions?: LocalAuthenticationOptions;
    } = {}) => {
      setAuthenticationStatus(BiometricAuthenticationStatus.Authenticating);
      const authStatus = await tryLocalAuthenticate(authOptions);

      setAuthenticationStatus(authStatus);

      if (
        authStatus === BiometricAuthenticationStatus.Authenticated ||
        authStatus === BiometricAuthenticationStatus.Unsupported ||
        authStatus === BiometricAuthenticationStatus.MissingEnrollment
      ) {
        onSuccess?.();
      } else {
        onFailure?.();
      }
    },
    [onFailure, setAuthenticationStatus, onSuccess]
  );

  return {
    authenticate,
  };
};

export function useOsBiometricAuthEnabled() {
  const [isCheckingBiometricAvailability, setIsCheckingBiometricAvailability] =
    useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  useEffect(() => {
    const checkBiometricAvailability = async () => {
      setIsCheckingBiometricAvailability(true);
      const [hasHardware, isEnrolled] = await Promise.all([
        hasHardwareAsync(),
        isEnrolledAsync(),
      ]);
      setIsBiometricEnabled(hasHardware && isEnrolled);
      setIsCheckingBiometricAvailability(false);
    };

    checkBiometricAvailability();
  }, []);

  return { isBiometricEnabled, isCheckingBiometricAvailability };
}

export function useDeviceSupportsBiometricAuth(): {
  touchId: boolean;
  faceId: boolean;
  isCheckingBiometricAvailability: boolean;
} {
  const [isCheckingBiometricAvailability, setIsCheckingBiometricAvailability] =
    useState(true);
  const [authenticationTypes, setAuthenticationTypes] = useState<
    AuthenticationType[]
  >([]);

  useEffect(() => {
    const getAuthTypes = async () => {
      try {
        const types = await supportedAuthenticationTypesAsync();
        setAuthenticationTypes(types);
      } catch (error) {
        console.error("Error getting authentication types:", error);
        setAuthenticationTypes([]);
      } finally {
        setIsCheckingBiometricAvailability(false);
      }
    };
    getAuthTypes();
  }, []);

  return {
    isCheckingBiometricAvailability,
    touchId:
      authenticationTypes?.includes(AuthenticationType.FINGERPRINT) ?? false,
    faceId:
      authenticationTypes?.includes(AuthenticationType.FACIAL_RECOGNITION) ??
      false,
  };
}
