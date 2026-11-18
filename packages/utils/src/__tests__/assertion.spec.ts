import cases from "jest-in-case";

import { isNumeric, normalizeDecimalSeparator } from "../assertion";

cases(
  "isNumeric",
  (opts) => {
    expect(isNumeric(opts.input)).toBe(opts.expected);
  },
  [
    {
      name: "should return true for valid positive numbers",
      input: "123",
      expected: true,
    },
    {
      name: "should return true for valid positive numbers",
      input: "0.456",
      expected: true,
    },
    {
      name: "should return true for valid positive numbers",
      input: "7890",
      expected: true,
    },
    { name: "should return true for zero", input: "0", expected: true },
    {
      name: "should return true for negative numbers",
      input: "-1",
      expected: true,
    },
    {
      name: "should return true for negative numbers",
      input: "-0.1",
      expected: true,
    },
    {
      name: "should return false for non-numeric strings",
      input: "abc",
      expected: false,
    },
    {
      name: "should return false for non-numeric strings",
      input: "12abc34",
      expected: false,
    },
    {
      name: "should return false for non-numeric strings",
      input: " ",
      expected: false,
    },
    {
      name: "should return false for empty string",
      input: "",
      expected: false,
    },
    {
      name: "should return true for numbers exceeding MAX_SAFE_INTEGER",
      input: String(Number.MAX_SAFE_INTEGER + 1),
      expected: true,
    },
    {
      name: "should return true for MAX_SAFE_INTEGER",
      input: String(Number.MAX_SAFE_INTEGER),
      expected: true,
    },
    { name: "should return false for NaN", input: "NaN", expected: false },
  ]
);

describe("normalizeDecimalSeparator", () => {
  it("turns a decimal comma into a dot, never a different magnitude", () => {
    expect(normalizeDecimalSeparator("1,5")).toBe("1.5");
    expect(normalizeDecimalSeparator("1,")).toBe("1.");
    expect(normalizeDecimalSeparator("0,500")).toBe("0.500");
    expect(normalizeDecimalSeparator("1,2345")).toBe("1.2345");
    expect(normalizeDecimalSeparator("1.5")).toBe("1.5");
  });

  it("rejects ambiguous or malformed comma input", () => {
    expect(normalizeDecimalSeparator("1,000")).toBeNull();
    expect(normalizeDecimalSeparator("1,000.5")).toBeNull();
    expect(normalizeDecimalSeparator("1.000,5")).toBeNull();
    expect(normalizeDecimalSeparator("1,000,000")).toBeNull();
  });
});
