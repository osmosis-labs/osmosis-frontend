import { AssetLists as assetLists } from "../../../__tests__/mock-asset-lists";
import { PortfolioAssetsResponse } from "../../../sidecar";
import { calculatePercentAndFiatValues, getAllocations } from "../assets";
import {
  type AlloyStatus,
  type AssetVariant,
  checkAssetVariants,
  filterConvertibleAssetVariants,
  getHeldAssets,
} from "../assets";

const MOCK_DATA: PortfolioAssetsResponse = {
  categories: {
    "in-locks": {
      capitalization: "5.000000000000000000",
      is_best_effort: false,
    },
    pooled: {
      capitalization: "5.000000000000000000",
      is_best_effort: false,
    },
    staked: {
      capitalization: "5.000000000000000000",
      is_best_effort: false,
    },
    "total-assets": {
      capitalization: "60.000000000000000000",
      account_coins_result: [
        {
          coin: {
            denom: "factory/osmo1pfyxruwvtwk00y8z06dh2lqjdj82ldvy74wzm3/WOSMO",
            amount: "789",
          },
          cap_value: "10.000000000000000000",
        },
        {
          coin: {
            denom:
              "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail",
            amount: "456",
          },
          cap_value: "20.000000000000000000",
        },
        {
          coin: {
            denom:
              "ibc/7ED954CFFFC06EE8419387F3FC688837FF64EF264DE14219935F724EEEDBF8D3",
            amount: "123",
          },
          cap_value: "30.000000000000000000",
        },
      ],
      is_best_effort: false,
    },
    "unclaimed-rewards": {
      capitalization: "5.000000000000000000",
      is_best_effort: false,
    },
    unstaking: {
      capitalization: "5.000000000000000000",
      is_best_effort: false,
    },
    "user-balances": {
      capitalization: "10.000000000000000000",
      account_coins_result: [
        {
          coin: {
            denom: "factory/osmo1pfyxruwvtwk00y8z06dh2lqjdj82ldvy74wzm3/WOSMO",
            amount: "789",
          },
          cap_value: "10.000000000000000000",
        },
        {
          coin: {
            denom:
              "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail",
            amount: "456",
          },
          cap_value: "20.000000000000000000",
        },
      ],
      is_best_effort: false,
    },
  },
};

describe("getAll", () => {
  it("should calculate the correct allocation percentages and fiat values", () => {
    const result = getAllocations(MOCK_DATA.categories, assetLists).map(
      (allocation) => ({
        ...allocation,
        percentage: allocation.percentage.toString(),
        fiatValue: allocation.fiatValue.toString(),
      })
    );

    expect(result).toEqual([
      {
        key: "available",
        percentage: "33.333%",
        fiatValue: "$10",
      },
      {
        key: "staked",
        percentage: "16.666%",
        fiatValue: "$5",
      },
      {
        key: "unstaking",
        percentage: "16.666%",
        fiatValue: "$5",
      },
      {
        key: "unclaimedRewards",
        percentage: "16.666%",
        fiatValue: "$5",
      },
      {
        key: "pooled",
        percentage: "16.666%",
        fiatValue: "$5",
      },
    ]);
  });
});

describe("calculatePercentAndFiatValues", () => {
  it("should calculate the correct asset percentages and fiat values - Total Assets", () => {
    const result = calculatePercentAndFiatValues(
      MOCK_DATA.categories,
      assetLists,
      "total-assets",
      5
    ).map((allocation) => ({
      ...allocation,
      percentage: allocation.percentage.toString(),
      fiatValue: allocation.fiatValue.toString(),
    }));

    delete result[0].asset;
    delete result[1].asset;
    delete result[2].asset;
    delete result[3].asset;

    expect(result).toEqual([
      {
        fiatValue: "$30",
        percentage: "50%",
        key: "CTK",
      },
      {
        key: "SAIL",
        percentage: "33.333%",
        fiatValue: "$20",
      },
      {
        fiatValue: "$10",
        key: "WOSMO",
        percentage: "16.666%",
      },
      {
        key: "Other",
        percentage: "0%",
        fiatValue: "$0",
      },
    ]);
  });

  it("should calculate the correct asset percentages and fiat values - User Balances", () => {
    const result = calculatePercentAndFiatValues(
      MOCK_DATA.categories,
      assetLists,
      "user-balances",
      5
    ).map((allocation) => ({
      ...allocation,
      percentage: allocation.percentage.toString(),
      fiatValue: allocation.fiatValue.toString(),
    }));

    delete result[0].asset;
    delete result[1].asset;
    delete result[2].asset;

    expect(result).toEqual([
      {
        fiatValue: "$20",
        key: "SAIL",
        percentage: "200%",
      },
      {
        key: "WOSMO",
        percentage: "100%",
        fiatValue: "$10",
      },
      {
        key: "Other",
        percentage: "0%",
        fiatValue: "$0",
      },
    ]);
  });

  it("should handle zero balances correctly", () => {
    const zeroBalanceData = {
      ...MOCK_DATA.categories,
      "total-assets": {
        capitalization: "0",
        account_coins_result: [
          {
            coin: {
              denom:
                "factory/osmo1pfyxruwvtwk00y8z06dh2lqjdj82ldvy74wzm3/WOSMO",
              amount: "0",
            },
            cap_value: "0",
          },
          {
            coin: {
              denom:
                "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail",
              amount: "0",
            },
            cap_value: "0",
          },
        ],
        is_best_effort: false,
      },
    };

    const result = calculatePercentAndFiatValues(
      zeroBalanceData,
      assetLists,
      "total-assets",
      5
    ).map((allocation) => ({
      ...allocation,
      percentage: allocation.percentage.toString(),
      fiatValue: allocation.fiatValue.toString(),
    }));

    delete result[0].asset;
    delete result[1].asset;
    delete result[2].asset;

    expect(result).toEqual([
      {
        key: "WOSMO",
        percentage: "0%",
        fiatValue: "$0",
      },
      {
        key: "SAIL",
        percentage: "0%",
        fiatValue: "$0",
      },
      {
        key: "Other",
        percentage: "0%",
        fiatValue: "$0",
      },
    ]);
  });
});

describe("calculatePercentAndFiatValues unpriced coins", () => {
  it("marks a held coin valued at zero as unknown, so it isn't treated as dust", () => {
    const result = calculatePercentAndFiatValues(
      {
        ...MOCK_DATA.categories,
        "total-assets": {
          capitalization: "10",
          account_coins_result: [
            {
              coin: {
                denom:
                  "factory/osmo1pfyxruwvtwk00y8z06dh2lqjdj82ldvy74wzm3/WOSMO",
                amount: "10",
              },
              cap_value: "10",
            },
            {
              coin: {
                denom:
                  "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail",
                amount: "5000",
              },
              cap_value: "0",
            },
          ],
          is_best_effort: true,
        },
      },
      assetLists,
      "total-assets",
      5
    );

    expect(
      result.map(({ key, fiatValueUnknown }) => ({ key, fiatValueUnknown }))
    ).toEqual([
      { key: "WOSMO", fiatValueUnknown: undefined },
      { key: "SAIL", fiatValueUnknown: true },
      { key: "Other", fiatValueUnknown: undefined },
    ]);
  });
});

describe("getHeldAssets", () => {
  it("should return denoms and symbols from the total-assets breakdown, including pooled-only holdings", () => {
    // The ibc/7ED9... denom is only present in total-assets (not user-balances),
    // representing a holding that only exists in a pool or lock.
    expect(getHeldAssets(MOCK_DATA.categories, assetLists)).toEqual([
      {
        denom: "factory/osmo1pfyxruwvtwk00y8z06dh2lqjdj82ldvy74wzm3/WOSMO",
        coinDenom: "WOSMO",
      },
      {
        denom:
          "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail",
        coinDenom: "SAIL",
      },
      {
        denom:
          "ibc/7ED954CFFFC06EE8419387F3FC688837FF64EF264DE14219935F724EEEDBF8D3",
        coinDenom: "CTK",
      },
    ]);
  });

  it("should leave coinDenom undefined for unlisted denoms", () => {
    expect(
      getHeldAssets(
        {
          ...MOCK_DATA.categories,
          "total-assets": {
            capitalization: "1",
            account_coins_result: [
              {
                coin: { denom: "factory/osmo1notlisted/spam", amount: "1" },
                cap_value: "1",
              },
            ],
            is_best_effort: false,
          },
        },
        assetLists
      )
    ).toEqual([{ denom: "factory/osmo1notlisted/spam", coinDenom: undefined }]);
  });

  it("should return an empty array when the breakdown is missing", () => {
    expect(
      getHeldAssets(
        {
          ...MOCK_DATA.categories,
          "total-assets": {
            capitalization: "0",
            is_best_effort: true,
          },
        },
        assetLists
      )
    ).toEqual([]);
  });
});

describe("Has Asset Variants", () => {
  it("should return true when there are asset variants", () => {
    const userCoinMinimalDenoms = [
      {
        denom:
          "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4", // USDC
        amount: "0.2",
        fiatValue: "0.2",
      },
      {
        denom:
          "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail", // SAIL
        amount: "0.2",
        fiatValue: "0.2",
      },
      {
        denom:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5", // ETH.axl <- this is the variant
        amount: "0.2",
        fiatValue: "0.2",
      },
    ];

    const result = checkAssetVariants(userCoinMinimalDenoms, assetLists);
    expect(result.length).toBe(2);
  });

  it("should return false when there are no asset variants", () => {
    const userCoinMinimalDenoms = [
      {
        denom: "uosmo", // OSMO
        amount: "0.2",
        fiatValue: "0.2",
      },
      {
        denom:
          "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail", // SAIL
        amount: "0.2",
        fiatValue: "0.2",
      },
    ];

    const result = checkAssetVariants(userCoinMinimalDenoms, assetLists);
    expect(result.length).toBe(0);
  });

  it("should return empty array when user has no asset variants", () => {
    const userCoinMinimalDenoms: {
      denom: string;
      amount: string;
      fiatValue: string;
    }[] = [];

    const result = checkAssetVariants(userCoinMinimalDenoms, assetLists);
    expect(result.length).toBe(0);
  });
});

describe("filterConvertibleAssetVariants", () => {
  const ALL_USDC_CONTRACT =
    "osmo147h5x9pcj7lm0cttlaefx6sqq5vdfnmwfcqxkmjd7exqm9gc7grqhr75m0";
  const ALL_BTC_CONTRACT =
    "osmo1z6r6qdknhgsc0zeracktgpcxf43j6sekq07nw8sxduc9lg0qjjlqfu25e3";
  const ALL_ETH_CONTRACT =
    "osmo1k6c8jln7ejuqwtqmay3yvzrg3kueaczl96pk067ldg8u835w0yhsw27twm";
  const USDC_NOBLE =
    "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
  const USDC_AXL =
    "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858";
  // Hypothetical member with a coarser normalization factor than allUSDC.
  const USDC_INJ = "ibc/USDCINJ";
  const USDC_AXL_CORRUPTED = "ibc/USDCCORRUPTED";
  const WBTC =
    "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc";
  const ETH_AXL =
    "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5";

  const variant = (
    denom: string,
    canonicalDenom: string,
    isAlloyed = true,
    baseAmount = "1000000"
  ): AssetVariant =>
    ({
      amount: {
        currency: { coinMinimalDenom: denom },
        toCoin: () => ({ denom, amount: baseAmount }),
      },
      canonicalAsset: { coinMinimalDenom: canonicalDenom, isAlloyed },
    }) as unknown as AssetVariant;

  it("keeps only members of active alloys, failing closed", async () => {
    const allUsdc = `factory/${ALL_USDC_CONTRACT}/alloyed/allUSDC`;
    const allBtc = `factory/${ALL_BTC_CONTRACT}/alloyed/allBTC`;
    const result = await filterConvertibleAssetVariants(
      [
        variant(USDC_NOBLE, allUsdc),
        // Member, but too small to mint one unit of the alloy.
        variant(USDC_INJ, allUsdc, true, "999"),
        // Member the transmuter marks corrupted (it won't take it in).
        variant(USDC_AXL_CORRUPTED, allUsdc),
        // In the variant group, but not a member of the transmuter.
        variant(USDC_AXL, `factory/${ALL_USDC_CONTRACT}/alloyed/allUSDC`),
        // Member of a frozen transmuter.
        variant(WBTC, `factory/${ALL_BTC_CONTRACT}/alloyed/allBTC`),
        // Status query fails.
        variant(ETH_AXL, `factory/${ALL_ETH_CONTRACT}/alloyed/allETH`),
        // Canonical asset isn't an alloy (legacy consolidation).
        variant("ibc/OLD", "uold", false),
      ],
      async (contractAddress): Promise<AlloyStatus> => {
        if (contractAddress === ALL_USDC_CONTRACT)
          return {
            isActive: true,
            normalizationFactors: {
              [USDC_NOBLE]: "1",
              [USDC_INJ]: "1000",
              [USDC_AXL_CORRUPTED]: "1",
              [allUsdc]: "1",
            },
            corruptedDenoms: [USDC_AXL_CORRUPTED],
          };
        if (contractAddress === ALL_BTC_CONTRACT)
          return {
            isActive: false,
            normalizationFactors: { [WBTC]: "1", [allBtc]: "1" },
            corruptedDenoms: [],
          };
        throw new Error("node down");
      }
    );

    expect(
      result.map(({ amount }) => amount.currency.coinMinimalDenom)
    ).toEqual([USDC_NOBLE]);
  });
});
