export type WalletKey = "metamask" | "walletconnect";

export type WalletDisplay = {
  iconUrl: string;
  displayName: string;
  caption?: string;
};

/** Generalized non-Keplr wallet client. */
export type Client<TTxSend = unknown> = {
  key: WalletKey;
  accountAddress?: string;
  /** Human readable chain, falls back to hex ID (`0x...`) if unknown. */
  chain?: string;
  isConnected: boolean;
  displayInfo: WalletDisplay;
  enable: () => Promise<void>;
  disable: () => void;
  send: (send: TTxSend) => Promise<unknown>;
};
