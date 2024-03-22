import { AssetLists as MockAssetLists } from "../../../../__tests__/mock-asset-lists";
import { getAsset } from "../../../assets";
import { makePoolFromIndexerPool } from "../indexer";

export const mockAsset = {
  coinDenom: "mockCoinDenom",
  coinName: "mockCoinName",
  coinMinimalDenom: "mockCoinMinimalDenom",
  coinDecimals: 0,
  coinGeckoId: "mockCoinGeckoId",
  coinImageUrl: "mockCoinImageUrl",
  isVerified: true,
};

jest.mock("../../../assets", () => ({
  getAsset: jest.fn(),
}));

describe("makePoolFromIndexerPool", () => {
  beforeEach(() => {
    // Mock the getAsset function before calling getPoolsFromSidecar
    (getAsset as jest.Mock).mockImplementation(() => {
      return mockAsset;
    });
  });

  it("should return a valid pool object for a weighted pool", () => {
    const result = makePoolFromIndexerPool(MockAssetLists, weightedPool as any);

    if (!result) throw new Error("result is undefined");

    expect(result.id).toBe(weightedPool.pool_id.toString());
    expect(result.type).toBe("weighted");
    expect((result.raw as any).pool_assets).toBeDefined();
    expect(result.spreadFactor.toDec().toString()).toBe("0.002000000000000000");
  });

  it("should return a valid pool object for a stable pool", () => {
    const result = makePoolFromIndexerPool(MockAssetLists, stablePool as any);

    if (!result) throw new Error("result is undefined");

    expect(result.id).toBe(stablePool.pool_id.toString());
    expect(result.type).toBe("stable");
    expect((result.raw as any).pool_liquidity).toBeDefined();
    expect(result.reserveCoins.length).toBe(2);
    expect(result.spreadFactor.toDec().toString()).toBe("0.003000000000000000");
  });

  it("should return a valid pool object for a concentrated liquidity pool", () => {
    const result = makePoolFromIndexerPool(
      MockAssetLists,
      concentratedPool as any
    );

    if (!result) throw new Error("result is undefined");

    expect(result.id).toBe(concentratedPool.pool_id.toString());
    expect(result.type).toBe("concentrated");
    expect((result.raw as any).address).toBe(concentratedPool.address);
    expect(result.spreadFactor.toDec().toString()).toBe("0.002000000000000000");
  });

  it("should return a valid pool object for a cosmwasm transmuter pool", () => {
    const result = makePoolFromIndexerPool(
      MockAssetLists,
      cosmwasmTransmuterPool as any
    );

    if (!result) throw new Error("result is undefined");

    expect(result.id).toBe(cosmwasmTransmuterPool.pool_id.toString());
    expect(result.type).toBe("cosmwasm-transmuter");
    expect((result.raw as any).code_id).toBe("148");
  });

  it("should return a valid pool object for a cosmwasm pool", () => {
    const result = makePoolFromIndexerPool(MockAssetLists, cosmwasmPool as any);

    if (!result) throw new Error("result is undefined");

    expect(result.id).toBe(cosmwasmPool.pool_id.toString());
    expect(result.type).toBe("cosmwasm");
    expect((result.raw as any).code_id).toBe("1438");
  });
});

// Mock response objects copied from response

const weightedPool = {
  pool_id: 1,
  type: "osmosis.gamm.v1beta1.Pool",
  address: "osmo1mw0ac6rwlp5r8wapwk3zs6g29h8fcscxqakdzw9emkne6c8wjp9q0t3v8t",
  liquidity: 18957010.255080372,
  liquidity_24h_change: -2.725693822474902,
  volume_24h: 0,
  volume_24h_change: 0,
  volume_7d: 0,
  swap_fees: 0.2,
  exit_fees: 0,
  weight_or_scaling: "1073741824000000",
  future_pool_governor: "24h",
  total_shares: { denom: "gamm/pool/1", amount: "67826531094152564176736079" },
  total_weight_or_scaling: 1073741824000000,
  pool_tokens: [
    {
      symbol: "ATOM",
      amount: 1045161.532924,
      denom:
        "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
      coingecko_id: "cosmos",
      price: 9.068937986347601,
      price_24h_change: -1.951955737154605,
      exponent: 6,
      display: "atom",
      name: "Cosmos",
      percent: 50,
      weight_or_scaling: 536870912000000,
    },
    {
      symbol: "OSMO",
      amount: 6726846.469052,
      denom: "uosmo",
      coingecko_id: "osmosis",
      price: 1.40905626,
      price_24h_change: -3.388661993867734,
      exponent: 6,
      display: "osmo",
      name: "Osmosis",
      percent: 50,
      weight_or_scaling: 536870912000000,
    },
  ],
};

const stablePool = {
  pool_id: 833,
  type: "osmosis.gamm.poolmodels.stableswap.v1beta1.Pool",
  address: "osmo15v4mn84s9flhzpstkf9ql2mu0rnxh42pm8zhq47kh2fzs5zlwjsqaterkr",
  liquidity: 34405851.11347548,
  liquidity_24h_change: -3.4392819372126704,
  volume_24h: 0,
  volume_24h_change: 0,
  volume_7d: 0,
  swap_fees: 0.3,
  exit_fees: 0,
  weight_or_scaling: 1,
  future_pool_governor: "",
  total_shares: { denom: "gamm/pool/833", amount: "16589246236428673102621" },
  scaling_factors: ["100000", "120066"],
  scaling_factor_controller:
    "osmo12yvjuy69ynnts95ensss4q6480wkvkpnq2z2ntxmfa2qp860xsmq9mzlpn",
  total_weight_or_scaling: 220066,
  pool_tokens: [
    {
      symbol: "STOSMO",
      amount: 12590903.548151,
      denom:
        "ibc/D176154B0C63D1F9C6DCFB4F70349EBF2E2B5A87A05902F57A6AE92B863E9AEC",
      coingecko_id: "stride-staked-osmo",
      price: 1.655234170052112,
      price_24h_change: -3.458955400176939,
      exponent: 6,
      display: "stosmo",
      name: "Stride Staked osmo",
      percent: 50,
      weight_or_scaling: 100000,
    },
    {
      symbol: "OSMO",
      amount: 9626980.635071,
      denom: "uosmo",
      coingecko_id: "osmosis",
      price: 1.40905626,
      price_24h_change: -3.388661993867734,
      exponent: 6,
      display: "osmo",
      name: "Osmosis",
      percent: 50,
      weight_or_scaling: 120066,
    },
  ],
};

const concentratedPool = {
  pool_id: 1135,
  type: "osmosis.concentratedliquidity.v1beta1.Pool",
  address: "osmo1cr0fq7pfhpw08as5dsthzvjnlfdtvsq7kw98lwuqxjzv5jm3j5mqf9k6as",
  liquidity: 10147269.146227572,
  liquidity_24h_change: -3.00343230474741,
  volume_24h: 0,
  volume_24h_change: 0,
  volume_7d: 0,
  swap_fees: 0.2,
  exit_fees: 0,
  incentives_address:
    "osmo195e7qr4l7z9rtnc8cwm9646pk9slu8ve8c0pjmvt6hzqsmy04uzqe530fs",
  spread_rewards_address:
    "osmo1y53uxff98xn2xftdxk2du85j88r8cxg6hndldl0uxln52ds4ukvs8zt345",
  current_tick_liquidity: "30789048742588.342048812040469387",
  current_sqrt_price: "0.394208958394857218523464106504557767",
  current_tick: "-8445993",
  tick_spacing: "100",
  exponent_at_price_one: "-6",
  spread_factor: "0.002000000000000000",
  last_liquidity_update: "2024-01-23T22:10:35.523468841Z",
  total_weight_or_scaling: 1,
  pool_tokens: {
    asset1: {
      symbol: "ATOM",
      amount: 560541.161363,
      denom:
        "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
      coingecko_id: "cosmos",
      price: 9.068937986347601,
      price_24h_change: -1.951955737154605,
      exponent: 6,
      display: "atom",
      name: "Cosmos",
      percent: 50,
      weight_or_scaling: 0.5,
    },
    asset0: {
      symbol: "OSMO",
      amount: 3593721.740416,
      denom: "uosmo",
      coingecko_id: "osmosis",
      price: 1.40905626,
      price_24h_change: -3.388661993867734,
      exponent: 6,
      display: "osmo",
      name: "Osmosis",
      percent: 50,
      weight_or_scaling: 0.5,
    },
  },
};

const cosmwasmTransmuterPool = {
  pool_id: 1211,
  type: "osmosis.cosmwasmpool.v1beta1.CosmWasmPool",
  address: "osmo1gyg0pys40ex2f6a4dytd3ewpx2xfrsnt3rdc2t4j3s3jc9qx8kqsny066c",
  liquidity: 1994.2497781334503,
  liquidity_24h_change: -0.2871113542754226,
  volume_24h: 0,
  volume_24h_change: 0,
  volume_7d: 0,
  swap_fees: 0,
  exit_fees: 0,
  contract_address:
    "osmo1gyg0pys40ex2f6a4dytd3ewpx2xfrsnt3rdc2t4j3s3jc9qx8kqsny066c",
  code_id: "148",
  instantiate_msg:
    "eyJwb29sX2Fzc2V0X2Rlbm9tcyI6IFsiaWJjLzgyNDJBRDI0MDA4MDMyRTQ1N0QyRTEyRDQ2NTg4RkQzOUZCNTRGQjI5NjgwQzZDNzY2M0QyOTZCMzgzQzM3QzQiLCJpYmMvNEFCQkVGNEM4OTI2REREQjMyMEFFNTE4OENGRDYzMjY3QUJCQ0VGQzA1ODNFNEFFMDVENkU1QUEyNDAxRERBQiJdLCJhZG1pbiI6ICJvc21vMWQ2aDltbDk5bndwZWR4ZTNnaGpneXFuY3d6ZXl0ZHo1MDdlOWY0c3Nza2VqNnl3OW1tZ3MzOXN0OTgifQ==",
  total_weight_or_scaling: 1,
  pool_tokens: [
    {
      symbol: "USDT.KAVA",
      amount: 1956.090752,
      denom:
        "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
      coingecko_id: "",
      price: 0.9965591172667299,
      price_24h_change: -0.2815344146468132,
      exponent: 6,
      display: "usdtkava",
      name: "Tether USD",
      percent: 50,
      weight_or_scaling: 0.5,
    },
    {
      symbol: "AXLUSDT",
      amount: 44.919248,
      denom:
        "ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4",
      coingecko_id: "tether",
      price: 0.9993423092638707,
      price_24h_change: -0.05811349990110085,
      exponent: 6,
      display: "axlusdt",
      name: "Tether USD",
      percent: 50,
      weight_or_scaling: 0.5,
    },
  ],
};

const cosmwasmPool = {
  pool_id: 1212,
  type: "osmosis.cosmwasmpool.v1beta1.CosmWasmPool",
  address: "osmo1gyg0pys40ex2f6a4dytd3ewpx2xfrsnt3rdc2t4j3s3jc9qx8kqsny066c",
  liquidity: 1994.2497781334503,
  liquidity_24h_change: -0.2871113542754226,
  volume_24h: 0,
  volume_24h_change: 0,
  volume_7d: 0,
  swap_fees: 0,
  exit_fees: 0,
  contract_address:
    "osmo1gyg0pys40ex2f6a4dytd3ewpx2xfrsnt3rdc2t4j33s3jc9qx8kqsny066c",
  code_id: "1438",
  instantiate_msg:
    "eyJwb29sX2Fzc2V0X2Rlbm9tcyI6IFsiaWJjLzgyNDJBRDI0MDA4MDMyRTQ1N0QyRTEyRDQ2NTg4RkQzOUZCNTRGQjI5NjgwQzZDNzY2M0QyOTZCMzgzQzM3QzQiLCJpYmMvNEFCQkVGNEM4OTI2REREQjMyMEFFNTE4OENGRDYzMjY3QUJCQ0VGQzA1ODNFNEFFMDVENkU1QUEyNDAxRERBQiJdLCJhZG1pbiI6ICJvc21vMWQ2aDltbDk5bndwZWR4ZTNnaGpneXFuY3d6ZXl0ZHo1MDdlOWY0c3Nza2VqNnl3OW1tZ3MzOXN0OTgifQ==",
  total_weight_or_scaling: 1,
  pool_tokens: [
    {
      symbol: "USDT.KAVA",
      amount: 1956.090752,
      denom:
        "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
      coingecko_id: "",
      price: 0.9965591172667299,
      price_24h_change: -0.2815344146468132,
      exponent: 6,
      display: "usdtkava",
      name: "Tether USD",
      percent: 50,
      weight_or_scaling: 0.5,
    },
    {
      symbol: "AXLUSDT",
      amount: 44.919248,
      denom:
        "ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4",
      coingecko_id: "tether",
      price: 0.9993423092638707,
      price_24h_change: -0.05811349990110085,
      exponent: 6,
      display: "axlusdt",
      name: "Tether USD",
      percent: 50,
      weight_or_scaling: 0.5,
    },
  ],
};
