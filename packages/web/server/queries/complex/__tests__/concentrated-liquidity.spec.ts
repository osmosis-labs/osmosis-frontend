import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { Currency } from "@osmosis-labs/types";
import cases from "jest-in-case";

import {
  getAsset,
  mapRawAssetsToCoinPretty,
} from "~/server/queries/complex/assets";

import {
  getClTickPrice,
  getPositionAsset,
  getPositionStatus,
  getPriceFromSqrtPrice,
  getTotalClaimableRewards,
  getTotalEarned,
} from "../concentrated-liquidity";

jest.mock("~/server/queries/complex/assets");

describe("getPositionAsset", () => {
  it("should return a CoinPretty object for valid denoms", async () => {
    const mockAsset = {
      coinDecimals: 0,
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
    } as Currency;
    (getAsset as jest.Mock).mockResolvedValue(mockAsset);

    const result = await getPositionAsset({ amount: "100", denom: "OSMO" });
    expect(result).toBeInstanceOf(CoinPretty);
    expect(result?.toString()).toBe("100 OSMO");
  });

  it("should throw an error for invalid denoms", async () => {
    (getAsset as jest.Mock).mockResolvedValue(null);

    await expect(
      getPositionAsset({ amount: "100", denom: "INVALID" })
    ).rejects.toThrow("Asset not found INVALID");
  });

  it("should return undefined if amount or denom is not provided", async () => {
    const result = await getPositionAsset({
      amount: null as any,
      denom: "OSMO",
    });
    expect(result).toBeUndefined();
  });
});

cases(
  "getClTickPrice",
  ({ tick, baseAsset, quoteAsset, expected }) => {
    const result = getClTickPrice({ tick, baseAsset, quoteAsset });
    expect(result.toString()).toEqual(expected.toString());
  },
  [
    {
      name: "should return correct price for given tick and assets - case 1",
      tick: new Int(-108000000),
      baseAsset: new CoinPretty(
        { coinDenom: "OSMO", coinDecimals: 6, coinMinimalDenom: "uosmo" },
        new Dec(13485)
      ),
      quoteAsset: new CoinPretty(
        {
          coinDenom: "DAI",
          coinDecimals: 18,
          coinMinimalDenom:
            "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
        },
        new Dec(19625941315833311)
      ),
      expected: new Dec(0),
    },
    {
      name: "should return correct price for given tick and assets - case 2",
      tick: new Int(342000000),
      baseAsset: new CoinPretty(
        { coinDenom: "OSMO", coinDecimals: 6, coinMinimalDenom: "uosmo" },
        new Dec(13485)
      ),
      quoteAsset: new CoinPretty(
        {
          coinDenom: "DAI",
          coinDecimals: 18,
          coinMinimalDenom:
            "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
        },
        new Dec(19625941315833311)
      ),
      expected: new Dec(100000000000000000000000000),
    },
  ]
);

cases(
  "getPriceFromSqrtPrice",
  ({ sqrtPrice, baseAsset, quoteAsset, expected }) => {
    const result = getPriceFromSqrtPrice({ sqrtPrice, baseAsset, quoteAsset });
    expect(result.toString()).toEqual(expected);
  },
  [
    {
      name: "should return correct price for given sqrtPrice and assets - case 1",
      sqrtPrice: new Dec(1161983.14366067570700148679299597079855642),
      baseAsset: new CoinPretty(
        { coinDenom: "OSMO", coinDecimals: 6, coinMinimalDenom: "uosmo" },
        new Dec(13757)
      ),
      quoteAsset: new CoinPretty(
        {
          coinDenom: "DAI",
          coinDecimals: 18,
          coinMinimalDenom:
            "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
        },
        new Dec(19238477906381960)
      ),
      expected: "1.350204826151546502",
    },
    {
      name: "should return correct price for given sqrtPrice and assets - case 2",
      sqrtPrice: new Dec(0.39300548668001036940254010993077268),
      baseAsset: new CoinPretty(
        { coinDenom: "OSMO", coinDecimals: 6, coinMinimalDenom: "uosmo" },
        new Dec(29278)
      ),
      quoteAsset: new CoinPretty(
        {
          coinDenom: "ATOM",
          coinDecimals: 6,
          coinMinimalDenom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        new Dec(0)
      ),
      expected: "0.154453312560591832",
    },
  ]
);

cases(
  "getTotalClaimableRewards",
  async ({ claimedIncentives, claimableSpreadRewards, expected }) => {
    const dai: Currency = {
      coinDenom: "DAI",
      coinDecimals: 18,
      coinMinimalDenom:
        "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
    };
    const osmo: Currency = {
      coinDenom: "OSMO",
      coinDecimals: 6,
      coinMinimalDenom: "uosmo",
    };
    const atom: Currency = {
      coinDenom: "ATOM",
      coinDecimals: 6,
      coinMinimalDenom:
        "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
    };

    (mapRawAssetsToCoinPretty as jest.Mock).mockImplementation(
      ({ rawAssets }) =>
        rawAssets.map((asset: { denom: string; amount: string }) => {
          if (
            asset.denom ===
            "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7"
          ) {
            return new CoinPretty(dai, asset.amount);
          }

          if (
            asset.denom ===
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2"
          ) {
            return new CoinPretty(atom, asset.amount);
          }

          return new CoinPretty(osmo, asset.amount);
        })
    );

    const result = await getTotalClaimableRewards({
      rawClaimableIncentiveRewards: claimedIncentives,
      rawClaimableSpreadRewards: claimableSpreadRewards,
    });

    expect(result.map((r) => r.toString())).toEqual(
      expected.map((e) => e.toString())
    );
  },
  [
    {
      name: "should calculate total claimable rewards correctly with DAI and OSMO - case 1",
      claimedIncentives: [{ denom: "uosmo", amount: "176" }],
      claimableSpreadRewards: [
        {
          denom:
            "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
          amount: "223802805273552",
        },
        { denom: "uosmo", amount: "314" },
      ],
      expected: [
        new CoinPretty(
          {
            coinDenom: "DAI",
            coinDecimals: 18,
            coinMinimalDenom:
              "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
          },
          223802805273552
        ),
        new CoinPretty(
          { coinDenom: "OSMO", coinDecimals: 6, coinMinimalDenom: "uosmo" },
          490
        ),
      ],
    },
    {
      name: "should calculate total claimable rewards correctly with ATOM and OSMO - case 2",
      claimedIncentives: [{ denom: "uosmo", amount: "10" }],
      claimableSpreadRewards: [
        {
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          amount: "2",
        },
        { denom: "uosmo", amount: "35" },
      ],
      expected: [
        new CoinPretty(
          {
            coinDenom: "ATOM",
            coinDecimals: 6,
            coinMinimalDenom:
              "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          },
          new Dec(2)
        ),
        new CoinPretty(
          { coinDenom: "OSMO", coinDecimals: 6, coinMinimalDenom: "uosmo" },
          new Dec(45)
        ),
      ],
    },
    {
      name: "should calculate total claimable rewards correctly with only OSMO - case 3",
      claimedIncentives: [{ denom: "uosmo", amount: "1" }],
      claimableSpreadRewards: [{ denom: "uosmo", amount: "6" }],
      expected: [
        new CoinPretty(
          { coinDenom: "OSMO", coinDecimals: 6, coinMinimalDenom: "uosmo" },
          new Dec(7)
        ),
      ],
    },
  ]
);

cases(
  "getPriceFromSqrtPrice",
  ({ sqrtPrice, baseAsset, quoteAsset, expected }) => {
    const result = getPriceFromSqrtPrice({ sqrtPrice, baseAsset, quoteAsset });
    expect(result.toString()).toEqual(expected);
  },
  [
    {
      name: "should return correct price for given sqrtPrice and assets - case 1",
      sqrtPrice: new Dec(1161983.14366067570700148679299597079855642),
      baseAsset: new CoinPretty(
        { coinDenom: "OSMO", coinDecimals: 6, coinMinimalDenom: "uosmo" },
        new Dec(13757)
      ),
      quoteAsset: new CoinPretty(
        {
          coinDenom: "DAI",
          coinDecimals: 18,
          coinMinimalDenom:
            "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
        },
        new Dec(19238477906381960)
      ),
      expected: "1.350204826151546502",
    },
    {
      name: "should return correct price for given sqrtPrice and assets - case 2",
      sqrtPrice: new Dec(0.39300548668001036940254010993077268),
      baseAsset: new CoinPretty(
        { coinDenom: "OSMO", coinDecimals: 6, coinMinimalDenom: "uosmo" },
        new Dec(29278)
      ),
      quoteAsset: new CoinPretty(
        {
          coinDenom: "ATOM",
          coinDecimals: 6,
          coinMinimalDenom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        },
        new Dec(0)
      ),
      expected: "0.154453312560591832",
    },
  ]
);

const dai: Currency = {
  coinDenom: "DAI",
  coinDecimals: 18,
  coinMinimalDenom:
    "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
};
const osmo: Currency = {
  coinDenom: "OSMO",
  coinDecimals: 6,
  coinMinimalDenom: "uosmo",
};
const atom: Currency = {
  coinDenom: "ATOM",
  coinDecimals: 6,
  coinMinimalDenom:
    "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
};

cases(
  "getTotalClaimableRewards",
  async ({ claimedIncentives, claimableSpreadRewards, expected }) => {
    (mapRawAssetsToCoinPretty as jest.Mock).mockImplementation(
      ({ rawAssets }) =>
        rawAssets.map((asset: { denom: string; amount: string }) => {
          if (asset.denom === dai.coinMinimalDenom) {
            return new CoinPretty(dai, asset.amount);
          }

          if (asset.denom === atom.coinMinimalDenom) {
            return new CoinPretty(atom, asset.amount);
          }

          return new CoinPretty(osmo, asset.amount);
        })
    );

    const result = await getTotalClaimableRewards({
      rawClaimableIncentiveRewards: claimedIncentives,
      rawClaimableSpreadRewards: claimableSpreadRewards,
    });

    expect(result.map((r) => r.toString())).toEqual(
      expected.map((e) => e.toString())
    );
  },
  [
    {
      name: "should calculate total claimable rewards correctly with DAI and OSMO - case 1",
      claimedIncentives: [{ denom: "uosmo", amount: "176" }],
      claimableSpreadRewards: [
        {
          denom:
            "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
          amount: "223802805273552",
        },
        { denom: "uosmo", amount: "314" },
      ],
      expected: [
        new CoinPretty(
          {
            coinDenom: "DAI",
            coinDecimals: 18,
            coinMinimalDenom:
              "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
          },
          223802805273552
        ),
        new CoinPretty(
          { coinDenom: "OSMO", coinDecimals: 6, coinMinimalDenom: "uosmo" },
          490
        ),
      ],
    },
    {
      name: "should calculate total claimable rewards correctly with ATOM and OSMO - case 2",
      claimedIncentives: [{ denom: "uosmo", amount: "10" }],
      claimableSpreadRewards: [
        {
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          amount: "2",
        },
        { denom: "uosmo", amount: "35" },
      ],
      expected: [
        new CoinPretty(
          {
            coinDenom: "ATOM",
            coinDecimals: 6,
            coinMinimalDenom:
              "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          },
          new Dec(2)
        ),
        new CoinPretty(
          { coinDenom: "OSMO", coinDecimals: 6, coinMinimalDenom: "uosmo" },
          new Dec(45)
        ),
      ],
    },
    {
      name: "should calculate total claimable rewards correctly with only OSMO - case 3",
      claimedIncentives: [{ denom: "uosmo", amount: "1" }],
      claimableSpreadRewards: [{ denom: "uosmo", amount: "6" }],
      expected: [
        new CoinPretty(
          { coinDenom: "OSMO", coinDecimals: 6, coinMinimalDenom: "uosmo" },
          new Dec(7)
        ),
      ],
    },
  ]
);

cases(
  "getTotalEarned",
  async ({ totalIncentivesRewards, totalSpreadRewards, expected }) => {
    (mapRawAssetsToCoinPretty as jest.Mock).mockImplementation(
      ({ rawAssets }) =>
        rawAssets.map((asset: { denom: string; amount: string }) => {
          if (asset.denom === dai.coinMinimalDenom) {
            return new CoinPretty(dai, asset.amount);
          }

          if (asset.denom === atom.coinMinimalDenom) {
            return new CoinPretty(atom, asset.amount);
          }

          return new CoinPretty(osmo, asset.amount);
        })
    );

    const result = await getTotalEarned({
      totalIncentivesRewards,
      totalSpreadRewards,
    });

    expect(result.map((r) => r.toString())).toEqual(
      expected.map((e) => e.toString())
    );
  },
  [
    {
      name: "should calculate total claimable rewards correctly with DAI and OSMO - case 1",
      totalIncentivesRewards: [
        {
          denom: "uosmo",
          amount: "179",
        },
      ],
      totalSpreadRewards: [
        {
          denom:
            "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
          amount: "22803304823698",
        },
        {
          denom: "uosmo",
          amount: "61",
        },
      ],
      expected: [
        new CoinPretty(
          {
            coinDenom: "DAI",
            coinDecimals: 18,
            coinMinimalDenom:
              "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
          },
          22803304823698
        ),
        new CoinPretty(
          { coinDenom: "OSMO", coinDecimals: 6, coinMinimalDenom: "uosmo" },
          240
        ),
      ],
    },
    {
      name: "should calculate total claimable rewards correctly with ATOM and OSMO - case 2",
      totalIncentivesRewards: [],
      totalSpreadRewards: [],
      expected: [],
    },
  ]
);

cases(
  "getPositionStatus",
  ({ args, expected }) => {
    const result = getPositionStatus(args);
    expect(result).toEqual(expected);
  },
  [
    {
      name: "Full range",
      args: {
        lowerPrice: new Dec(0),
        upperPrice: new Dec(100),
        currentPrice: new Dec(50),
        isFullRange: true,
        isSuperfluid: false,
        isSuperfluidUnstaking: false,
        isUnbonding: false,
      },
      expected: "fullRange",
    },
    {
      name: "Unbonding",
      args: {
        lowerPrice: new Dec(0),
        upperPrice: new Dec(100),
        currentPrice: new Dec(50),
        isFullRange: false,
        isSuperfluid: false,
        isSuperfluidUnstaking: false,
        isUnbonding: true,
      },
      expected: "unbonding",
    },
    {
      name: "Superfluid staked",
      args: {
        lowerPrice: new Dec(0),
        upperPrice: new Dec(100),
        currentPrice: new Dec(50),
        isFullRange: false,
        isSuperfluid: true,
        isSuperfluidUnstaking: false,
        isUnbonding: false,
      },
      expected: "superfluidStaked",
    },
    {
      name: "Superfluid unstaking",
      args: {
        lowerPrice: new Dec(0),
        upperPrice: new Dec(100),
        currentPrice: new Dec(50),
        isFullRange: false,
        isSuperfluid: false,
        isSuperfluidUnstaking: true,
        isUnbonding: false,
      },
      expected: "superfluidUnstaking",
    },
    {
      name: "In range",
      args: {
        lowerPrice: new Dec(0),
        upperPrice: new Dec(100),
        currentPrice: new Dec(50),
        isFullRange: false,
        isSuperfluid: false,
        isSuperfluidUnstaking: false,
        isUnbonding: false,
      },
      expected: "inRange",
    },
    {
      name: "Near bounds",
      args: {
        lowerPrice: new Dec(0),
        upperPrice: new Dec(100),
        currentPrice: new Dec(15),
        isFullRange: false,
        isSuperfluid: false,
        isSuperfluidUnstaking: false,
        isUnbonding: false,
      },
      expected: "nearBounds",
    },
    {
      name: "Out of range",
      args: {
        lowerPrice: new Dec(0),
        upperPrice: new Dec(100),
        currentPrice: new Dec(101),
        isFullRange: false,
        isSuperfluid: false,
        isSuperfluidUnstaking: false,
        isUnbonding: false,
      },
      expected: "outOfRange",
    },
  ]
);
