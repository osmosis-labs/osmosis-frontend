import {
  SentryPropagator,
  SentrySpanProcessor,
} from "@sentry/opentelemetry-node";
import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName: "osmosis-frontend",
    propagators: [new SentryPropagator()],
    spanProcessors: [new SentrySpanProcessor()],
  });
}
