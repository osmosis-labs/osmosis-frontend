import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName: "vercel-datadog",
    instrumentationConfig: {
      fetch: {
        propagateContextUrls: [".*"],
      },
    },
  });
}
