import { getAssetLists, hasMatchingMinimalDenom } from "~/utils";

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterAll(() => {
  // eslint-disable-next-line no-console
  (console.warn as jest.Mock).mockRestore();
});

describe("getAssetLists", () => {
  const originalIsFrontier = process.env.NEXT_PUBLIC_IS_FRONTIER;

  afterEach(() => {
    process.env.NEXT_PUBLIC_IS_FRONTIER = originalIsFrontier;
  });

  it("should return non-empty AssetLists", () => {
    const result = getAssetLists();
    for (const list of result) {
      expect(list.assets.length).toBeGreaterThan(0);
    }
  });

  it("should return only verified assets if not on frontier", () => {
    process.env.NEXT_PUBLIC_IS_FRONTIER = "false";

    const result = getAssetLists([
      { coinMinimalDenom: "uosmo", isVerified: true },
      { coinMinimalDenom: "uion", isVerified: false },
    ]);

    const allAssets = result.flatMap((list) => list.assets);
    expect(
      allAssets.filter((asset) => hasMatchingMinimalDenom(asset, "uion")).length
    ).toBe(0);

    expect(
      allAssets.filter((asset) => hasMatchingMinimalDenom(asset, "uosmo"))
        .length
    ).toBeGreaterThan(0);
  });

  it("should return all assets if on frontier", () => {
    process.env.NEXT_PUBLIC_IS_FRONTIER = "true";

    const result = getAssetLists([
      { coinMinimalDenom: "uosmo", isVerified: true },
      { coinMinimalDenom: "uion", isVerified: false },
    ]);

    const allAssets = result.flatMap((list) => list.assets);
    expect(
      allAssets.filter((asset) => hasMatchingMinimalDenom(asset, "uion")).length
    ).toBeGreaterThan(0);
    expect(
      allAssets.filter((asset) => hasMatchingMinimalDenom(asset, "uosmo"))
        .length
    ).toBeGreaterThan(0);
  });
});

describe("hasMatchingMinimalDenom", () => {
  it("should return a lists containing assets matching minimal denom in assetInfos", () => {
    process.env.NEXT_PUBLIC_IS_FRONTIER = "true";
    const sampleAssetInfos = [
      { coinMinimalDenom: "uosmo" },
      { coinMinimalDenom: "uion" },
    ];
    const result = getAssetLists(sampleAssetInfos);

    for (const list of result) {
      for (const asset of list.assets) {
        const matchingInfo = sampleAssetInfos.find((info) =>
          hasMatchingMinimalDenom(asset, info.coinMinimalDenom)
        );
        expect(matchingInfo).toBeDefined();
      }
    }
  });
});
