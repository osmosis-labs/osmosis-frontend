export class NotEnoughLiquidityError extends Error {
  constructor(string?: string) {
    super(string ?? "Not enough liquidity");
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NotEnoughLiquidityError.prototype);
  }
}

export class NotEnoughQuotedError extends Error {
  constructor(string?: string) {
    const defaultMessage = "Not enough quoted. Try increasing amount.";
    super(string ? defaultMessage + " " + string : defaultMessage);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NotEnoughQuotedError.prototype);
  }
}
