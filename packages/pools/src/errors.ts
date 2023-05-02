export class NotEnoughLiquidityError extends Error {
  constructor(string?: string) {
    super(string ?? "Not enough liquidity");
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NotEnoughLiquidityError.prototype);
  }
}
