import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { mmkvStorage } from "~/utils/mmkv";

interface WalletState {
  currentSelectedWalletIndex?: number;
  setCurrentSelectedWalletIndex: (index: number | undefined) => void;
}

export const useCurrentWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      currentSelectedWalletIndex: undefined,
      setCurrentSelectedWalletIndex: (index) =>
        set({ currentSelectedWalletIndex: index }),
    }),
    {
      name: "wallet-store",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
