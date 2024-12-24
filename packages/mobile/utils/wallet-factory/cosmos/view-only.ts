import { KeyInfo, useKeyringStore } from "~/stores/keyring";

import { WalletFactory } from "../interface";

export const cosmosViewOnlyWalletFactory: WalletFactory = {
  async createWallet(params: {
    keyInfo: Extract<KeyInfo, { type: "view-only" }>;
  }): Promise<void> {
    return useKeyringStore.getState().addKey(params.keyInfo);
  },
  async deleteWallet(params: { index: number }): Promise<void> {
    return useKeyringStore.getState().deleteKey(params.index);
  },
};
