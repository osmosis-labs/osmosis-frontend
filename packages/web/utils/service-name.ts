export function getOpentelemetryServiceName() {
  const isDev =
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?.includes("dev");

  const branchUrl = process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL;
  const urlParts = branchUrl?.split("-");

  // Find the index of 'git' and check if the next part is 'stage'
  const gitIndex = urlParts?.indexOf("git");
  const isStage =
    gitIndex !== undefined &&
    gitIndex !== -1 &&
    urlParts?.[gitIndex + 1] === "stage";

  if (isDev) {
    return "osmosis-frontend-dev";
  }

  return isStage
    ? "osmosis-frontend-stage" // If it does, return "stage"
    : `osmosis-frontend-${process.env.NEXT_PUBLIC_VERCEL_ENV}`; // Otherwise, return the Vercel environment (production, preview, or development);
}
