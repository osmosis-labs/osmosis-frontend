import { AssetLists as assetLists } from "../../../../queries/__tests__/mock-asset-lists";
import { AllocationResponse } from "../../../data-services/allocation";
import { calculatePercentAndFiatValues, getAll } from "../allocation";

const MOCK_DATA: AllocationResponse = {
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

describe("Allocation Functions", () => {
  describe("getAll", () => {
    it("should calculate the correct allocation percentages and fiat values", () => {
      const result = getAll(MOCK_DATA.categories).map((allocation) => ({
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
    it("should calculate the correct asset percentages and fiat values", async () => {
      const result = await calculatePercentAndFiatValues(
        MOCK_DATA.categories,
        assetLists,
        "total-assets"
      ).map((allocation) => ({
        ...allocation,
        percentage: allocation.percentage.toString(),
        fiatValue: allocation.fiatValue.toString(),
      }));

      expect(result).toEqual([
        {
          key: "CTK",
          percentage: "50%",
          fiatValue: "$30",
        },
        {
          key: "SAIL",
          percentage: "33.333%",
          fiatValue: "$20",
        },
        {
          key: "WOSMO",
          percentage: "16.666%",
          fiatValue: "$10",
        },
        {
          key: "Other",
          percentage: "0%",
          fiatValue: "$0",
        },
      ]);
    });

    it("should calculate the correct asset percentages and fiat values", async () => {
      const result = await calculatePercentAndFiatValues(
        MOCK_DATA.categories,
        assetLists,
        "user-balances"
      ).map((allocation) => ({
        ...allocation,
        percentage: allocation.percentage.toString(),
        fiatValue: allocation.fiatValue.toString(),
      }));

      expect(result).toEqual([
        {
          key: "SAIL",
          percentage: "200%",
          fiatValue: "$20",
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
  });
});
