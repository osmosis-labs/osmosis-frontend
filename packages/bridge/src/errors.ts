/** Includes a `BridgeError` & optionally the bridge ID in the message member. */
export class BridgeQuoteError extends Error {
  readonly errorType: BridgeError;

  constructor({
    bridgeId,
    errorType,
    message,
  }: {
    bridgeId?: string;
    errorType: BridgeError;
    message: string;
  }) {
    const id = bridgeId ? `(${bridgeId}) ` : "";
    super(`${id}${errorType}: ${message}`);
    this.errorType = errorType;
  }
}

export type BridgeError =
  | "ApprovalTxError"
  | "CreateCosmosTxError"
  | "CreateEVMTxError"
  | "NoQuotesError"
  | "UnsupportedQuoteError"
  | "InsufficientAmountError"
  | "AccountNotFoundError";
