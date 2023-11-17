import { BasePool } from "./interface";

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
