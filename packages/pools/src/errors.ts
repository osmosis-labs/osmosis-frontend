export class NoPoolsError extends Error {
  constructor() {
    super("There are no pools to proceed");
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NoPoolsError.prototype);
  }
}

export class NotEnoughLiquidityError extends Error {
  constructor() {
    super("Not enough liquidity");
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NotEnoughLiquidityError.prototype);
  }
}
