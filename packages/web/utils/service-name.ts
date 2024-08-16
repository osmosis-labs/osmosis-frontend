export function getOpentelemetryServiceName(): string {
  // Check if the production URL contains "stage."
  return process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?.includes(
    "stage."
  )
    ? "osmosis-frontend-stage" // If it does, return "stage"
    : `osmosis-frontend-${process.env.NEXT_PUBLIC_VERCEL_ENV}` ?? // Otherwise, return the Vercel environment (production, preview, or development)
        "fallback-osmosis-frontend-service-name";
}
