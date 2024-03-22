import * as Sentry from "@sentry/core";

export function captureErrorAndReturn<TReturn>(e: Error, returnValue: TReturn) {
  captureError(e);
  return returnValue;
}

export function captureError(e: any) {
  if (e instanceof Error) {
    Sentry.captureException(e);
    if (process.env.NODE_ENV === "development") console.warn("Captured:", e);
  } else if (process.env.NODE_ENV === "development") {
    console.warn("Did not capture non-Error:", e);
  }
}

/** Captures an error from a throwable function and returns the value or `undefined` if it throws. */
export function captureIfError<TReturn>(throwableFn: () => TReturn) {
  try {
    return throwableFn();
  } catch (e) {
    captureError(e);
  }
}
