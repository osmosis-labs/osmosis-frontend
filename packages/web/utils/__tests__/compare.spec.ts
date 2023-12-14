import { Dec, Int } from "@keplr-wallet/unit";

import {
  compareCommon,
  compareDec,
  compareDefinedMember,
  CompareResult,
} from "../compare";

describe("compareCommon", () => {
  it("should correctly compare numbers", () => {
    const a: number = 5;
    const b: number = 10;
    const result: CompareResult = compareCommon(a, b);
    expect(result).toBe(1);
  });

  it("should correctly compare Dec instances", () => {
    const a: Dec = new Dec(5);
    const b: Dec = new Dec(10);
    const result: CompareResult = compareCommon(a, b);
    expect(result).toBe(1);
  });

  it("should correctly compare Int instances", () => {
    const a: Int = new Int(5);
    const b: Int = new Int(10);
    const result: CompareResult = compareCommon(a, b);
    expect(result).toBe(1);
  });

  it("should correctly compare objects with toDec method", () => {
    const a = { toDec: () => new Dec(5) };
    const b = { toDec: () => new Dec(10) };
    const result: CompareResult = compareCommon(a, b);
    expect(result).toBe(1);
  });
});

describe("compareDec", () => {
  it("should return 1 when a is less than b", () => {
    const a = new Dec(1);
    const b = new Dec(2);
    expect(compareDec(a, b)).toBe(1);
  });

  it("should return -1 when a is greater than b", () => {
    const a = new Dec(3);
    const b = new Dec(2);
    expect(compareDec(a, b)).toBe(-1);
  });

  it("should return 0 when a is equal to b", () => {
    const a = new Dec(2);
    const b = new Dec(2);
    expect(compareDec(a, b)).toBe(0);
  });
});

describe("compareDefinedMember", () => {
  it("should return -1 if member is in a but not in b", () => {
    const a = { x: 1 };
    const b = {};
    const result = compareDefinedMember(a, b, "x");
    expect(result).toBe(-1);
  });

  it("should return 1 if member is in b but not in a", () => {
    const a = { x: 1 };
    const b = { x: 2, y: 3 };
    const result = compareDefinedMember(a, b, "y");
    expect(result).toBe(1);
  });

  it("should return 0 if member is in both a and b", () => {
    const a = { x: 1, y: 2 };
    const b = { x: 3, y: 4 };
    const result = compareDefinedMember(a, b, "y");
    expect(result).toBe(0);
  });

  it("should return 0 if member is in neither a nor b", () => {
    const a = { x: 1 };
    const b = { x: 2 };
    const result = compareDefinedMember(a, b, "y");
    expect(result).toBe(0);
  });
});
