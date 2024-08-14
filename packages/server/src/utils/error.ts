import { context, trace } from "@opentelemetry/api";

export function captureErrorAndReturn<TReturn>(e: Error, returnValue: TReturn) {
  captureError(e);
  return returnValue;
}

export function captureError(e: any) {
  const activeSpan = trace.getSpan(context.active());
  if (e instanceof Error) {
    if (activeSpan) {
      // Reuse the existing active span
      activeSpan.recordException(e);
    }
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
