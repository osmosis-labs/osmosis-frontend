import { Dec, Int } from "@keplr-wallet/unit";
import cases from "jest-in-case";

import { compareCommon, compareDec, CompareResult } from "../compare";

cases(
  "compareCommon",
  ({ a, b, expected }) => {
    const result: CompareResult = compareCommon(a, b);
    expect(result).toBe(expected);
  },
  {
    "should correctly compare numbers": { a: 5, b: 10, expected: 1 },
    "should correctly compare Dec instances": {
      a: new Dec(5),
      b: new Dec(10),
      expected: 1,
    },
    "should correctly compare Int instances": {
      a: new Int(5),
      b: new Int(10),
      expected: 1,
    },
    "should correctly compare objects with toDec method": {
      a: { toDec: () => new Dec(5) },
      b: { toDec: () => new Dec(10) },
      expected: 1,
    },
  }
);

cases(
  "compareDec",
  ({ a, b, expected }) => {
    expect(compareDec(a, b)).toBe(expected);
  },
  {
    "should return 1 when a is less than b": {
      a: new Dec(1),
      b: new Dec(2),
      expected: 1,
    },
    "should return -1 when a is greater than b": {
      a: new Dec(3),
      b: new Dec(2),
      expected: -1,
    },
    "should return 0 when a is equal to b": {
      a: new Dec(2),
      b: new Dec(2),
      expected: 0,
    },
  }
);
