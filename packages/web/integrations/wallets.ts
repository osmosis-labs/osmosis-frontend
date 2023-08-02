import EventEmitter, { ValidEventTypes } from "eventemitter3";

import { Alert } from "~/components/alert";

export type WalletKey = "metamask" | "walletconnect";

export type WalletDisplay = {
  iconUrl: string;
  displayName: string;
};

export type GeneralTxEvent = "pending" | "confirmed" | "failed";

/** Generalized non-Keplr wallet & client, made observable by MobX. */
export interface ObservableWallet<
  TTxSend = unknown,
  TSendingMsg = unknown,
  TTxEvents extends ValidEventTypes = GeneralTxEvent
> {
  readonly key: WalletKey;
  readonly displayInfo: WalletDisplay;

  /** Works on mobile browsers. */
  readonly mobileEnabled: boolean;

  readonly accountAddress?: string;
  /** Human readable chain, falls back to hex ID (`0x...`) if unknown. */
  readonly chainId?: string;
  /** User has approved a link to the wallet, and transactions can be sent. */
  readonly isConnected: boolean;
  readonly isSending: TSendingMsg;
  readonly isInstalled: boolean;

  /** Request connection to wallet. */
  enable: () => Promise<void>;
  /** Disable the connection on our end. Does not guarauntee disconnection from wallet perspective. */
  disable: () => void;

  /** Send request to chain. Could be a query or state-changing transaction. */
  send: (send: TTxSend) => Promise<unknown>;
  /** Display various errors resulting from send or enable function. */
  displayError?: (e: any) => string | Alert | undefined;

  readonly txStatusEventEmitter?: EventEmitter<TTxEvents, { txHash?: string }>;

  makeExplorerUrl?: (txHash: string) => string;

  // onboard user to wallet

  onboard?: () => void;
  cancelOnboarding?: () => void;
}
