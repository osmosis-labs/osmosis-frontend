import * as Sentry from "@sentry/nextjs";

export function captureErrorAndReturn<TReturn>(e: Error, returnValue: TReturn) {
  if (process.env.NODE_ENV === "development") console.warn("Captured:", e);
  Sentry.captureException(e);
  return returnValue;
}
