import { AvailableOneClickTradingMessages } from "@osmosis-labs/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { keyringMMKVStorage } from "~/utils/mmkv";

const version = 1;

interface BasekeyInfo {
  name: string;
  address: string;
  version: number;
}

interface ViewOnlyKeyInfo extends BasekeyInfo {
  type: "view-only";
}

interface SmartAccountKeyInfo extends BasekeyInfo {
  type: "smart-account";
  privateKey: string;
  allowedMessages: AvailableOneClickTradingMessages[];
  accountOwnerPublicKey: string;
  authenticatorId: string;
}

export type KeyInfo = ViewOnlyKeyInfo | SmartAccountKeyInfo;

export interface WalletKeyring {
  keys: KeyInfo[];
  addKey: (keyInfo: KeyInfo) => Promise<void>;
  deleteKey: (index: number) => Promise<void>;
  changeOrder: (addressesInOrder: string[]) => Promise<void>;
  getKey: (address: string) => KeyInfo | undefined;
}

export const useKeyringStore = create<WalletKeyring>()(
  persist(
    (set, get) => ({
      keys: [],

      addKey: async (keyInfo: Omit<KeyInfo, "version">) => {
        console.log("addKey", keyInfo);
        set((state) => ({
          keys: [...state.keys, { ...keyInfo, version } as KeyInfo],
        }));
      },

      deleteKey: async (index: number) => {
        set((state) => ({
          keys: state.keys.filter((_, i) => i !== index),
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
