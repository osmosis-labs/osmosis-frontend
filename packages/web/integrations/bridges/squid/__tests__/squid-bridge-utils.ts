// eslint-disable-next-line import/no-extraneous-dependencies
import cases from "jest-in-case";

import { removeAllCommas } from "../squid-bridge-utils";

cases(
  "removeAllCommas(str)",
  (opts) => {
    expect(removeAllCommas(opts.str)).toEqual(opts.result);
  },
  [
    {
      name: "should remove all commas from a string with commas",
      str: "Hello, world, this, is, a, test",
      result: "Hello world this is a test",
    },
    {
      name: "should return the same string if there are no commas",
      str: "Hello world this is a test",
      result: "Hello world this is a test",
    },
    {
      name: "should handle empty strings",
      str: "",
      result: "",
    },
    {
      name: "should handle strings with only commas",
      str: ",,,,,",
      result: "",
    },
  ]
);
