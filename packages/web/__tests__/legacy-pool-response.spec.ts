import {
  CONCENTRATED_LIQ_POOL_TYPE,
  COSMWASM_POOL_TYPE,
  Pool,
  STABLE_POOL_TYPE,
  WEIGHTED_POOL_TYPE,
} from "@osmosis-labs/server";

import { toLegacyPoolResponse } from "~/server/api/legacy-pool-response";

// Minimal fixture: toLegacyPoolResponse only reads `type` and spreads `raw`.
function makePool(type: Pool["type"], raw: Record<string, unknown>) {
  return { id: raw.id ?? "1", type, raw } as unknown as Pool;
}

describe("toLegacyPoolResponse", () => {
  it("maps weighted pools to the gamm balancer type url", () => {
    const res = toLegacyPoolResponse(
      makePool("weighted", { id: "1", pool_params: { swap_fee: "0.002" } })
    );

    expect(res["@type"]).toBe(WEIGHTED_POOL_TYPE);
    expect(res).toEqual({
      "@type": WEIGHTED_POOL_TYPE,
      id: "1",
      pool_params: { swap_fee: "0.002" },
    });
  });

  it("maps stable pools to the stableswap type url", () => {
    const res = toLegacyPoolResponse(
      makePool("stable", { id: "833", scaling_factors: ["1", "1"] })
    );

    expect(res["@type"]).toBe(STABLE_POOL_TYPE);
    expect(res).toMatchObject({ id: "833", scaling_factors: ["1", "1"] });
  });

  it("maps concentrated pools to the concentrated liquidity type url", () => {
    const res = toLegacyPoolResponse(
      makePool("concentrated", { id: "1251", current_tick: "-108000000" })
    );

    expect(res["@type"]).toBe(CONCENTRATED_LIQ_POOL_TYPE);
    expect(res).toMatchObject({ id: "1251", current_tick: "-108000000" });
  });

  it("maps every cosmwasm pool variant to the cosmwasm type url", () => {
    const cosmwasmTypes: Pool["type"][] = [
      "cosmwasm",
      "cosmwasm-transmuter",
      "cosmwasm-astroport-pcl",
      "cosmwasm-whitewhale",
      "cosmwasm-orderbook",
    ];

    for (const type of cosmwasmTypes) {
      const res = toLegacyPoolResponse(
        makePool(type, { id: "1868", contract_address: "osmo1contract" })
      );

      expect(res["@type"]).toBe(COSMWASM_POOL_TYPE);
      expect(res).toMatchObject({
        id: "1868",
        contract_address: "osmo1contract",
      });
    }
  });

  it("does not mutate the input pool's raw object", () => {
    const raw = { id: "1" };
    const pool = makePool("weighted", raw);

    const res = toLegacyPoolResponse(pool);

    expect(res).not.toBe(raw);
    expect(raw).toEqual({ id: "1" });
    expect("@type" in raw).toBe(false);
  });
});
