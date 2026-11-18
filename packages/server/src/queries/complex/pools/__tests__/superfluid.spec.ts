import { Dec } from "@osmosis-labs/unit";

import {
  calcOsmoStakingAprPercent,
  getPoolOsmoEquivalentMultiplier,
} from "../superfluid";

describe("calcOsmoStakingAprPercent", () => {
  const base = {
    // 821,917.808219178 OSMO per epoch
    epochProvisions: "821917808219.178082191780821917",
    stakingProportion: "0.25",
    epochDurationSeconds: 86400,
    // 40M OSMO bonded of the assumed 100M supply
    bondedTokens: "40000000000000",
    communityTax: "0",
    stakeDecimals: 6,
  };

  it("annualizes the truncated staking share of epoch provisions", () => {
    // trunc(821917.808219 * 0.25) = 205479 OSMO/day
    // 205479 * 365 / 100M = 74.999835%, / 0.4 bonded = 187.4995875%
    expect(calcOsmoStakingAprPercent(base).toString()).toBe(
      new Dec("187.4995875").toString()
    );
  });

  it("deducts the community tax", () => {
    expect(
      calcOsmoStakingAprPercent({ ...base, communityTax: "0.1" }).toString()
    ).toBe(new Dec("168.74962875").toString());
  });

  it("returns zero without an epoch duration or bonded tokens", () => {
    expect(
      calcOsmoStakingAprPercent({ ...base, epochDurationSeconds: 0 }).isZero()
    ).toBe(true);
    expect(
      calcOsmoStakingAprPercent({ ...base, bondedTokens: "0" }).isZero()
    ).toBe(true);
  });
});

describe("getPoolOsmoEquivalentMultiplier", () => {
  const osmoDenom = "uosmo";
  const minimumRiskFactor = new Dec("0.5");

  it("uses the OSMO weight of weighted pools", () => {
    const pool = {
      type: "weighted",
      raw: {
        total_weight: "2",
        pool_assets: [
          { weight: "1", token: { denom: "uosmo", amount: "1" } },
          { weight: "1", token: { denom: "uatom", amount: "1" } },
        ],
      },
    } as any;

    expect(
      getPoolOsmoEquivalentMultiplier({ pool, osmoDenom, minimumRiskFactor })
    ).toEqual(new Dec("0.25"));
  });

  it("uses the OSMO scaling factor of stable pools", () => {
    const pool = {
      type: "stable",
      raw: {
        pool_liquidity: [
          { denom: "uatom", amount: "1" },
          { denom: "uosmo", amount: "1" },
        ],
        scaling_factors: ["3", "1"],
      },
    } as any;

    // 0.5 * (1 / 3) * 0.5
    expect(
      getPoolOsmoEquivalentMultiplier({
        pool,
        osmoDenom,
        minimumRiskFactor,
      }).toString()
    ).toBe(new Dec(1).quo(new Dec(12)).toString());
  });

  it("assumes a 1:1 split for concentrated pools with OSMO", () => {
    const pool = {
      type: "concentrated",
      raw: { token0: "uatom", token1: "uosmo" },
    } as any;

    expect(
      getPoolOsmoEquivalentMultiplier({ pool, osmoDenom, minimumRiskFactor })
    ).toEqual(new Dec("0.25"));
  });

  it("is zero for pools without OSMO or of other types", () => {
    expect(
      getPoolOsmoEquivalentMultiplier({
        pool: {
          type: "concentrated",
          raw: { token0: "uatom", token1: "uusdc" },
        } as any,
        osmoDenom,
        minimumRiskFactor,
      }).isZero()
    ).toBe(true);
    expect(
      getPoolOsmoEquivalentMultiplier({
        pool: { type: "cosmwasm-transmuter", raw: {} } as any,
        osmoDenom,
        minimumRiskFactor,
      }).isZero()
    ).toBe(true);
  });
});
