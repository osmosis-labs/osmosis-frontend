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

export class ScalingFactorNotIntegerError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ScalingFactorNotIntegerError.prototype);
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

export class InsufficientBalanceForFeeError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InsufficientBalanceForFeeError.prototype);
  }
}

export class SwapRequiresError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, SwapRequiresError.prototype);
  }
}

export class NotInitializedError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NotInitializedError.prototype);
  }
}

export class CalculatingShareOutAmountError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, CalculatingShareOutAmountError.prototype);
  }
}

export class NoAvailableSharesError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NoAvailableSharesError.prototype);
  }
}

export class WalletConnectionInProgressError extends Error {
  constructor() {
    super("Wallet is already trying to connect");
    this.name = this.constructor.name;
  }
}

export class InsufficientFeeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientFeeError";
  }
}
export class AccountStoreNoBroadcastErrorEvent extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountStoreNoBroadcastErrorEvent";
  }
}
