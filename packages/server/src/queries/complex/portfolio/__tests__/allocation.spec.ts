import { Dec } from "@keplr-wallet/unit";
import { Asset } from "@osmosis-labs/types";

import { AssetLists as assetLists } from "../../../__tests__/mock-asset-lists";
import { AllocationResponse } from "../../../sidecar/allocation";
import { calculatePercentAndFiatValues, getAll } from "../allocation";
import { checkAssetVariants } from "../allocation";

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
});

const ASSET_OSMO: Asset = {
  chainName: "osmosis",
  sourceDenom: "uosmo",
  coinMinimalDenom: "uosmo",
  symbol: "OSMO",
  decimals: 6,
  logoURIs: {
    png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png",
    svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg",
  },
  coingeckoId: "osmosis",
  price: {
    poolId: "1464",
    denom:
      "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
  },
  categories: ["defi"],
  transferMethods: [],
  counterparty: [],
  variantGroupKey: "uosmo",
  name: "Osmosis",
  isAlloyed: false,
  verified: true,
  unstable: false,
  disabled: false,
  preview: false,
  relative_image_url: "/tokens/generated/osmo.svg",
};

const ASSET_SAIL: Asset = {
  chainName: "osmosis",
  sourceDenom:
    "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail",
  coinMinimalDenom:
    "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail",
  symbol: "SAIL",
  decimals: 6,
  logoURIs: {
    png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/sail.png",
  },
  coingeckoId: "sail-dao",
  price: {
    poolId: "1745",
    denom: "uosmo",
  },
  categories: ["sail_initiative"],
  transferMethods: [],
  counterparty: [],
  variantGroupKey:
    "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail",
  name: "Sail",
  isAlloyed: false,
  verified: true,
  unstable: false,
  disabled: false,
  preview: false,
  listingDate: "2024-03-14T22:20:00.000Z",
  relative_image_url: "/tokens/generated/sail.png",
};

const ASSET_ETH_AXL: Asset = {
  chainName: "axelar",
  sourceDenom: "weth-wei",
  coinMinimalDenom:
    "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
  symbol: "ETH.axl",
  decimals: 18,
  logoURIs: {
    png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/eth.axl.png",
    svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/eth.axl.svg",
  },
  price: {
    poolId: "1431",
    denom:
      "ibc/2F21E6D4271DE3F561F20A02CD541DAF7405B1E9CB3B9B07E3C2AC7D8A4338A5",
  },
  categories: [],
  transferMethods: [
    {
      name: "Satellite",
      type: "external_interface",
      depositUrl:
        "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=weth-wei",
      withdrawUrl:
        "https://satellite.money/?source=osmosis&destination=ethereum&asset_denom=weth-wei",
    },
    {
      name: "Osmosis IBC Transfer",
      type: "ibc",
      counterparty: {
        chainName: "axelar",
        chainId: "axelar-dojo-1",
        sourceDenom: "weth-wei",
        port: "transfer",
        channelId: "channel-3",
      },
      chain: {
        port: "transfer",
        channelId: "channel-208",
        path: "transfer/channel-208/weth-wei",
      },
    },
  ],
  counterparty: [
    {
      chainName: "axelar",
      sourceDenom: "weth-wei",
      chainType: "cosmos",
      chainId: "axelar-dojo-1",
      symbol: "WETH",
      decimals: 18,
      logoURIs: {
        png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/weth.png",
      },
    },
    {
      chainName: "ethereum",
      sourceDenom: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      chainType: "evm",
      chainId: 1,
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      symbol: "WETH",
      decimals: 18,
      logoURIs: {
        svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/weth.svg",
      },
    },
    {
      chainName: "ethereum",
      sourceDenom: "wei",
      chainType: "evm",
      chainId: 1,
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      symbol: "ETH",
      decimals: 18,
      logoURIs: {
        png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png",
        svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.svg",
      },
    },
  ],
  variantGroupKey:
    "factory/osmo1k6c8jln7ejuqwtqmay3yvzrg3kueaczl96pk067ldg8u835w0yhsw27twm/alloyed/allETH",
  name: "Ethereum (Axelar)",
  isAlloyed: false,
  verified: true,
  unstable: false,
  disabled: false,
  preview: false,
  sortWith: {
    chainName: "axelar",
    sourceDenom: "uaxl",
  },
  relative_image_url: "/tokens/generated/eth.axl.svg",
};

describe("Has Asset Variants", () => {
  it("should return true when there are asset variants", () => {
    const userCoinMinimalDenoms = [
      {
        denom:
          "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4", // OSMO
        amount: new Dec(0.2),
      },
      {
        denom:
          "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail", // SAIL
        amount: new Dec(0.2),
      },
      {
        denom:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5", // ETH.axl <- this is the variant
        amount: new Dec(0.2),
      },
    ];
    const assetListAssets: Asset[] = [
      ASSET_OSMO, // OSMO
      ASSET_SAIL, // SAIL
      ASSET_ETH_AXL, // <- this is the variant
    ];

    const result = checkAssetVariants(
      // @ts-ignore
      userCoinMinimalDenoms,
      assetListAssets,
      assetLists
    );
    expect(result.length).toBe(1);
  });

  it("should return false when there are no asset variants", () => {
    const userCoinMinimalDenoms = [
      {
        denom:
          "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4", // OSMO
        amount: new Dec(0.2),
      },
      {
        denom:
          "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail", // SAIL
        amount: new Dec(0.2),
      },
    ];
    const assetListAssets: Asset[] = [
      ASSET_OSMO, // OSMO
      ASSET_SAIL, // SAIL
    ];

    // TODO - update tests
    // @ts-ignore
    const result = checkAssetVariants(
      // @ts-ignore
      userCoinMinimalDenoms,
      assetListAssets,
      assetLists
    );
    expect(result.length).toBe(0);
  });

  it("should return empty array when user has no asset variants", () => {
    const userCoinMinimalDenoms: { denom: string; amount: Dec }[] = [];
    const assetListAssets: Asset[] = [
      ASSET_OSMO, // OSMO
      ASSET_SAIL, // SAIL
    ];

    // TODO - update tests
    // @ts-ignore
    const result = checkAssetVariants(
      // @ts-ignore
      userCoinMinimalDenoms,
      assetListAssets,
      assetLists
    );
    expect(result.length).toBe(0);
  });
});
