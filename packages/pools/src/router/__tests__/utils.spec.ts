import { Dec, Int } from "@keplr-wallet/unit";

import { deepUnitCopy } from "../utils";

describe("deepUnitCopy", () => {
  test("should copy plain objects correctly", () => {
    const input = { a: 1, b: { c: 2, d: 3 } };
    const output = deepUnitCopy(input);
    expect(output).toEqual(input);
    expect(output).not.toBe(input);
  });

  test("should copy arrays correctly", () => {
    const input = [1, 2, { a: 3, b: 4 }];
    const output = deepUnitCopy(input);
    expect(output).toEqual(input);
    expect(output).not.toBe(input);
  });

  test("should copy Int and Dec instances correctly", () => {
    const input = {
      a: new Int(42),
      b: new Dec(3.14),
      c: { d: new Int("123"), e: new Dec("0.987") },
    };
    const output = deepUnitCopy(input);

    expect(output.a).toBeInstanceOf(Int);
    expect(output.b).toBeInstanceOf(Dec);
    expect(output.c.d).toBeInstanceOf(Int);
    expect(output.c.e).toBeInstanceOf(Dec);

    expect(output.a.toString()).toEqual("42");
    expect(output.b.toString(2)).toEqual("3.14");
    expect(output.c.d.toString()).toEqual("123");
    expect(output.c.e.toString(3)).toEqual("0.987");
  });

  test("should not reference the original instances", () => {
    const input = {
      a: new Int(42),
      b: new Dec(3.14),
      c: { d: new Int("123"), e: new Dec("0.987") },
    };
    const output = deepUnitCopy(input);

    console.log(output, output.c === input.c);

    expect(output.a).not.toBe(input.a);
    expect(output.b).not.toBe(input.b);
    expect(output.c).not.toBe(input.c);
    expect(output.c.d).not.toBe(input.c.d);
    expect(output.c.e).not.toBe(input.c.e);
  });
});
