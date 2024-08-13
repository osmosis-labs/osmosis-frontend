import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName:
      process.env.NEXT_PUBLIC_VERCEL_URL ??
      "fallback-osmosis-frontend-service-name",
    instrumentationConfig: {
      fetch: {
        propagateContextUrls: ["*"],
      },
    },
  });
}
