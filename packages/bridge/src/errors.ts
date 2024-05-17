import { Errors } from "@osmosis-labs/utils";

export class BridgeQuoteError extends Errors {
  constructor(
    errors: Array<{
      errorType: string;
      message: string;
    }>
  ) {
    super(errors);
    this.name = "BridgeQuoteError";
  }
}

export class BridgeTransferStatusError extends Errors {
  constructor(
    errors: Array<{
      errorType: string;
      message: string;
    }>
  ) {
    super(errors);
    this.name = "BridgeTransferError";
  }
}

export enum BridgeError {
  UnexpectedError = "UnexpectedError",
  CreateApprovalTxError = "ApprovalTxError",
  CreateCosmosTxError = "CreateCosmosTxError",
  CreateEVMTxError = "CreateEVMTxError",
  NoQuotesError = "NoQuotesError",
  UnsupportedQuoteError = "UnsupportedQuoteError",
}
