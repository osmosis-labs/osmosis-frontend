export class TickOverflowError extends Error {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, TickOverflowError.prototype);
  }
}
