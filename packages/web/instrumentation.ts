import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName: "vercel",
    instrumentationConfig: {
      fetch: {
        propagateContextUrls: ["/health", "/healthcheck", "/router/quote"],
      },
    },
  });
}
