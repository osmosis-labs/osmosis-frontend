export class NegativeSwapFeeError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NegativeSwapFeeError.prototype);
  }
}

export class HighSwapFeeError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, HighSwapFeeError.prototype);
  }
}

export class InvalidSwapFeeError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidSwapFeeError.prototype);
  }
}

export class InvalidScalingFactorControllerAddress extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(
      this,
      InvalidScalingFactorControllerAddress.prototype
    );
  }
}

export class MinAssetsCountError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MinAssetsCountError.prototype);
  }
}

export class MaxAssetsCountError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MaxAssetsCountError.prototype);
  }
}

export class NegativePercentageError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NegativePercentageError.prototype);
  }
}

export class ScalingFactorTooLowError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ScalingFactorTooLowError.prototype);
  }
}

export class PercentageSumError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, PercentageSumError.prototype);
  }
}

export class DepositNoBalanceError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, DepositNoBalanceError.prototype);
  }
}

export class NegativeSlippageError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NegativeSlippageError.prototype);
  }
}

export class InvalidSlippageError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidSlippageError.prototype);
  }
}

export class NoSendCurrencyError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NoSendCurrencyError.prototype);
  }
}

export class InsufficientBalanceError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InsufficientBalanceError.prototype);
  }
}

export * from "./manage-liquidity/errors";
