import { AllocationResponse } from "../../../data-services/allocation";
import { getAll } from "../allocation";

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

  // describe("calculatePercentAndFiatValues", () => {
  //   it("should calculate the correct asset percentages and fiat values", async () => {
  //     const categories = {
  //       "total-assets": {
  //         capitalization: "1000",
  //         account_coins_result: [
  //           { coin: { denom: "asset1" }, cap_value: "400" },
  //           { coin: { denom: "asset2" }, cap_value: "300" },
  //           { coin: { denom: "asset3" }, cap_value: "200" },
  //           { coin: { denom: "asset4" }, cap_value: "50" },
  //           { coin: { denom: "asset5" }, cap_value: "30" },
  //           { coin: { denom: "asset6" }, cap_value: "20" },
  //         ],
  //       },
  //     };

  //     const assetLists = [];

  //     getAsset.mockImplementation(({ anyDenom }) => ({
  //       coinDenom: anyDenom,
  //     }));

  //     const result = await calculatePercentAndFiatValues(
  //       categories,
  //       assetLists,
  //       "total-assets"
  //     );

  //     expect(result).toEqual([
  //       {
  //         key: "asset1",
  //         percentage: new RatePretty(new Dec(400).quo(new Dec(1000))),
  //         fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(400)),
  //       },
  //       {
  //         key: "asset2",
  //         percentage: new RatePretty(new Dec(300).quo(new Dec(1000))),
  //         fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(300)),
  //       },
  //       {
  //         key: "asset3",
  //         percentage: new RatePretty(new Dec(200).quo(new Dec(1000))),
  //         fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(200)),
  //       },
  //       {
  //         key: "asset4",
  //         percentage: new RatePretty(new Dec(50).quo(new Dec(1000))),
  //         fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(50)),
  //       },
  //       {
  //         key: "asset5",
  //         percentage: new RatePretty(new Dec(30).quo(new Dec(1000))),
  //         fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(30)),
  //       },
  //       {
  //         key: "Other",
  //         percentage: new RatePretty(new Dec(20).quo(new Dec(1000))),
  //         fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(20)),
  //       },
  //     ]);
  //   });
  // });

  // describe("getAllocation", () => {
  //   it("should return the correct allocation response", async () => {
  //     const address = "test-address";
  //     const assetLists = [];

  //     const mockCategories = {
  //       "user-balances": { capitalization: "100" },
  //       staked: { capitalization: "200" },
  //       unstaking: { capitalization: "300" },
  //       "unclaimed-rewards": { capitalization: "400" },
  //       pooled: { capitalization: "500" },
  //       "total-assets": {
  //         capitalization: "1000",
  //         account_coins_result: [
  //           { coin: { denom: "asset1" }, cap_value: "400" },
  //           { coin: { denom: "asset2" }, cap_value: "300" },
  //           { coin: { denom: "asset3" }, cap_value: "200" },
  //           { coin: { denom: "asset4" }, cap_value: "50" },
  //           { coin: { denom: "asset5" }, cap_value: "30" },
  //           { coin: { denom: "asset6" }, cap_value: "20" },
  //         ],
  //       },
  //     };

  //     queryAllocation.mockResolvedValue({ categories: mockCategories });

  //     getAsset.mockImplementation(({ anyDenom }) => ({
  //       coinDenom: anyDenom,
  //     }));

  //     const result = await getAllocation({ address, assetLists });

  //     expect(result).toEqual({
  //       all: [
  //         {
  //           key: "available",
  //           percentage: new RatePretty(new Dec(100).quo(new Dec(1500))),
  //           fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(100)),
  //         },
  //         {
  //           key: "staked",
  //           percentage: new RatePretty(new Dec(200).quo(new Dec(1500))),
  //           fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(200)),
  //         },
  //         {
  //           key: "unstaking",
  //           percentage: new RatePretty(new Dec(300).quo(new Dec(1500))),
  //           fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(300)),
  //         },
  //         {
  //           key: "unclaimedRewards",
  //           percentage: new RatePretty(new Dec(400).quo(new Dec(1500))),
  //           fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(400)),
  //         },
  //         {
  //           key: "pooled",
  //           percentage: new RatePretty(new Dec(500).quo(new Dec(1500))),
  //           fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(500)),
  //         },
  //       ],
  //       assets: [
  //         {
  //           key: "asset1",
  //           percentage: new RatePretty(new Dec(400).quo(new Dec(1000))),
  //           fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(400)),
  //         },
  //         {
  //           key: "asset2",
  //           percentage: new RatePretty(new Dec(300).quo(new Dec(1000))),
  //           fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(300)),
  //         },
  //         {
  //           key: "asset3",
  //           percentage: new RatePretty(new Dec(200).quo(new Dec(1000))),
  //           fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(200)),
  //         },
  //         {
  //           key: "asset4",
  //           percentage: new RatePretty(new Dec(50).quo(new Dec(1000))),
  //           fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(50)),
  //         },
  //         {
  //           key: "asset5",
  //           percentage: new RatePretty(new Dec(30).quo(new Dec(1000))),
  //           fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(30)),
  //         },
  //         {
  //           key: "Other",
  //           percentage: new RatePretty(new Dec(20).quo(new Dec(1000))),
  //           fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(20)),
  //         },
  //       ],
  //       available: [
  //         {
  //           key: "asset1",
  //           percentage: new RatePretty(new Dec(400).quo(new Dec(1000))),
  //           fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(400)),
  //         },
  //         {
  //           key: "asset2",
  //           percentage: new RatePretty(new Dec(300).quo(new Dec(1000))),
  //           fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(300)),
  //         },
  //         {
  //           key: "asset3",
  //           percentage: new RatePretty(new Dec(200).quo(new Dec(1000))),
  //           fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(200)),
  //         },
  //         {
  //           key: "asset4",
  //           percentage: new RatePretty(new Dec(50).quo(new Dec(1000))),
  //           fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(50)),
  //         },
  //         {
  //           key: "asset5",
  //           percentage: new RatePretty(new Dec(30).quo(new Dec(1000))),
  //           fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(30)),
  //         },
  //         {
  //           key: "Other",
  //           percentage: new RatePretty(new Dec(20).quo(new Dec(1000))),
  //           fiatValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(20)),
  //         },
  //       ],
  //     });
  //   });
  // });
});
