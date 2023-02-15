/** Plugin to fetch status of many transactions from a remote source. */
export interface ITxStatusSource {
  /** Example: axelar */
  readonly keyPrefix: string;
  readonly sourceDisplayName?: string;
  /** Destination for updates to tracked transactions.  */
  statusReceiverDelegate?: ITxStatusReceiver;

  /**
   * Source instance should begin tracking a transaction identified by `key`.
   * @param key Example: Tx hash without prefix i.e. `0x...`
   */
  trackTxStatus(key: string): void;

  /** Make url to this tx explorer. */
  makeExplorerUrl(key: string): string;
}

export interface ITxStatusReceiver {
  /** Key with prefix (`keyPrefix`) included. */
  receiveNewTxStatus(
    prefixedKey: string,
    status: TxStatus,
    displayReason?: string
  ): void;
}

export type TxStatus = "success" | "pending" | "failed";
export type TxReason = "insufficientFee";
