export function getOpentelemetryServiceName(): string {
  return (
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ??
    "fallback-osmosis-frontend-service-name"
  );
}
