import { KeyInfo, useKeyringStore } from "~/stores/keyring";

import { WalletFactory } from "../interface";

export const cosmosSmartAccountWalletFactory: WalletFactory = {
  async createWallet({
    keyInfo,
  }: {
    keyInfo: Extract<KeyInfo, { type: "smart-account" }>;
  }): Promise<void> {
    return useKeyringStore.getState().addKey(keyInfo);
  },
  async deleteWallet({ index }: { index: number }): Promise<void> {
    return useKeyringStore.getState().deleteKey(index);
  },
};
