import EventEmitter from "eventemitter3";
import { Alert } from "../components/alert";

export type WalletKey = "metamask" | "walletconnect";

export type WalletDisplay = {
  iconUrl: string;
  displayName: string;
};

export type GeneralTxEvent = "pending" | "confirmed" | "failed";

/** Generalized non-Keplr wallet & client. */
export interface Wallet<TTxSend = unknown, TSendingMsg = boolean> {
  readonly key: WalletKey;
  readonly accountAddress?: string;
  /** Human readable chain, falls back to hex ID (`0x...`) if unknown. */
  readonly chainId?: string;
  readonly isConnected: boolean;
  readonly displayInfo: WalletDisplay;
  enable: () => Promise<void>;
  disable: () => void;
  send: (send: TTxSend) => Promise<unknown>;
  /** Display various errors resulting from send function. */
  displayError?: (e: any) => string | Alert | undefined;
  readonly isSending: TSendingMsg;
  readonly txStatusEventEmitter?: EventEmitter<
    GeneralTxEvent,
    { txHash?: string }
  >;
  makeExplorerUrl?: (txHash: string) => string;
}
