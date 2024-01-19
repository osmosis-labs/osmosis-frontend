import { BasePool } from "./interface";

export class NotEnoughLiquidityError extends Error {
  static readonly defaultMessage = "Not enough liquidity";
  constructor(string?: string) {
    super(
      NotEnoughLiquidityError.defaultMessage + (string ? ": " + string : "")
    );
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NotEnoughLiquidityError.prototype);
  }
}

export class NotEnoughQuotedError extends Error {
  static readonly defaultMessage = "Not enough quoted. Try increasing amount.";
  constructor(string?: string) {
    super(NotEnoughQuotedError.defaultMessage + (string ? ": " + string : ""));
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NotEnoughQuotedError.prototype);
  }
}

/** Validates denoms in any base pool. */
export function validateDenoms(
  basePool: BasePool,
  ...tokenDenoms: string[]
): void {
  const uniqueSet = new Set(tokenDenoms);
  if (uniqueSet.size !== tokenDenoms.length) {
    throw new Error(`Duplicate denoms`);
  }

  if (!tokenDenoms.every((denom) => basePool.hasPoolAsset(denom))) {
    throw new Error(
      `Pool ${basePool.id} doesn't have the pool asset for ${tokenDenoms.join(
        ", "
      )}`
    );
  }
}
