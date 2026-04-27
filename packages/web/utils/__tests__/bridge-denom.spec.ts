import { CoinPretty } from "@osmosis-labs/unit";

import { isSameCoinDenom } from "~/utils/denom";

const ATOM_IBC_DENOM =
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";
const JUNO_IBC_DENOM =
  "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED";

const makeCoinPretty = (coinDenom: string, coinMinimalDenom: string) =>
  new CoinPretty(
    {
      coinDenom,
      coinMinimalDenom,
      coinDecimals: 6,
    },
    "0"
  );

describe("isSameCoinDenom", () => {
  it("treats source denom and IBC hash as the same asset", () => {
    expect(
      isSameCoinDenom(
        makeCoinPretty("ATOM", ATOM_IBC_DENOM),
        makeCoinPretty("ATOM", "uatom")
      )
    ).toBe(true);
    expect(
      isSameCoinDenom(
        makeCoinPretty("JUNO", JUNO_IBC_DENOM),
        makeCoinPretty("JUNO", "ujuno")
      )
    ).toBe(true);
  });

  it("is true for identical denoms", () => {
    expect(
      isSameCoinDenom(
        makeCoinPretty("ATOM", "uatom"),
        makeCoinPretty("ATOM", "uatom")
      )
    ).toBe(true);
    expect(
      isSameCoinDenom(
        makeCoinPretty("ATOM", ATOM_IBC_DENOM),
        makeCoinPretty("ATOM", ATOM_IBC_DENOM)
      )
    ).toBe(true);
  });

  it("is false for unrelated denoms", () => {
    expect(
      isSameCoinDenom(
        makeCoinPretty("ATOM", "uatom"),
        makeCoinPretty("JUNO", "ujuno")
      )
    ).toBe(false);
    expect(
      isSameCoinDenom(
        makeCoinPretty("ATOM", ATOM_IBC_DENOM),
        makeCoinPretty("JUNO", JUNO_IBC_DENOM)
      )
    ).toBe(false);
  });
});
