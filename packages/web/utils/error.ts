import * as Sentry from "@sentry/nextjs";

export function captureErrorAndReturn<TReturn>(e: Error, returnValue: TReturn) {
  if (process.env.NODE_ENV === "development") console.warn("Captured:", e);
  Sentry.captureException(e);
  return returnValue;
}

export function captureError(e: any) {
  if (e instanceof Error) Sentry.captureException(e);
}

export function captureIfError<TReturn>(throwableFnOrValue: () => TReturn) {
  try {
    return throwableFnOrValue();
  } catch (e) {
    captureError(e);
  }
}
