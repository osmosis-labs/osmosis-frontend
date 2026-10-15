import {
  DEFAULT_VS_CURRENCY,
  getAsset,
  getAssetMarketActivity,
  getAssetPrice,
  mapGetAssetsWithUserBalances,
} from "@osmosis-labs/server";
import type { AssetList, MinimalAsset } from "@osmosis-labs/types";
import { CoinPretty, Dec, PricePretty } from "@osmosis-labs/unit";

import {
  createCallerFactory,
  createInnerTRPCContext,
  createTRPCRouter,
} from "..";
import { assetsRouter } from "../assets";

jest.mock("@osmosis-labs/server", () => ({
  ...jest.requireActual("@osmosis-labs/server"),
  getAsset: jest.fn(),
  getAssetMarketActivity: jest.fn(),
  getAssetPrice: jest.fn(),
  mapGetAssetsWithUserBalances: jest.fn(),
}));

const money = (n: number) => new PricePretty(DEFAULT_VS_CURRENCY, new Dec(n));
const assets = Array.from({ length: 800 }, (_, i) => {
  const asset: MinimalAsset = {
    coinDenom: `Token ${i}`,
    coinMinimalDenom: `asset-${i}`,
    coinDecimals: 6,
    isAlloyed: false,
    variantGroupKey: undefined,
    coinName: `Token ${i}`,
    coinGeckoId: undefined,
    isUnstable: false,
    areTransfersDisabled: false,
    areDepositsHalted: false,
    areWithdrawalsHalted: false,
    isVerified: i % 2 === 0,
  };
  return {
    ...asset,
    amount: new CoinPretty(asset, "2000000"),
    usdValue: money((i + 1) * 2),
  };
});
const caller = createCallerFactory(createTRPCRouter({ assets: assetsRouter }))(
  createInnerTRPCContext({
    assetLists: [
      {
        assets: assets.map((asset) => ({
          ...asset,
          counterparty: [],
          transferMethods: [],
        })),
      },
    ] as unknown as AssetList[],
    chainList: [],
  })
);

describe("list pricing after pagination", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(mapGetAssetsWithUserBalances).mockResolvedValue(assets);
    jest.mocked(getAssetPrice).mockResolvedValue(new Dec(1000));
    jest.mocked(getAsset).mockImplementation(({ anyDenom }) => {
      const asset = assets.find((asset) => asset.coinMinimalDenom === anyDenom);
      if (!asset) throw new Error("unlisted");
      return asset;
    });
    jest
      .mocked(getAssetMarketActivity)
      .mockImplementation(async ({ coinMinimalDenom }) => {
        const i = Number(coinMinimalDenom.split("-")[1]);
        // Unknown or zero liquidity must never schedule a list SQS lookup.
        if (i === 797) return undefined;
        return {
          price: money(i + 1),
          liquidity: money(i === 798 ? 0 : 100),
        } as NonNullable<Awaited<ReturnType<typeof getAssetMarketActivity>>>;
      });
  });

  it("sorts all search matches but prices only eligible rows of each page", async () => {
    const input = {
      search: { query: "Token" },
      limit: 50,
      sort: { keyPath: "usdValue" as const, direction: "desc" as const },
    };
    const first = await caller.assets.getUserBridgeAssets({
      ...input,
      cursor: 0,
    });
    expect(first.items).toHaveLength(50);
    expect(first.nextCursor).toBe(50);
    expect(first.items[0].coinMinimalDenom).toBe("asset-799");
    expect(first.items[0].usdValue!.toDec().equals(new Dec(2000))).toBe(true);
    expect(getAssetPrice).toHaveBeenCalledTimes(48);
    expect(
      jest
        .mocked(getAssetPrice)
        .mock.calls.every(
          ([{ asset }]) =>
            "coinMinimalDenom" in asset &&
            Number(asset.coinMinimalDenom.split("-")[1]) >= 750
        )
    ).toBe(true);
    expect(
      jest
        .mocked(getAssetPrice)
        .mock.calls.some(
          ([{ asset }]) =>
            "coinMinimalDenom" in asset &&
            asset.coinMinimalDenom === "asset-799"
        )
    ).toBe(true); // Listed unverified assets remain eligible.
    expect(first.items[1].currentPrice!.toDec().equals(new Dec(799))).toBe(
      true
    );
    expect(first.items[2].currentPrice).toBeUndefined();

    jest.mocked(getAssetPrice).mockClear();
    const next = await caller.assets.getUserBridgeAssets({
      ...input,
      cursor: 50,
    });
    expect(next.items[0].coinMinimalDenom).toBe("asset-749");
    expect(getAssetPrice).toHaveBeenCalledTimes(50);
    expect(mapGetAssetsWithUserBalances).toHaveBeenCalledTimes(1);
    // Page enrichment must not mutate the market snapshot used for ordering.
    expect(assets[799].usdValue.toDec().equals(new Dec(1600))).toBe(true);
  });

  it("returns market prices for an unpaginated response without SQS", async () => {
    const page = await caller.assets.getUserBridgeAssets({
      search: { query: "Token" },
    });
    expect(page.items).toHaveLength(800);
    expect(page.items[0].currentPrice!.toDec().equals(new Dec(1))).toBe(true);
    expect(getAssetPrice).not.toHaveBeenCalled();
  });

  it("keeps the snapshot price when page enrichment fails", async () => {
    jest.mocked(getAssetPrice).mockRejectedValue(new Error("SQS down"));
    const page = await caller.assets.getUserBridgeAssets({
      limit: 1,
      cursor: 0,
    });
    expect(page.items[0].currentPrice!.toDec().equals(new Dec(1))).toBe(true);
    expect(page.items[0].usdValue!.toDec().equals(new Dec(2))).toBe(true);
  });

  it("namespaces user and bridge candidate caches and forwards verified filtering", async () => {
    const input = {
      userOsmoAddress: "osmo-test",
      limit: 1,
      cursor: 1,
      onlyVerified: true,
      includePreview: true,
    };
    await caller.assets.getUserAssets(input);
    const bridge = await caller.assets.getUserBridgeAssets(input);
    expect(mapGetAssetsWithUserBalances).toHaveBeenCalledTimes(2);
    expect(mapGetAssetsWithUserBalances).toHaveBeenLastCalledWith(
      expect.objectContaining({ onlyVerified: true, includePreview: true })
    );
    expect(bridge.items[0]).toHaveProperty("transferMethods");
  });

  it("serves market-only batches without SQS fallback, deduplicating and skipping unlisted assets", async () => {
    const result = await caller.assets.getAssetPrices({
      coinMinimalDenoms: ["asset-0", "asset-0", "asset-797", "unlisted"],
      source: "market",
    });
    expect(Object.keys(result)).toEqual(["asset-0"]);
    expect(getAssetMarketActivity).toHaveBeenCalledTimes(2);
    expect(getAssetPrice).not.toHaveBeenCalled();
    await caller.assets.getAssetPrices({ coinMinimalDenoms: ["asset-0"] });
    expect(getAssetPrice).toHaveBeenCalledTimes(1);
  });
});
