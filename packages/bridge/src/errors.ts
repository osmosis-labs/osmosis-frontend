/** Includes a `BridgeError` in the message member. */
export class BridgeQuoteError extends Error {
  readonly errorType: BridgeError;

  constructor({
    errorType,
    message,
  }: {
    errorType: BridgeError;
    message: string;
  }) {
    super(`${errorType}: ${message}`);
    this.errorType = errorType;
  }
}

export type BridgeError =
  | "UnexpectedError"
  | "ApprovalTxError"
  | "CreateCosmosTxError"
  | "CreateEVMTxError"
  | "NoQuotesError"
  | "UnsupportedQuoteError"
  | "InsufficientAmountError";
