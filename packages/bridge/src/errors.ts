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

/**
 * Message carried by the error thrown when a persisted multi-tx route is no
 * longer accepted by its provider (e.g. an embedded fee quote expired and
 * couldn't be dropped or refreshed). UI layers match on it to show specific
 * recovery copy instead of a generic failure.
 */
export const BridgeRouteExpiredMessage = "saved multi-tx route has expired";

/**
 * Message carried by the error thrown when an intermediate step's network
 * fee cannot fit the funds available to pay it (the route's reserved fee
 * amount plus anything the account already holds), even at the chain's
 * minimum gas price. UI layers match on it to tell the user to top up the
 * fee token on the intermediate chain instead of showing a generic failure.
 */
export const BridgeFeeExceedsBudgetMessage =
  "step fee exceeds the funds available to pay it";

export type BridgeError =
  | "ApprovalTxError"
  | "CreateCosmosTxError"
  | "CreateEVMTxError"
  | "NoQuotesError"
  | "UnsupportedQuoteError"
  | "InsufficientAmountError"
  | "AccountNotFoundError";
