// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://c696452bb7ce4cc98150142ebea1c32f@o4505285755600896.ingest.sentry.io/4505285757698048",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  enabled: process.env.NODE_ENV !== "development",

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
