import * as Sentry from "@sentry/nextjs";

export function captureError(e: any) {
  if (e instanceof Error) {
    Sentry.captureException(e);
    if (process.env.NODE_ENV === "development") console.warn("Captured:", e);
  } else if (process.env.NODE_ENV === "development") {
    console.warn("Did not capture non-Error:", e);
  }
}
