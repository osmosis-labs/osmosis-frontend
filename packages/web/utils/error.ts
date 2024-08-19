import { context, trace } from "@opentelemetry/api";

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
