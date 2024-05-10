/** Plugin to fetch status of many transactions from a remote source. */
export interface TransferStatusProvider {
  /** Example: axelar */
  readonly keyPrefix: string;
  readonly sourceDisplayName?: string;
  /** Destination for updates to tracked transactions.  */
  statusReceiverDelegate?: TransferStatusReceiver;

  /**
   * Source instance should begin tracking a transaction identified by `key`.
   * @param key Example: Tx hash without prefix i.e. `0x...`
   */
  trackTxStatus(key: string): void;

  /** Make url to this tx explorer. */
  makeExplorerUrl(key: string): string;
}

export interface TransferStatusReceiver {
  /** Key with prefix (`keyPrefix`) included. */
  receiveNewTxStatus(
    prefixedKey: string,
    status: TransferStatus,
    displayReason?: string
  ): void;
}

/** A simplified transfer status. */
export type TransferStatus = "success" | "pending" | "failed";

/** A simplified reason for transfer failure. */
export type TransferFailureReason = "insufficientFee";
