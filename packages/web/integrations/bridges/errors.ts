import { Errors } from "~/server/api/errors";

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
