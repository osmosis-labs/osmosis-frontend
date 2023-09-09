// eslint-disable-next-line import/no-extraneous-dependencies
import cases from "jest-in-case";

import {
  getDecimalCount,
  getNumberMagnitude,
  toScientificNotation,
} from "~/utils/number";

cases(
  "getNumberMagnitude(value)",
  (opts) => {
    expect(getNumberMagnitude(opts.number as string)).toEqual(opts.result);
  },
  [
    {
      name: "should return correct magnitude for large positive number",
      number: "50000000000000000000000000000000084000000",
      result: 40,
    },
    {
      name: "should return correct magnitude for small negative fraction",
      number: "-0.00000000000000000000000000000000084",
      result: -34,
    },
    {
      name: "should return correct magnitude for negative integer",
      number: "-1000",
      result: 3,
    },
    {
      name: "should return correct magnitude for small positive fraction",
      number: "0.001",
      result: -3,
    },
    {
      name: "should return correct magnitude for single-digit positive integer",
      number: "1",
      result: 0,
    },
    {
      name: "should return correct magnitude for single-digit negative integer",
      number: "-1",
      result: 0,
    },
    {
      name: "should return correct magnitude for small positive fraction with many leading zeros",
      number: "0.00000000000000000000000000000000000000001234567890",
      result: -41,
    },
    {
      name: "should return correct magnitude for small negative fraction with many leading zeros",
      number: "-0.00000000000000000000000000000000000000001234567890",
      result: -41,
    },
  ]
);

cases(
  "toScientificNotation(value)",
  (opts) => {
    expect(toScientificNotation(opts.number as string)).toEqual(opts.result);
  },
  [
    {
      name: "should return correct scientific notation for large positive number",
      number: "50000000000000000000000000000000084000000",
      result: "5*10^40",
    },
    {
      name: "should return correct scientific notation for small negative fraction",
      number: "-0.00000000000000000000000000000000084",
      result: "-8.4*10^-34",
    },
    {
      name: "should return correct scientific notation for negative integer",
      number: "-1000",
      result: "-1*10^3",
    },
    {
      name: "should return correct scientific notation for small positive fraction",
      number: "0.001",
      result: "1*10^-3",
    },
    {
      name: "should return correct scientific notation for single-digit positive integer",
      number: "1",
      result: "1",
    },
    {
      name: "should return correct scientific notation for single-digit negative integer",
      number: "-1",
      result: "-1",
    },
    {
      name: "should return correct scientific notation for small positive fraction with many leading zeros",
      number: "0.00000000000000000000000000000000000000001234567890",
      result: "1.23456789*10^-41",
    },
    {
      name: "should return correct scientific notation for small negative fraction with many leading zeros",
      number: "-0.00000000000000000000000000000000000000001234567890",
      result: "-1.23456789*10^-41",
    },
  ]
);

cases(
  "getDecimalCount(value)",
  (opts) => {
    expect(getDecimalCount(opts.number)).toEqual(opts.result);
  },
  [
    {
      name: "should return correct decimal count for integer",
      number: "1000",
      result: 0,
    },
    {
      name: "should return correct decimal count for decimal number",
      number: "1000.123",
      result: 3,
    },
    {
      name: "should return correct decimal count for negative integer",
      number: "-1000",
      result: 0,
    },
    {
      name: "should return correct decimal count for negative decimal number",
      number: "-1000.123",
      result: 3,
    },
    {
      name: "should return correct decimal count for zero",
      number: "0",
      result: 0,
    },
    {
      name: "should return correct decimal count for decimal fraction",
      number: "0.123",
      result: 3,
    },
    {
      name: "should return correct decimal count for negative decimal fraction",
      number: "-0.123",
      result: 3,
    },
    {
      name: "should return correct decimal count for number with no decimal part",
      number: "1.",
      result: 0,
    },
    {
      name: "should return correct decimal count for number without counting trailing zeros",
      number: "1.200",
      result: 1,
    },
    {
      name: "should return correct decimal count for a really big decimal number",
      number: "0.12345678901234",
      result: 14,
    },
    {
      name: "should return correct decimal count for a really big decimal number",
      number: "0.0000000000004",
      result: 13,
    },
    {
      name: "should return correct decimal count for a really big decimal number",
      number: "0.0000000168",
      result: 8,
    },
  ]
);
