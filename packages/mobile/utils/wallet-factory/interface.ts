import { KeyInfo } from "~/stores/keyring";

export interface WalletFactory {
  createWallet(params: { keyInfo: KeyInfo }): Promise<void>;
  deleteWallet(params: { index: number }): Promise<void>;
}
