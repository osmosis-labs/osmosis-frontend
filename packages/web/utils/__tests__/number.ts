// eslint-disable-next-line import/no-extraneous-dependencies
import cases from "jest-in-case";

import { getNumberMagnitude, toScientificNotation } from "../number";

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
      result: "5 x 10^40",
    },
    {
      name: "should return correct scientific notation for small negative fraction",
      number: "-0.00000000000000000000000000000000084",
      result: "-8.4 x 10^-34",
    },
    {
      name: "should return correct scientific notation for negative integer",
      number: "-1000",
      result: "-1 x 10^3",
    },
    {
      name: "should return correct scientific notation for small positive fraction",
      number: "0.001",
      result: "1 x 10^-3",
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
      result: "1.23456789 x 10^-41",
    },
    {
      name: "should return correct scientific notation for small negative fraction with many leading zeros",
      number: "-0.00000000000000000000000000000000000000001234567890",
      result: "-1.23456789 x 10^-41",
    },
  ]
);
