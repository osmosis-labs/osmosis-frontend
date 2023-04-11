export class NotEnoughLiquidityError extends Error {
  constructor() {
    super("Not enough liquidity");
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NotEnoughLiquidityError.prototype);
  }
}

export class NoRouteError extends Error {
  constructor() {
    super("No route found");
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NoRouteError.prototype);
  }
}
