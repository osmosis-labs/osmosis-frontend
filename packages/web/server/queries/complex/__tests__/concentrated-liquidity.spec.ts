import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { Currency } from "@osmosis-labs/types";
import cases from "jest-in-case";

import { getAsset } from "~/server/queries/complex/assets";

import { getClTickPrice, getPositionAsset } from "../concentrated-liquidity";

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
