import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";

export function register() {
  const sdk = new NodeSDK({
    resource: new Resource({
      "service.name": "vercel",
    }),
    spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter()),
  });

  sdk.start();
}
