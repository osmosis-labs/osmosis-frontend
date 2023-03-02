import { Dec } from "@keplr-wallet/unit";

import { smallestDec } from "../const";
import { approxRoot } from "../utils";

// from: https://github.com/osmosis-labs/cosmos-sdk/blob/5b0f9cfa4331ad3c64d9690318e4621b569b9a50/types/decimal_test.go#L372)
it("Test Dec approxRoot", () => {
  const tests: { d: Dec; r: number; res: Dec }[] = [
    { d: new Dec(1), r: 10, res: new Dec(1) }, // 1.0 ^ (0.1) => 1.0
    { d: new Dec(25, 2), r: 2, res: new Dec(5, 1) }, // 0.25 ^ (0.5) => 0.5,
    { d: new Dec(4, 2), r: 2, res: new Dec(2, 1) }, // 0.04 ^ (0.5) => 0.2
    { d: new Dec(27), r: 3, res: new Dec(3) }, // 27 ^ (1/3) => 3
    { d: new Dec(-81), r: 4, res: new Dec(-3) }, // -81 ^ (0.25) => -3
    { d: new Dec(2), r: 2, res: new Dec("1414213562373095049", 18) }, // 2 ^ (0.5) => 1.414213562373095049
    {
      d: new Dec(1005, 3),
      r: 31536000,
      res: new Dec("1.000000000158153904"),
    }, // 1.005 ^ (1/31536000) ≈ 1.00000000016
    { d: smallestDec, r: 2, res: new Dec(1, 9) }, // 1e-18 ^ (0.5) => 1e-9
    { d: smallestDec, r: 3, res: new Dec("0.000000999999999997") }, // 1e-18 ^ (1/3) => 1e-6
    { d: new Dec(1, 8), r: 3, res: new Dec("0.002154434690031900") }, // 1e-8 ^ (1/3) ≈ 0.00215443469
  ];

  for (const test of tests) {
    const res = approxRoot(test.d, test.r);

    expect(res.toString()).toBe(test.res.toString());
  }
});
