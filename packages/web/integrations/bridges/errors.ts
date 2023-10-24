export class BridgeQuoteError extends Error {
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
    this.name = "BridgeQuoteError";
  }
}

export class BridgeTransferStatusError extends Error {
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
    this.name = "BridgeTransferError";
  }
}
