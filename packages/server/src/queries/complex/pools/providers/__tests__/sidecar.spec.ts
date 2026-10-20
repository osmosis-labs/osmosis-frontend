// eslint-disable-next-line import/no-extraneous-dependencies
import { http, HttpResponse } from "msw";
// eslint-disable-next-line import/no-extraneous-dependencies
import { setupServer } from "msw/node";

import { SIDECAR_BASE_URL } from "../../../../../env";
import { AssetLists as MockAssetLists } from "../../../../__tests__/mock-asset-lists";
import { calcAssetValue, calcSumCoinsValue, getAsset } from "../../../assets";
import {
  getPoolsFromSidecar,
  getPoolTypeFromChainPool,
  hasUnpricedReserves,
  makePoolFromChainPool,
} from "../sidecar";

export const server = setupServer();

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
  calcAssetValue: jest.fn(),
  calcSumCoinsValue: jest.fn(),
  isHoldingValueUnknown: jest.requireActual("../../../assets/price")
    .isHoldingValueUnknown,
}));

describe("getPoolsFromSidecar", () => {
  beforeEach(() => {
    // Mock the getAsset function before calling getPoolsFromSidecar
    (getAsset as jest.Mock).mockImplementation(() => {
      return mockAsset;
    });
    // Mock the getAsset function before calling getPoolsFromSidecar
    (calcAssetValue as jest.Mock).mockImplementation(() => {
      return Promise.resolve(undefined);
    });
    // Mock the getAsset function before calling getPoolsFromSidecar
    (calcSumCoinsValue as jest.Mock).mockImplementation(() => {
      return Promise.resolve(undefined);
    });

    server.use(
      http.get(`${SIDECAR_BASE_URL}/pools`, () => {
        return HttpResponse.json(mockSidecarResponse);
      })
    );
  });

  it("correctly identifies weighted pool type", async () => {
    const pool = mockSidecarResponse[0];
    const poolType = getPoolTypeFromChainPool(pool.chain_model as any);
    expect(poolType).toBe("weighted");
  });

  it("correctly identifies stable pool type", async () => {
    const pool = mockSidecarResponse[1];
    const poolType = getPoolTypeFromChainPool(pool.chain_model as any);
    expect(poolType).toBe("stable");
  });

  it("correctly identifies concentrated pool type", async () => {
    const pool = mockSidecarResponse[2];
    const poolType = getPoolTypeFromChainPool(pool.chain_model as any);
    expect(poolType).toBe("concentrated");
  });

  it("correctly identifies cosmwasm transmuter pool type", async () => {
    const pool = mockSidecarResponse[3];
    const poolType = getPoolTypeFromChainPool(pool.chain_model as any);
    expect(poolType).toBe("cosmwasm-transmuter");
  });

  it("correctly identifies cosmwasm pool type", async () => {
    const pool = mockSidecarResponse[4];
    const poolType = getPoolTypeFromChainPool(pool.chain_model as any);
    expect(poolType).toBe("cosmwasm");
  });
});

describe("getPoolsFromSidecar market data", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());

  beforeEach(() => {
    (getAsset as jest.Mock).mockImplementation(() => mockAsset);
  });

  /** Serves the weighted mock pool with the given fees data under a unique pool ID. */
  const getPoolWithFeesData = async (poolId: number, feesData?: object) => {
    server.use(
      http.get(new URL("/pools", SIDECAR_BASE_URL).toString(), () =>
        HttpResponse.json({
          data: [
            {
              ...mockSidecarResponse[0],
              chain_model: {
                ...mockSidecarResponse[0].chain_model,
                id: poolId,
              },
              liquidity_cap: "1000",
              fees_data: feesData,
            },
          ],
          meta: { total_items: 1, next_cursor: -1 },
        })
      )
    );

    const { data } = await getPoolsFromSidecar({
      assetLists: [],
      chainList: [],
      poolIds: [poolId.toString()],
    });
    return data[0];
  };

  it("leaves volume and fees unknown when fees data is missing or failed", async () => {
    const missing = await getPoolWithFeesData(20001);
    const failed = await getPoolWithFeesData(20002, {
      volume_24h: 0,
      volume_7d: 0,
      fees_spent_24h: 0,
      fees_spent_7d: 0,
      is_error: true,
    });

    for (const pool of [missing, failed]) {
      expect(pool.market?.volume24hUsd).toBeUndefined();
      expect(pool.market?.volume7dUsd).toBeUndefined();
      expect(pool.market?.feesSpent24hUsd).toBeUndefined();
      expect(pool.market?.feesSpent7dUsd).toBeUndefined();
      expect(pool.totalFiatValueLocked.toDec().toString()).toBe(
        "1000.000000000000000000"
      );
    }
  });

  it("keeps known volume and fees, including a known zero", async () => {
    const pool = await getPoolWithFeesData(20003, {
      volume_24h: 0,
      volume_7d: 700,
      fees_spent_24h: 0,
      fees_spent_7d: 2,
    });

    expect(pool.market?.volume24hUsd?.toDec().isZero()).toBe(true);
    expect(pool.market?.volume7dUsd?.toDec().toString()).toBe(
      "700.000000000000000000"
    );
    expect(pool.market?.feesSpent7dUsd?.toDec().toString()).toBe(
      "2.000000000000000000"
    );
  });
});

describe("hasUnpricedReserves", () => {
  // Listed, verified and stable in the mock asset lists.
  const sail =
    "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail";
  const spam = "factory/osmo1spam/test";

  it("is unknown when a held reserve that should have a price has none", () => {
    expect(
      hasUnpricedReserves(MockAssetLists, {
        liquidity_cap_error: `zero cap for denom (${sail})`,
        balances: [
          { denom: sail, amount: "1832630768" },
          { denom: "uosmo", amount: "1184090395" },
        ],
      })
    ).toBe(true);
  });

  it("is known when the flagged reserve is drained or was never priced", () => {
    expect(
      hasUnpricedReserves(MockAssetLists, {
        liquidity_cap_error: `zero cap for denom (${sail}); zero cap for denom (${spam})`,
        balances: [
          { denom: sail, amount: "0" },
          { denom: spam, amount: "941235682501176" },
          { denom: "uosmo", amount: "1184090395" },
        ],
      })
    ).toBe(false);
  });
});

describe("makePoolFromChainPool", () => {
  beforeEach(() => {
    (getAsset as jest.Mock).mockImplementation(() => mockAsset);
  });

  it("marks uninitialized CL chain-fallback pools as known zero TVL", () => {
    const pool = makePoolFromChainPool({
      chainPool: {
        address: "osmo1testpooladdress",
        id: 9999,
        current_tick_liquidity: "0",
        token0: "uosmo",
        token1: "uatom",
        current_sqrt_price: "0",
        current_tick: 0,
        tick_spacing: 100,
        exponent_at_price_one: -6,
        spread_factor: "0.002000000000000000",
        last_liquidity_update: "2026-01-01T00:00:00.000000000Z",
      } as any,
      assetLists: [],
    });

    expect(pool).not.toBeNull();
    expect(pool?.tvlUnknown).toBe(false);
  });

  it("keeps CL chain-fallback TVL unknown when pool is initialized", () => {
    const pool = makePoolFromChainPool({
      chainPool: {
        address: "osmo1testpooladdress",
        id: 10000,
        current_tick_liquidity: "1",
        token0: "uosmo",
        token1: "uatom",
        current_sqrt_price: "1.000000000000000000",
        current_tick: 0,
        tick_spacing: 100,
        exponent_at_price_one: -6,
        spread_factor: "0.002000000000000000",
        last_liquidity_update: "2026-01-01T00:00:00.000000000Z",
      } as any,
      assetLists: [],
    });

    expect(pool).not.toBeNull();
    expect(pool?.tvlUnknown).toBe(true);
  });
});

/** Includes one of each type of pool. */
export const mockSidecarResponse = [
  {
    chain_model: {
      address:
        "osmo1mw0ac6rwlp5r8wapwk3zs6g29h8fcscxqakdzw9emkne6c8wjp9q0t3v8t",
      id: 1,
      pool_params: {
        swap_fee: "0.002000000000000000",
        exit_fee: "0.000000000000000000",
      },
      future_pool_governor: "24h",
      total_weight: "1073741824000000.000000000000000000",
      total_shares: {
        denom: "gamm/pool/1",
        amount: "68693663708315533744045152",
      },
      pool_assets: [
        {
          token: {
            denom:
              "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
            amount: "1096690705133",
          },
          weight: "536870912000000",
        },
        {
          token: { denom: "uosmo", amount: "6573349503281" },
          weight: "536870912000000",
        },
      ],
    },
    balances: [
      {
        denom:
          "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        amount: "1096690705133",
      },
      {
        denom:
          "ibc/9989AD6CCA39D1131523DB0617B50F6442081162294B4795E26746292467B525",
        amount: "1000000000",
      },
      {
        denom:
          "ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228",
        amount: "999800",
      },
      { denom: "uosmo", amount: "6573349503281" },
    ],
    type: 0,
    spread_factor: "0.002000000000000000",
  },
  {
    chain_model: {
      address:
        "osmo1ccjfm7gpa37mc9zwq553p0ttzq3ga5g6jzarz37lcq4qlnsdcxhsghcv3y",
      id: 810,
      pool_params: {
        swap_fee: "0.003000000000000000",
        exit_fee: "0.000000000000000000",
      },
      total_shares: {
        denom: "gamm/pool/810",
        amount: "1530985617567097766757",
      },
      pool_liquidity: [
        {
          denom:
            "ibc/5DD1F95ED336014D00CE2520977EC71566D282F9749170ADC83A392E0EA7426A",
          amount: "10401240752405",
        },
        {
          denom:
            "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
          amount: "10143120522866",
        },
      ],
      scaling_factors: [100000, 142306],
      scaling_factor_controller: "osmo1k8c2m5cn322akk5wy8lpt87dd2f4yh9afcd7af",
    },
    balances: [
      {
        denom:
          "ibc/5DD1F95ED336014D00CE2520977EC71566D282F9749170ADC83A392E0EA7426A",
        amount: "10401240752405",
      },
      {
        denom:
          "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
        amount: "10143120522866",
      },
    ],
    type: 1,
    spread_factor: "0.003000000000000000",
  },
  {
    chain_model: {
      address:
        "osmo126pr9qp44aft4juw7x4ev4s2qdtnwe38jzwunec9pxt5cpzaaphqyagqpu",
      incentives_address:
        "osmo1h2mhtj3wmsdt3uacev9pgpg38hkcxhsmyyn9ums0ya6eddrsafjsxs9j03",
      spread_rewards_address:
        "osmo16j5sssw32xuk8a0kjj8n54g25ye6kr339nz5axf8lzyeajk0k22stsm36c",
      id: 1066,
      current_tick_liquidity: "109431033952057872.737031734160308316",
      token0: "uosmo",
      token1:
        "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
      current_sqrt_price: "1277132.157278276713630179876231966963678480",
      current_tick: 108631066,
      tick_spacing: 100,
      exponent_at_price_one: -6,
      spread_factor: "0.002000000000000000",
      last_liquidity_update: "2024-01-19T12:10:10.167386165Z",
    },
    balances: [
      {
        denom:
          "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
        amount: "144617032379292330090194",
      },
      { denom: "uosmo", amount: "84220297707" },
    ],
    type: 2,
    spread_factor: "0.002000000000000000",
  },
  {
    chain_model: {
      contract_address:
        "osmo15ns40n0pctl80d7l7praluufcywderupvgcl8xjg4gzvvhgv4vqq78vk7n",
      pool_id: 1175,
      code_id: 148,
      instantiate_msg:
        "eyJwb29sX2Fzc2V0X2Rlbm9tcyI6WyJ7cG9vbF9hc3NldF9kZW5vbXM6W2liYy84MjQyQUQyNDAwODAzMkU0NTdEMkUxMkQ0NjU4OEZEMzlGQjU0RkIyOTY4MEM2Qzc2NjNEMjk2QjM4M0MzN0M0IiwiaWJjLzRBQkJFRjRDODkyNkREREIzMjBBRTUxODhDRkQ2MzI2N0FCQkNFRkMwNTgzRTRBRTA1RDZFNUFBMjQwMUREQUJdIiwiYWRtaW46b3NtbzFkNmg5bWw5OW53cGVkeGUzZ2hqZ3lxbmN3emV5dGR6NTA3ZTlmNHNzc2tlajZ5dzltbWdzMzlzdDk4fSJdfQ==",
    },
    balances: [],
    type: 3,
    spread_factor: "0.000000000000000000",
  },
  {
    chain_model: {
      contract_address:
        "osmo15ns40n0pctl80d7l7praluufcywderupvgcl8xjg4gzvvhgv4vqq78vk7n",
      pool_id: 1178,
      code_id: 155,
      instantiate_msg:
        "eyJwb29sX2Fzc2V0X2Rlbm9tcyI6WyJ7cG9vbF9hc3NldF9kZW5vbXM6W2liYy84MjQyQUQyNDAwODAzMkU0NTdEMkUxMkQ0NjU4OEZEMzlGQjU0RkIyOTY4MEM2Qzc2NjNEMjk2QjM4M0MzN0M0IiwiaWJjLzRBQkJFRjRDODkyNkREREIzMjBBRTUxODhDRkQ2MzI2N0FCQkNFRkMwNTgzRTRBRTA1RDZFNUFBMjQwMUREQUJdIiwiYWRtaW46b3NtbzFkNmg5bWw5OW53cGVkeGUzZ2hqZ3lxbmN3emV5dGR6NTA3ZTlmNHNzc2tlajZ5dzltbWdzMzlzdDk4fSJdfQ==",
    },
    balances: [],
    type: 3,
    spread_factor: "0.000000000000000000",
  },
];
