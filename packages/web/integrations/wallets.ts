export type WalletKey = "metamask" | "walletconnect";

export type WalletDisplay = {
  iconUrl: string;
  displayName: string;
};

/** Generalized non-Keplr wallet client. */
export interface Client<TTxSend = unknown> {
  readonly key: WalletKey;
  readonly accountAddress?: string;
  /** Human readable chain, falls back to hex ID (`0x...`) if unknown. */
  readonly chainId?: string;
  readonly isConnected: boolean;
  readonly displayInfo: WalletDisplay;
  enable: () => Promise<void>;
  disable: () => void;
  send: (send: TTxSend) => Promise<unknown>;
  readonly isSending: boolean;
}
