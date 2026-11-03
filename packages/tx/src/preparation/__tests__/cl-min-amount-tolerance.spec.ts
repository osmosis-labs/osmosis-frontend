import { applyClMinAmountTolerance } from "../osmosis";

describe("applyClMinAmountTolerance", () => {
  it("floors the minimum at the tolerance below the entered amount", () => {
    expect(applyClMinAmountTolerance("1000000", "5")).toBe("950000");
    expect(applyClMinAmountTolerance("999", "5")).toBe("949");
    expect(applyClMinAmountTolerance("0", "5")).toBe("0");
  });

  it("defaults to the shared tolerance, not a wider hidden one", () => {
    expect(applyClMinAmountTolerance("1000000")).toBe("950000");
  });
});
