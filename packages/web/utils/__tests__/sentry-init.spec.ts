import { getValidSwapTRPCRoutesForSentry } from "../sentry-init";

describe("getValidTRPCSentryRoutes", () => {
  it("should correctly transform TRPC route keys to Sentry route format", () => {
    const result = getValidSwapTRPCRoutesForSentry();
    expect(result).toMatchInlineSnapshot(`
      [
        "trpc/local.quoteRouter.routeTokenOutGivenIn",
        "trpc/assets.getAssetPrice",
        "trpc/assets.getUserAsset",
        "trpc/assets.getUserAssets",
        "trpc/assets.getAssetHistoricalPrice",
        "trpc/assets.getAssetWithPrice",
      ]
    `);
  });
});
