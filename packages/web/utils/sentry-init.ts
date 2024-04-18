import { RouterKeys } from "~/utils/trpc";

/** For now, filter non-swap related routes */
export function getValidSwapTRPCRoutesForSentry() {
  const validTrpcRoutes: RouterKeys[] = [
    "local.quoteRouter.routeTokenOutGivenIn",
    "edge.assets.getAssetPrice",
    "edge.assets.getUserAsset",
    "edge.assets.getUserAssets",
    "edge.assets.getAssetHistoricalPrice",
    "edge.assets.getAssetWithPrice",
  ];

  return validTrpcRoutes.map(
    (route) =>
      "trpc/" +
      (route.startsWith("edge")
        ? route.split(".").slice(1).join(".") // Remove the "edge" prefix from the route
        : route)
  );
}
