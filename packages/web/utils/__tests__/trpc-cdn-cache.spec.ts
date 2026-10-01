import { QueryClient } from "@tanstack/react-query";

import {
  getAssetsCdnCacheControl,
  isCdnCacheableAssetsQuery,
  setAssetsQueryDefaults,
} from "~/utils/trpc-cdn-cache";

const base = "https://app.osmosis.zone/api/edge-trpc-assets";

/** Builds a request URL the way tRPC's http links do, with superjson inputs. */
function queryUrl(paths: string[], inputs: unknown[], batch = false) {
  const input = batch
    ? Object.fromEntries(inputs.map((json, i) => [i, { json }]))
    : { json: inputs[0] };
  const params = new URLSearchParams({ input: JSON.stringify(input) });
  if (batch) params.set("batch", "1");
  return `${base}/${paths.join(",")}?${params}`;
}

function cacheControl(paths: string[], inputs: unknown[], batch = false) {
  return getAssetsCdnCacheControl({
    url: queryUrl(paths, inputs, batch),
    paths,
    type: "query",
    errorCount: 0,
  });
}

describe("getAssetsCdnCacheControl", () => {
  it("caches an allowlisted public query", () => {
    expect(
      cacheControl(
        ["assets.getMarketAsset"],
        [{ findMinDenomOrSymbol: "OSMO" }]
      )
    ).toBe("public, s-maxage=10");
  });

  it("uses the shortest max age in a batch", () => {
    expect(
      cacheControl(
        ["assets.getCoingeckoCoin", "assets.getMarketAsset"],
        [{ coinGeckoId: "osmosis" }, { findMinDenomOrSymbol: "OSMO" }],
        true
      )
    ).toBe("public, s-maxage=10");
  });

  it("does not cache a batch containing a procedure off the allowlist", () => {
    expect(
      cacheControl(
        ["assets.getMarketAsset", "assets.getAssetPrice"],
        [{ findMinDenomOrSymbol: "OSMO" }, { coinMinimalDenom: "uosmo" }],
        true
      )
    ).toBeUndefined();
  });

  it("does not cache asset prices, which set limit order prices", () => {
    expect(
      cacheControl(["assets.getAssetPrice"], [{ coinMinimalDenom: "uosmo" }])
    ).toBeUndefined();
  });

  it("does not cache inputs with a wallet address", () => {
    expect(
      cacheControl(
        ["assets.getMarketAsset"],
        [{ findMinDenomOrSymbol: "OSMO", userOsmoAddress: "osmo1abc" }]
      )
    ).toBeUndefined();
  });

  it("does not cache realtime historical prices", () => {
    expect(
      cacheControl(
        ["assets.getAssetHistoricalPrice"],
        [{ coinMinimalDenom: "uosmo", timeFrame: "1D", realtime: true }]
      )
    ).toBe(undefined);
    expect(
      cacheControl(
        ["assets.getAssetHistoricalPrice"],
        [{ coinMinimalDenom: "uosmo", timeFrame: "1D" }]
      )
    ).toBe("public, s-maxage=60");
  });

  it("does not cache errors, mutations or unparseable inputs", () => {
    const paths = ["assets.getMarketAsset"];
    const url = queryUrl(paths, [{ findMinDenomOrSymbol: "OSMO" }]);
    expect(
      getAssetsCdnCacheControl({ url, paths, type: "query", errorCount: 1 })
    ).toBeUndefined();
    expect(
      getAssetsCdnCacheControl({ url, paths, type: "mutation", errorCount: 0 })
    ).toBeUndefined();
    expect(
      getAssetsCdnCacheControl({
        url: `${base}/assets.getMarketAsset?input=%7Bnot-json`,
        paths,
        type: "query",
        errorCount: 0,
      })
    ).toBeUndefined();
  });
});

describe("getAssetsCdnCacheControl guards", () => {
  const paths = ["assets.getAssetHistoricalPrice"];
  const url = queryUrl(paths, [{ coinMinimalDenom: "uosmo", timeFrame: "1D" }]);
  const ok = (data: unknown) => ({ result: { data } });

  it("does not cache streamed batches, whose headers precede the results", () => {
    expect(
      getAssetsCdnCacheControl({
        url,
        paths,
        type: "query",
        errorCount: 0,
        eagerGeneration: true,
      })
    ).toBeUndefined();
  });

  it("does not cache empty results, which may be upstream-failure fallbacks", () => {
    expect(
      getAssetsCdnCacheControl({
        url,
        paths,
        type: "query",
        errorCount: 0,
        results: [ok([])],
      })
    ).toBeUndefined();
    expect(
      getAssetsCdnCacheControl({
        url: queryUrl(
          ["assets.getAssetPairHistoricalPrice"],
          [
            {
              poolId: "1",
              baseCoinMinimalDenom: "a",
              quoteCoinMinimalDenom: "b",
              timeDuration: "7d",
            },
          ]
        ),
        paths: ["assets.getAssetPairHistoricalPrice"],
        type: "query",
        errorCount: 0,
        results: [ok({ prices: [], min: 0, max: 0 })],
      })
    ).toBeUndefined();
  });

  it("caches non-empty results", () => {
    expect(
      getAssetsCdnCacheControl({
        url,
        paths,
        type: "query",
        errorCount: 0,
        results: [ok([{ time: 1, close: 1 }])],
      })
    ).toBe("public, s-maxage=60");
  });

  it("does not cache inputs with any user address key", () => {
    for (const key of ["osmoAddress", "userCosmosAddress", "userEvmAddress"]) {
      expect(
        cacheControl(
          ["assets.getMarketAsset"],
          [{ findMinDenomOrSymbol: "OSMO", [key]: "someaddress" }]
        )
      ).toBeUndefined();
    }
  });
});

describe("isCdnCacheableAssetsQuery", () => {
  it("matches allowlisted public queries only", () => {
    expect(
      isCdnCacheableAssetsQuery({
        type: "query",
        path: "assets.getTopGainerAssets",
        input: { topN: 4 },
      })
    ).toBe(true);
    expect(
      isCdnCacheableAssetsQuery({
        type: "query",
        path: "assets.getUserAssets",
        input: { userOsmoAddress: "osmo1abc" },
      })
    ).toBe(false);
    expect(
      isCdnCacheableAssetsQuery({
        type: "query",
        path: "assets.getAssetHistoricalPrice",
        input: { coinMinimalDenom: "uosmo", timeFrame: "1H", realtime: true },
      })
    ).toBe(false);
  });
});

describe("setAssetsQueryDefaults", () => {
  const queryClient = new QueryClient();
  setAssetsQueryDefaults(queryClient);

  /** Resolves options for a query key shaped the way tRPC builds it. */
  const optionsFor = (path: string, callSite: object = {}) =>
    queryClient.defaultQueryOptions({
      queryKey: [path.split("."), { input: {}, type: "query" }],
      ...callSite,
    });

  it("keeps CDN-cacheable queries fresh for their CDN max age", () => {
    expect(optionsFor("edge.assets.getMarketAsset")).toMatchObject({
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    });
    expect(optionsFor("edge.assets.getCoingeckoCoin").staleTime).toBe(300_000);
  });

  it("keeps balances fresh briefly and still refetches them on focus", () => {
    const options = optionsFor("edge.assets.getUserAssets");
    expect(options.staleTime).toBe(10_000);
    expect(options.refetchOnWindowFocus).toBeUndefined();
  });

  it("leaves asset prices and other routers untouched", () => {
    expect(optionsFor("edge.assets.getAssetPrice").staleTime).toBeUndefined();
    expect(optionsFor("edge.pools.getPool").staleTime).toBeUndefined();
  });

  it("lets call-site options win", () => {
    expect(
      optionsFor("edge.assets.getMarketAsset", { staleTime: 0 }).staleTime
    ).toBe(0);
  });
});
