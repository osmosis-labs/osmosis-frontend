export class NoRouteError extends Error {
  constructor(string?: string) {
    super(string ?? "No route found");
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NoRouteError.prototype);
  }
}
