export class NoRouteError extends Error {
  static readonly defaultMessage = "No route found";
  constructor(string?: string) {
    super(NoRouteError.defaultMessage + (string ? ": " + string : ""));
    Object.setPrototypeOf(this, NoRouteError.prototype);
  }
}

export class NotEnoughLiquidityError extends Error {
  static readonly defaultMessage = "Not enough liquidity";
  constructor(string?: string) {
    super(
      NotEnoughLiquidityError.defaultMessage + (string ? ": " + string : "")
    );
    Object.setPrototypeOf(this, NotEnoughLiquidityError.prototype);
  }
}

export class NotEnoughQuotedError extends Error {
  static readonly defaultMessage = "Not enough quoted. Try increasing amount.";
  constructor(string?: string) {
    super(NotEnoughQuotedError.defaultMessage + (string ? ": " + string : ""));
    Object.setPrototypeOf(this, NotEnoughQuotedError.prototype);
  }
}
