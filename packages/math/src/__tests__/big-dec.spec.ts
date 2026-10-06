import { BigDec } from "../big-dec";

describe("BigDec JSON serialization", () => {
  it("serializes as a decimal string", () => {
    expect(JSON.stringify(new BigDec("1.5"))).toBe(`"1.5${"0".repeat(35)}"`);
  });
});
