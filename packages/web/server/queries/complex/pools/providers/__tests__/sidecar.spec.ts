// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";

import { SIDECAR_BASE_URL } from "~/server/queries/sidecar";
import { server } from "~/tests/msw";

import { calcAssetValue, getAsset } from "../../../assets";
import { getPoolsFromSidecar, getPoolTypeFromSidecarPool } from "../sidecar";

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
}));

describe("getPoolsFromSidecar", () => {
  beforeEach(() => {
    // Mock the getAsset function before calling getPoolsFromSidecar
    (getAsset as jest.Mock).mockImplementation(() => {
      return Promise.resolve(mockAsset);
    });
    // Mock the getAsset function before calling getPoolsFromSidecar
    (calcAssetValue as jest.Mock).mockImplementation(() => {
      return Promise.resolve(undefined);
    });

    server.use(
      rest.get(`${SIDECAR_BASE_URL}/pools/all`, (_req, res, ctx) => {
        return res(ctx.json(mockSidecarResponse));
      })
    );
  });

  it("works with caching", async () => {
    const start1 = Date.now();
    const pools1 = await getPoolsFromSidecar();
    const end1 = Date.now();
    const duration1 = end1 - start1;

    // should hit cache now
    const start2 = Date.now();
    const pools2 = await getPoolsFromSidecar();
    const end2 = Date.now();
    const duration2 = end2 - start2;

    expect(pools1).toBeTruthy();
    expect(pools2).toBeTruthy();
    expect(duration2).toBeLessThan(duration1);
  });

  it("correctly identifies weighted pool type", async () => {
    const pool = mockSidecarResponse[0];
    const poolType = getPoolTypeFromSidecarPool(pool.underlying_pool as any);
    expect(poolType).toBe("weighted");
  });

  it("correctly identifies stable pool type", async () => {
    const pool = mockSidecarResponse[1];
    const poolType = getPoolTypeFromSidecarPool(pool.underlying_pool as any);
    expect(poolType).toBe("stable");
  });

  it("correctly identifies concentrated pool type", async () => {
    const pool = mockSidecarResponse[2];
    const poolType = getPoolTypeFromSidecarPool(pool.underlying_pool as any);
    expect(poolType).toBe("concentrated");
  });
});

/** Includes one of each type of pool. */
export const mockSidecarResponse = [
  {
    underlying_pool: {
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
        amount: "72065328504524203558402638",
      },
      pool_assets: [
        {
          token: {
            denom:
              "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
            amount: "1174251369369",
          },
          weight: "536870912000000",
        },
        {
          token: { denom: "uosmo", amount: "6743776599625" },
          weight: "536870912000000",
        },
      ],
    },
    sqs_model: {
      total_value_locked_uosmo: "13487553017948",
      balances: [
        {
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          amount: "1174251369369",
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
        { denom: "uosmo", amount: "6743776599625" },
      ],
      pool_denoms: [
        "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        "uosmo",
      ],
      spread_factor: "0.002000000000000000",
    },
  },
  {
    underlying_pool: {
      address:
        "osmo1ccjfm7gpa37mc9zwq553p0ttzq3ga5g6jzarz37lcq4qlnsdcxhsghcv3y",
      id: 810,
      pool_params: {
        swap_fee: "0.003000000000000000",
        exit_fee: "0.000000000000000000",
      },
      total_shares: {
        denom: "gamm/pool/810",
        amount: "1551756971418914776333",
      },
      pool_liquidity: [
        {
          denom:
            "ibc/5DD1F95ED336014D00CE2520977EC71566D282F9749170ADC83A392E0EA7426A",
          amount: "11797020838720",
        },
        {
          denom:
            "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
          amount: "8543584743436",
        },
      ],
      scaling_factors: [100000, 141976],
      scaling_factor_controller: "osmo1k8c2m5cn322akk5wy8lpt87dd2f4yh9afcd7af",
    },
    sqs_model: {
      total_value_locked_uosmo: "192815841811",
      total_value_locked_error:
        "highest liquidity pool between base uosmo and match denom ibc/5DD1F95ED336014D00CE2520977EC71566D282F9749170ADC83A392E0EA7426A not found",
      balances: [
        {
          denom:
            "ibc/5DD1F95ED336014D00CE2520977EC71566D282F9749170ADC83A392E0EA7426A",
          amount: "11797020838720",
        },
        {
          denom:
            "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
          amount: "8543584743436",
        },
      ],
      pool_denoms: [
        "ibc/5DD1F95ED336014D00CE2520977EC71566D282F9749170ADC83A392E0EA7426A",
        "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
      ],
      spread_factor: "0.003000000000000000",
    },
  },
  {
    underlying_pool: {
      address:
        "osmo126pr9qp44aft4juw7x4ev4s2qdtnwe38jzwunec9pxt5cpzaaphqyagqpu",
      incentives_address:
        "osmo1h2mhtj3wmsdt3uacev9pgpg38hkcxhsmyyn9ums0ya6eddrsafjsxs9j03",
      spread_rewards_address:
        "osmo16j5sssw32xuk8a0kjj8n54g25ye6kr339nz5axf8lzyeajk0k22stsm36c",
      id: 1066,
      current_tick_liquidity: "118792062145854674.783216071870810870",
      token0: "uosmo",
      token1:
        "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
      current_sqrt_price: "1331657.180558734515542560255947064108740259",
      current_tick: 108773310,
      tick_spacing: 100,
      exponent_at_price_one: -6,
      spread_factor: "0.002000000000000000",
      last_liquidity_update: "2024-01-05T15:14:55.506301411Z",
    },
    sqs_model: {
      total_value_locked_uosmo: "365390526442",
      balances: [
        {
          denom:
            "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
          amount: "163715501714444977640521",
        },
        { denom: "uosmo", amount: "87797638340" },
      ],
      pool_denoms: [
        "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
        "uosmo",
      ],
      spread_factor: "0.002000000000000000",
    },
  },
  {
    underlying_pool: {
      contract_address:
        "osmo15ns40n0pctl80d7l7praluufcywderupvgcl8xjg4gzvvhgv4vqq78vk7n",
      pool_id: 1175,
      code_id: 148,
      instantiate_msg:
        "eyJwb29sX2Fzc2V0X2Rlbm9tcyI6WyJ7cG9vbF9hc3NldF9kZW5vbXM6W2liYy84MjQyQUQyNDAwODAzMkU0NTdEMkUxMkQ0NjU4OEZEMzlGQjU0RkIyOTY4MEM2Qzc2NjNEMjk2QjM4M0MzN0M0IiwiaWJjLzRBQkJFRjRDODkyNkREREIzMjBBRTUxODhDRkQ2MzI2N0FCQkNFRkMwNTgzRTRBRTA1RDZFNUFBMjQwMUREQUJdIiwiYWRtaW46b3NtbzFkNmg5bWw5OW53cGVkeGUzZ2hqZ3lxbmN3emV5dGR6NTA3ZTlmNHNzc2tlajZ5dzltbWdzMzlzdDk4fSJdfQ==",
    },
    sqs_model: {
      total_value_locked_uosmo: "0",
      balances: [],
      pool_denoms: [
        "admin:osmo1d6h9ml99nwpedxe3ghjgyqncwzeytdz507e9f4ssskej6yw9mmgs39st98}",
        "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB]",
        "{pool_asset_denoms:[ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4",
      ],
      spread_factor: "0.000000000000000000",
    },
  },
];
