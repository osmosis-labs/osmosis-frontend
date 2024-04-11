// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://02eef43c9ee248d8b64d967cc908818a@o219003.ingest.us.sentry.io/1362463",

  environment:
    process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.01,

  /**
   * Disable server-side (Node.js serverless) tracing since we are only interested
   * in tracing swap transactions, specifically including bridge transfer transactions.
   */
  enabled: false,
  // enabled:
  //   process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test",

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  tracePropagationTargets: [process.env.NEXT_PUBLIC_SIDECAR_BASE_URL].filter(
    (val): val is NonNullable<typeof val> => !!val
  ),
});
