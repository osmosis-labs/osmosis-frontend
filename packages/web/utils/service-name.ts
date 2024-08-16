export function getOpentelemetryServiceName(): string {
  return (
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    "fallback-osmosis-frontend-service-name"
  );
}
