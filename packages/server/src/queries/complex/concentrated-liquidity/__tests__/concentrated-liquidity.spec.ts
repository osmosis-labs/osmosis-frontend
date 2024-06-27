import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import cases from "jest-in-case";

import { calcPositionStatus, getPriceFromSqrtPrice, getTickPrice } from "..";

jest.mock("../../assets");

cases(
  "getClTickPrice",
  ({ tick, baseAsset, quoteAsset, expected }) => {
    const result = getTickPrice({
      tick,
      baseCoin: baseAsset,
      quoteCoin: quoteAsset,
    });
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
        new Dec("19625941315833311")
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
        new Dec("19625941315833311")
      ),
      expected: new Dec("100000000000000000000000000"),
    },
  ]
);

cases(
  "getPriceFromSqrtPrice",
  ({ sqrtPrice, baseAsset, quoteAsset, expected }) => {
    const result = getPriceFromSqrtPrice({
      sqrtPrice,
      baseCoin: baseAsset,
      quoteCoin: quoteAsset,
    });
    expect(result.toString()).toEqual(expected);
  },
  [
    {
      name: "should return correct price for given sqrtPrice and assets - case 1",
      sqrtPrice: new Dec("1161983.14366067570700148679299597079855642"),
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
      expected: "1.350204826151546518",
    },
    {
      name: "should return correct price for given sqrtPrice and assets - case 2",
      sqrtPrice: new Dec("0.39300548668001036940254010993077268"),
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
      expected: "0.154453312560591808",
    },
  ]
);

cases(
  "calcPositionStatus",
  ({ args, expected }) => {
    const result = calcPositionStatus(args);
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
        isSuperfluidStaked: false,
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
        isSuperfluidStaked: false,
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
        isSuperfluidStaked: true,
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
        isSuperfluidStaked: false,
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
        isSuperfluidStaked: false,
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
        isSuperfluidStaked: false,
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
        isSuperfluidStaked: false,
        isSuperfluidUnstaking: false,
        isUnbonding: false,
      },
      expected: "outOfRange",
    },
  ]
);
