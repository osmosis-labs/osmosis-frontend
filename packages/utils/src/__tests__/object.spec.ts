/* eslint-disable import/no-extraneous-dependencies */
import cases from "jest-in-case";

import { getDeepValue } from "../object";

const obj = {
  a: {
    b: {
      c: "value",
    },
  },
};

const testCases = {
  "should return the correct nested value": {
    input: ["a.b.c"],
    output: "value",
  },
  "should return undefined if the path does not exist": {
    input: ["a.b.d"],
    output: undefined,
  },
  "should handle a different delimiter": {
    input: ["a/b/c", "/"],
    output: "value",
  },
};
cases(
  "getDeepValue",
  ({ input, output }) => {
    const [path, delimiter] = input;
    expect(getDeepValue(obj, path, delimiter)).toEqual(output);
  },
  testCases
);
