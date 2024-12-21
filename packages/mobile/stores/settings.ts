import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { mmkvStorage } from "~/utils/mmkv";

interface SettingsState {
  showUnverifiedAssets: boolean;
  setShowUnverifiedAssets: (show: boolean) => void;

  // Face ID settings
  faceIdForAppAccess: boolean;
  faceIdForTransactions: boolean;
  setFaceIdForAppAccess: (enabled: boolean) => void;
  setFaceIdForTransactions: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      showUnverifiedAssets: false,
      setShowUnverifiedAssets: (show) => set({ showUnverifiedAssets: show }),

      // Face ID settings
      faceIdForAppAccess: false,
      faceIdForTransactions: false,
      setFaceIdForAppAccess: (enabled) => set({ faceIdForAppAccess: enabled }),
      setFaceIdForTransactions: (enabled) =>
        set({ faceIdForTransactions: enabled }),
    }),
    {
      name: "settings-store",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
