// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
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
    const validTrpcRoutes = getValidSwapTRPCRoutesForSentry();

    // Log 10% of transactions of pools, root page and trpc methods related to swap
    if (validTrpcRoutes.includes(samplingContext.transactionContext.name)) {
      return 0.1;
    }

    // Log 1% of all other transactions
    return 0.01;
  },

  enabled:
    process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test",

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  /**
   * Propagate traces to the sidecar in order to setup distributed tracing.
   */
  tracePropagationTargets: [process.env.NEXT_PUBLIC_SIDECAR_BASE_URL].filter(
    (val): val is NonNullable<typeof val> => !!val
  ),
});
