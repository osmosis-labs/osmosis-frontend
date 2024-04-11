// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://c696452bb7ce4cc98150142ebea1c32f@o4505285755600896.ingest.us.sentry.io/4505285757698048",

  environment:
    process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.01,

  /**
   * Disable server-side (Node.js serverless) tracing since we are only interested
   * in tracing swap transactions. This sentry.server.ts only applies to bridge
   * transfer transactions.
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
