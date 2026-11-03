import {
  findUnroutableCandidates,
  isDefinitiveNoRouteError,
} from "../route-probe";

describe("route-checking withdraw destinations", () => {
  it("drops only definitive no-route answers and keeps unknown ones", async () => {
    const candidates = [{ key: "ok" }, { key: "dead" }, { key: "unknown" }];
    const dead = await findUnroutableCandidates(candidates, async ({ key }) => {
      if (key === "unknown") throw new Error("503 Service Unavailable");
      return key === "ok";
    });
    expect(dead).toEqual(["dead"]);
  });

  it("treats only no-route and thin-liquidity messages as definitive", () => {
    expect(isDefinitiveNoRouteError(new Error("no routes found"))).toBe(true);
    expect(
      isDefinitiveNoRouteError(
        new Error(
          "Difference in USD value of route input and output is too large"
        )
      )
    ).toBe(true);
    expect(isDefinitiveNoRouteError(new Error("rate limit exceeded"))).toBe(
      false
    );
    expect(isDefinitiveNoRouteError(undefined)).toBe(false);
  });

  it("keeps candidates still unresolved at the deadline", async () => {
    const dead = await findUnroutableCandidates(
      [{ key: "fast-dead" }, { key: "slow" }],
      ({ key }) =>
        key === "slow"
          ? new Promise<boolean>(() => {})
          : Promise.resolve(false),
      5,
      20
    );
    expect(dead).toEqual(["fast-dead"]);
  });
});
