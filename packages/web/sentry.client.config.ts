// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

import { getValidSwapTRPCRoutesForSentry } from "~/utils/sentry-init";

Sentry.init({
  dsn: "https://02eef43c9ee248d8b64d967cc908818a@o219003.ingest.us.sentry.io/1362463",

  environment:
    process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development",

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

  tracePropagationTargets: [process.env.NEXT_PUBLIC_SIDECAR_BASE_URL].filter(
    (val): val is NonNullable<typeof val> => !!val
  ),
});
