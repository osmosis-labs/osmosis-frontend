import { AssetLists as assetLists } from "../../../__tests__/mock-asset-lists";
import { PortfolioAssetsResponse } from "../../../sidecar";
import { calculatePercentAndFiatValues, getAllocations } from "../assets";
import { checkAssetVariants } from "../assets";

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
    const result = getAllocations(MOCK_DATA.categories).map((allocation) => ({
      ...allocation,
      percentage: allocation.percentage.toString(),
      fiatValue: allocation.fiatValue.toString(),
    }));

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

describe("Has Asset Variants", () => {
  it("should return true when there are asset variants", () => {
    const userCoinMinimalDenoms = [
      {
        denom:
          "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4", // USDC
        amount: "0.2",
      },
      {
        denom:
          "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail", // SAIL
        amount: "0.2",
      },
      {
        denom:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5", // ETH.axl <- this is the variant
        amount: "0.2",
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
      },
      {
        denom:
          "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail", // SAIL
        amount: "0.2",
      },
    ];

    const result = checkAssetVariants(userCoinMinimalDenoms, assetLists);
    expect(result.length).toBe(0);
  });

  it("should return empty array when user has no asset variants", () => {
    const userCoinMinimalDenoms: { denom: string; amount: string }[] = [];

    const result = checkAssetVariants(userCoinMinimalDenoms, assetLists);
    expect(result.length).toBe(0);
  });
});
