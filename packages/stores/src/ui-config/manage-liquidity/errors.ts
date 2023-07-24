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

export class InvalidRangeError extends Error {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, InvalidRangeError.prototype);
  }
}
