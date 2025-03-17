import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { mmkvStorage } from "~/utils/mmkv";

interface SettingsState {
  showUnverifiedAssets: boolean;
  setShowUnverifiedAssets: (show: boolean) => void;

  // Face ID settings
  biometricForAppAccess: boolean;
  biometricForTransactions: boolean;
  setBiometricForAppAccess: (enabled: boolean) => void;
  setBiometricForTransactions: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      showUnverifiedAssets: false,
      setShowUnverifiedAssets: (show) => set({ showUnverifiedAssets: show }),

      // Biometric settings
      biometricForAppAccess: false,
      biometricForTransactions: false,
      setBiometricForAppAccess: (enabled) =>
        set({ biometricForAppAccess: enabled }),
      setBiometricForTransactions: (enabled) =>
        set({ biometricForTransactions: enabled }),
    }),
    {
      name: "settings-store",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
