export function getOpentelemetryServiceName(): string {
  const url = process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL;
  const urlParts = url?.split("-");

  // Find the index of 'git' and check if the next part is 'stage'
  const gitIndex = urlParts?.indexOf("git");
  const isStage =
    gitIndex !== undefined &&
    gitIndex !== -1 &&
    urlParts?.[gitIndex + 1] === "stage";

  // Check if the production URL contains "stage."
  return isStage
    ? "osmosis-frontend-stage" // If it does, return "stage"
    : `osmosis-frontend-${process.env.NEXT_PUBLIC_VERCEL_ENV}` ?? // Otherwise, return the Vercel environment (production, preview, or development)
        "fallback-osmosis-frontend-service-name";
}
