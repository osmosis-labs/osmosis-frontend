import { findUnroutableCandidates } from "../route-probe";

describe("route-checking transfer candidates", () => {
  it("drops only definitive no-route answers and keeps unknown ones", async () => {
    const candidates = [{ key: "ok" }, { key: "dead" }, { key: "unknown" }];
    const dead = await findUnroutableCandidates(candidates, async ({ key }) => {
      if (key === "unknown") throw new Error("503 Service Unavailable");
      return key === "ok";
    });
    expect(dead).toEqual(["dead"]);
  });
});
