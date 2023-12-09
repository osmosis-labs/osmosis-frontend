export class NoRouteError extends Error {
  static readonly defaultMessage = "No route found";
  constructor(string?: string) {
    super(NoRouteError.defaultMessage + (string ? ": " + string : ""));
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NoRouteError.prototype);
  }
}
