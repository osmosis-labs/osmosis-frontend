export class Errors extends Error {
  errors: Array<{
    errorType: string;
    message: string;
  }>;

  constructor(
    errors: Array<{
      errorType: string;
      message: string;
    }>
  ) {
    super();
    this.errors = errors;
    this.name = "Errors";
  }

  get message() {
    return this.errors.map((error) => error.message).join(", ");
  }
}

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
  InsufficientAmount = "InsufficientAmountError",
}
