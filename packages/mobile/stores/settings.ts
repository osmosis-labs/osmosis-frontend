import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { mmkvStorage } from "~/utils/mmkv";

interface SettingsState {
  showUnverifiedAssets: boolean;
  setShowUnverifiedAssets: (show: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      showUnverifiedAssets: false,
      setShowUnverifiedAssets: (show) => set({ showUnverifiedAssets: show }),
    }),
    {
      name: "settings-store",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
