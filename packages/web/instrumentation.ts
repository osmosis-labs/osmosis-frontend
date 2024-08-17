import { registerOTel } from "@vercel/otel";

import { getOpentelemetryServiceName } from "~/utils/service-name";

export function register() {
  registerOTel({
    serviceName: getOpentelemetryServiceName(),
    instrumentationConfig: {
      fetch: {
        propagateContextUrls: ["*"],
      },
    },
  });
}
