import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName: "vercel-datadog",
    instrumentationConfig: {
      fetch: {
        propagateContextUrls: [/^https:\/\/sqs\d+/],
        dontPropagateContextUrls: [/no-propagation\=1/],
        attributesFromRequestHeaders: {
          "request.cmd": "X-Cmd",
        },
        attributesFromResponseHeaders: {
          "response.server": "X-Server",
        },
      },
    },
    attributesFromHeaders: {
      client: "X-Client",
    },
  });
}
