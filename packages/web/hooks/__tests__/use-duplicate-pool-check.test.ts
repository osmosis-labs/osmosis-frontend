import type { Pool } from "@osmosis-labs/server";
import { CoinPretty, Dec, PricePretty, RatePretty } from "@osmosis-labs/unit";

import {
  canonicalizeCLPair,
  canonicalizeDenoms,
  classifyMatches,
  type ProposedPool,
} from "../use-duplicate-pool-check";

const USDC = "ibc/USDC";
const ATOM = "ibc/ATOM";
const OSMO = "uosmo";
const USDC_OTHER_CHANNEL = "ibc/USDC-via-other-channel";

const usd = {
  currency: "usd",
  symbol: "$",
  maxDecimals: 2,
  locale: "en-US",
} as const;
const fiat = (n: number) => new PricePretty(usd, new Dec(n));

const tvl = (n: number): Pool["totalFiatValueLocked"] => fiat(n);
const spread = (s: string): RatePretty => new RatePretty(new Dec(s));

const baseFields = (id: string, tvlNumber: number) => ({
  id,
  spreadFactor: spread("0.003"),
  reserveCoins: [] as CoinPretty[],
  totalFiatValueLocked: tvl(tvlNumber),
});

function weightedPool(
  id: string,
  assets: Array<{ denom: string; weight: string }>,
  swapFee: string,
  tvlNumber = 100
): Pool {
  return {
    ...baseFields(id, tvlNumber),
    type: "weighted",
    raw: {
      id,
      pool_params: { swap_fee: swapFee, exit_fee: "0" },
      total_weight: assets
        .reduce((acc, a) => acc + Number(a.weight), 0)
        .toString(),
      total_shares: { denom: `gamm/pool/${id}`, amount: "0" },
      pool_assets: assets.map((a) => ({
        weight: a.weight,
        token: { denom: a.denom, amount: "0" },
      })),
    } as unknown as Pool["raw"],
  };
}

function stablePool(
  id: string,
  liquidity: Array<{ denom: string }>,
  scalingFactors: string[],
  swapFee = "0.003",
  tvlNumber = 100
): Pool {
  return {
    ...baseFields(id, tvlNumber),
    type: "stable",
    raw: {
      address: "",
      id,
      pool_params: { swap_fee: swapFee, exit_fee: "0" },
      future_pool_governor: "",
      total_shares: { denom: `gamm/pool/${id}`, amount: "0" },
      pool_liquidity: liquidity.map((l) => ({ denom: l.denom, amount: "0" })),
      scaling_factors: scalingFactors,
      scaling_factor_controller: "",
    } as unknown as Pool["raw"],
  };
}

function clPool(
  id: string,
  token0: string,
  token1: string,
  spreadFactor: string,
  tickSpacing = "100",
  tvlNumber = 100
): Pool {
  return {
    ...baseFields(id, tvlNumber),
    type: "concentrated",
    spreadFactor: spread(spreadFactor),
    raw: {
      address: "",
      incentives_address: "",
      spread_rewards_address: "",
      id,
      current_tick_liquidity: "0",
      token0,
      token1,
      current_sqrt_price: "0",
      current_tick: "0",
      tick_spacing: tickSpacing,
      exponent_at_price_one: "-6",
      spread_factor: spreadFactor,
      last_liquidity_update: "",
    } as unknown as Pool["raw"],
  };
}

describe("canonicalizeDenoms", () => {
  it("sorts lexicographically without mutating the input", () => {
    const input = ["b", "a", "c"];
    const output = canonicalizeDenoms(input);
    expect(output).toEqual(["a", "b", "c"]);
    expect(input).toEqual(["b", "a", "c"]);
  });
});

describe("canonicalizeCLPair", () => {
  it("returns ordered pair regardless of input order", () => {
    expect(canonicalizeCLPair(ATOM, OSMO)).toEqual({
      denom0: ATOM,
      denom1: OSMO,
    });
    expect(canonicalizeCLPair(OSMO, ATOM)).toEqual({
      denom0: ATOM,
      denom1: OSMO,
    });
  });
});

describe("classifyMatches — weighted", () => {
  const proposed: ProposedPool = {
    kind: "weighted",
    denoms: [ATOM, OSMO],
    weights: { [ATOM]: 50, [OSMO]: 50 },
    swapFee: "0.003",
  };

  it("flags a same-denoms + same-weights + same-fee pool as exact (denoms reordered)", () => {
    const candidates: Pool[] = [
      weightedPool(
        "1",
        [
          { denom: OSMO, weight: "50" },
          { denom: ATOM, weight: "50" },
        ],
        "0.003"
      ),
    ];
    const { exactMatches, similarMatches } = classifyMatches(
      proposed,
      candidates
    );
    expect(exactMatches).toHaveLength(1);
    expect(exactMatches[0].id).toBe("1");
    expect(similarMatches).toHaveLength(0);
  });

  it("flags same-denoms + different-weights as similar (not exact)", () => {
    const candidates: Pool[] = [
      weightedPool(
        "2",
        [
          { denom: ATOM, weight: "80" },
          { denom: OSMO, weight: "20" },
        ],
        "0.003"
      ),
    ];
    const { exactMatches, similarMatches } = classifyMatches(
      proposed,
      candidates
    );
    expect(exactMatches).toHaveLength(0);
    expect(similarMatches).toHaveLength(1);
  });

  it("flags same-denoms + same-weights + different-fee as similar", () => {
    const candidates: Pool[] = [
      weightedPool(
        "3",
        [
          { denom: ATOM, weight: "50" },
          { denom: OSMO, weight: "50" },
        ],
        "0.005"
      ),
    ];
    const { exactMatches, similarMatches } = classifyMatches(
      proposed,
      candidates
    );
    expect(exactMatches).toHaveLength(0);
    expect(similarMatches).toHaveLength(1);
  });

  // Cross-type "similar": a Balancer-proposed pool should surface an
  // existing Stable pool with the same denom set in the informational list.
  // The exact tier stays type-strict (the Stable pool can't be an exact
  // duplicate of a Balancer proposal), but "similar" widens to inform the
  // user that an alternative venue for the same pair already exists.
  it("flags a stable pool with the same denoms as similar (cross-type)", () => {
    const candidates: Pool[] = [
      stablePool("4", [{ denom: ATOM }, { denom: OSMO }], ["1", "1"], "0.003"),
    ];
    const { exactMatches, similarMatches } = classifyMatches(
      proposed,
      candidates
    );
    expect(exactMatches).toHaveLength(0);
    expect(similarMatches).toHaveLength(1);
    expect(similarMatches[0].id).toBe("4");
    expect(similarMatches[0].type).toBe("stable");
  });

  // Regression for pool 725 (OSMO/INJ): legacy Balancer pools store weights
  // as arbitrary integers scaled by total_weight (here 2^29 × 10^6 per
  // 50/50 side). User-entered "50%" must match these via ratio comparison,
  // not direct integer equality.
  it("matches legacy-scaled weights against percentage input (pool 725 case)", () => {
    const candidates: Pool[] = [
      weightedPool(
        "725",
        [
          { denom: OSMO, weight: "536870912000000" },
          { denom: ATOM, weight: "536870912000000" },
        ],
        "0.002"
      ),
    ];
    const proposed725: ProposedPool = {
      kind: "weighted",
      denoms: [ATOM, OSMO],
      weights: { [ATOM]: 50, [OSMO]: 50 },
      swapFee: "0.002",
    };
    const { exactMatches } = classifyMatches(proposed725, candidates);
    expect(exactMatches).toHaveLength(1);
    expect(exactMatches[0].id).toBe("725");
  });

  // Imbalanced legacy weights (e.g. 80/20 stored as 2^29 scaled) should
  // also match when the user enters the same percentages.
  it("matches legacy-scaled imbalanced weights against percentage input", () => {
    const candidates: Pool[] = [
      weightedPool(
        "1234",
        [
          // 80/20 split at the 2^29 × 10^6 scale (total = 1073741824000000).
          { denom: ATOM, weight: "858993459200000" }, // 80%
          { denom: OSMO, weight: "214748364800000" }, // 20%
        ],
        "0.003"
      ),
    ];
    const proposed8020: ProposedPool = {
      kind: "weighted",
      denoms: [ATOM, OSMO],
      weights: { [ATOM]: 80, [OSMO]: 20 },
      swapFee: "0.003",
    };
    const { exactMatches, similarMatches } = classifyMatches(
      proposed8020,
      candidates
    );
    expect(exactMatches).toHaveLength(1);
    expect(similarMatches).toHaveLength(0);
  });
});

describe("classifyMatches — stable", () => {
  const proposed: ProposedPool = {
    kind: "stable",
    denoms: [ATOM, OSMO],
    scalingFactors: { [ATOM]: 1, [OSMO]: 1 },
    swapFee: "0.0001",
  };

  it("flags identical denoms + identical scaling factors as exact", () => {
    const candidates: Pool[] = [
      stablePool("1", [{ denom: OSMO }, { denom: ATOM }], ["1", "1"], "0.0001"),
    ];
    const { exactMatches, similarMatches } = classifyMatches(
      proposed,
      candidates
    );
    expect(exactMatches).toHaveLength(1);
    expect(exactMatches[0].id).toBe("1");
    expect(similarMatches).toHaveLength(0);
  });

  it("flags identical denoms + different scaling factors as similar", () => {
    const candidates: Pool[] = [
      stablePool(
        "2",
        [{ denom: ATOM }, { denom: OSMO }],
        ["1000000", "1"],
        "0.0001"
      ),
    ];
    const { exactMatches, similarMatches } = classifyMatches(
      proposed,
      candidates
    );
    expect(exactMatches).toHaveLength(0);
    expect(similarMatches).toHaveLength(1);
  });
});

describe("classifyMatches — concentrated", () => {
  const proposed: ProposedPool = {
    kind: "concentrated",
    denom0: OSMO,
    denom1: ATOM, // user-input order intentionally reversed vs canonical
    spreadFactor: "0.001000000000000000",
    tickSpacing: 100,
  };

  it("flags an existing pool with reversed (token0, token1) and same spread factor as exact", () => {
    const candidates: Pool[] = [
      // Existing pool stored canonically (ATOM, OSMO).
      clPool("1", ATOM, OSMO, "0.001000000000000000", "100"),
    ];
    const { exactMatches, similarMatches } = classifyMatches(
      proposed,
      candidates
    );
    expect(exactMatches).toHaveLength(1);
    expect(exactMatches[0].id).toBe("1");
    expect(similarMatches).toHaveLength(0);
  });

  it("flags same pair + different spread factor as similar", () => {
    const candidates: Pool[] = [
      clPool("2", ATOM, OSMO, "0.002000000000000000", "100"),
    ];
    const { exactMatches, similarMatches } = classifyMatches(
      proposed,
      candidates
    );
    expect(exactMatches).toHaveLength(0);
    expect(similarMatches).toHaveLength(1);
  });

  it("treats trailing-zero spread factor differences as equal", () => {
    const candidates: Pool[] = [
      // "0.001" vs "0.001000000000000000" — Dec equality should accept this.
      clPool("3", ATOM, OSMO, "0.001", "100"),
    ];
    const { exactMatches } = classifyMatches(proposed, candidates);
    expect(exactMatches).toHaveLength(1);
  });

  // Cross-type "similar": a CL-proposed pool surfaces an existing Balancer
  // pool with the same denom set in the informational list.
  it("flags a weighted pool with the same denoms as similar (cross-type)", () => {
    const candidates: Pool[] = [
      weightedPool(
        "balancer-xtype",
        [
          { denom: ATOM, weight: "50" },
          { denom: OSMO, weight: "50" },
        ],
        "0.003"
      ),
    ];
    const { exactMatches, similarMatches } = classifyMatches(
      proposed,
      candidates
    );
    expect(exactMatches).toHaveLength(0);
    expect(similarMatches).toHaveLength(1);
    expect(similarMatches[0].id).toBe("balancer-xtype");
    expect(similarMatches[0].type).toBe("weighted");
  });
});

describe("classifyMatches — IBC same-symbol distinct denoms", () => {
  it("does not match pools with different coinMinimalDenom even if symbol would be the same", () => {
    const proposed: ProposedPool = {
      kind: "weighted",
      denoms: [USDC, OSMO],
      weights: { [USDC]: 50, [OSMO]: 50 },
      swapFee: "0.003",
    };
    const candidates: Pool[] = [
      weightedPool(
        "1",
        [
          { denom: USDC_OTHER_CHANNEL, weight: "50" },
          { denom: OSMO, weight: "50" },
        ],
        "0.003"
      ),
    ];
    const { exactMatches, similarMatches } = classifyMatches(
      proposed,
      candidates
    );
    expect(exactMatches).toHaveLength(0);
    expect(similarMatches).toHaveLength(0);
  });
});

describe("classifyMatches — no candidates", () => {
  it("returns empty arrays", () => {
    const proposed: ProposedPool = {
      kind: "weighted",
      denoms: [ATOM, OSMO],
      weights: { [ATOM]: 50, [OSMO]: 50 },
      swapFee: "0.003",
    };
    const { exactMatches, similarMatches } = classifyMatches(proposed, []);
    expect(exactMatches).toEqual([]);
    expect(similarMatches).toEqual([]);
  });
});

describe("classifyMatches — TVL ordering", () => {
  it("sorts both buckets by descending TVL", () => {
    const proposed: ProposedPool = {
      kind: "weighted",
      denoms: [ATOM, OSMO],
      weights: { [ATOM]: 50, [OSMO]: 50 },
      swapFee: "0.003",
    };
    const candidates: Pool[] = [
      weightedPool(
        "low-exact",
        [
          { denom: ATOM, weight: "50" },
          { denom: OSMO, weight: "50" },
        ],
        "0.003",
        10
      ),
      weightedPool(
        "high-exact",
        [
          { denom: ATOM, weight: "50" },
          { denom: OSMO, weight: "50" },
        ],
        "0.003",
        1000
      ),
      weightedPool(
        "low-similar",
        [
          { denom: ATOM, weight: "80" },
          { denom: OSMO, weight: "20" },
        ],
        "0.003",
        5
      ),
      weightedPool(
        "high-similar",
        [
          { denom: ATOM, weight: "80" },
          { denom: OSMO, weight: "20" },
        ],
        "0.003",
        500
      ),
    ];
    const { exactMatches, similarMatches } = classifyMatches(
      proposed,
      candidates
    );
    expect(exactMatches.map((m) => m.id)).toEqual(["high-exact", "low-exact"]);
    expect(similarMatches.map((m) => m.id)).toEqual([
      "high-similar",
      "low-similar",
    ]);
  });
});
