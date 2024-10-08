import { registerOTel } from "@vercel/otel";

import { getOpentelemetryServiceName } from "~/utils/service-name";

export function register() {
  const serviceName = getOpentelemetryServiceName();

  // Skip registering the service if it's a preview deployment
  if (serviceName.includes("preview")) {
    console.info("Skipping OTel registration for preview deployment");
    return;
  }

  registerOTel({
    serviceName,
    instrumentationConfig: {
      fetch: {
        propagateContextUrls: ["*"],
      },
    },
    attributes: {
      env: serviceName.includes("stage")
        ? "stage"
        : process.env.NEXT_PUBLIC_VERCEL_ENV,
    },
  });
}
