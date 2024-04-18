// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

import { getValidSwapTRPCRoutesForSentry } from "~/utils/sentry-init";

Sentry.init({
  dsn: "https://c696452bb7ce4cc98150142ebea1c32f@o4505285755600896.ingest.us.sentry.io/4505285757698048",

  environment:
    process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development",

  // Only send 25% of error events to Sentry
  sampleRate: 0.25,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampler: (samplingContext) => {
    const validPaths = ["/", "/pool/[id]", "/assets/[denom]"];
    const validTrpcRoutes = getValidSwapTRPCRoutesForSentry();

    // Log 10% of transactions related to swap
    if (
      validPaths.includes(samplingContext.transactionContext.name) ||
      validTrpcRoutes.includes(samplingContext.transactionContext.name)
    ) {
      return 0.1;
    }

    // Log 1% of all other transactions
    return 0.01;
  },

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Temporarily disable due to client-side noise coming from extensions, Cosmos Kit, etc.
  enabled:
    process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test",

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  /**
   * Propagate traces to the sidecar in order to setup distributed tracing.
   */
  tracePropagationTargets: [process.env.NEXT_PUBLIC_SIDECAR_BASE_URL].filter(
    (val): val is NonNullable<typeof val> => !!val
  ),
});
