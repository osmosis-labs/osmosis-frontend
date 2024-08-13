import { registerOTel } from "@vercel/otel";

export function register() {
  console.log(
    "registering otel",
    process.env.NEXT_PUBLIC_VERCEL_URL ?? "osmosis-frontend"
  );
  registerOTel({
    serviceName: process.env.NEXT_PUBLIC_VERCEL_URL ?? "osmosis-frontend",
    instrumentationConfig: {
      fetch: {
        propagateContextUrls: ["*"],
      },
    },
  });
}
