import { Dec, Int } from "@keplr-wallet/unit";
import cases from "jest-in-case";

import {
  compareCommon,
  compareDec,
  compareMemberDefinition,
  CompareResult,
} from "../compare";

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

cases(
  "compareMemberDefinition",
  ({ a, b, member, expected }) => {
    type TestType = { member?: string | null | undefined };
    expect(
      compareMemberDefinition<TestType>(a, b, member as keyof TestType)
    ).toBe(expected);
  },
  {
    "should return -1 if member is in a but not in b": {
      a: { member: "value" },
      b: {},
      member: "member",
      expected: -1,
    },
    "should return 1 if member is in b but not in a": {
      a: {},
      b: { member: "value" },
      member: "member",
      expected: 1,
    },
    "should return 0 if member is in both a and b": {
      a: { member: "value" },
      b: { member: "value" },
      member: "member",
      expected: 0,
    },
    "should return 0 if member is in neither a nor b": {
      a: {},
      b: {},
      member: "member",
      expected: 0,
    },
    "should return -1 if a is a value and b is a nil value": {
      a: { member: "value" },
      b: { member: undefined },
      member: "member",
      expected: -1,
    },
    "should return 0 if a and b are nil values": {
      a: { member: null },
      b: { member: undefined },
      member: "member",
      expected: 0,
    },
  }
);
