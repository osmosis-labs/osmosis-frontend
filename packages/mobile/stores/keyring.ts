import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { keyringMMKVStorage } from "~/utils/mmkv";

export interface KeyInfo {
  type: "view-only" | "smart-account" | "wallet-connect";
  name: string;
  address: string;
  privateKey?: string;
}

export interface WalletKeyring {
  keys: KeyInfo[];
  addKey: (keyInfo: KeyInfo) => Promise<void>;
  deleteKey: (address: string) => Promise<void>;
  changeOrder: (addressesInOrder: string[]) => Promise<void>;
  getKey: (address: string) => KeyInfo | undefined;
}

export const useKeyringStore = create<WalletKeyring>()(
  persist(
    (set, get) => ({
      keys: [],

      addKey: async (keyInfo: KeyInfo) => {
        set((state) => ({
          keys: [...state.keys, keyInfo],
        }));
      },

      deleteKey: async (address: string) => {
        set((state) => ({
          keys: state.keys.filter((key) => key.address !== address),
        }));
      },

      changeOrder: async (addressesInOrder: string[]) => {
        const currentKeys = get().keys;
        const orderedKeys = addressesInOrder
          .map((address) => currentKeys.find((key) => key.address === address))
          .filter((key): key is KeyInfo => key !== undefined);

        set({ keys: orderedKeys });
      },

      getKey: (address: string) => {
        return get().keys.find((key) => key.address === address);
      },
    }),
    {
      name: "keyring-store",
      storage: createJSONStorage(() => keyringMMKVStorage),
    }
  )
);
