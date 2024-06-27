import { Dec } from "@keplr-wallet/unit";
import cases from "jest-in-case";

import { sum } from "../math";

cases(
  "sumArray(arr)",
  (opts) => {
    expect(sum(opts.arr as any[])).toEqual(new Dec(opts.result));
  },
  [
    {
      name: "should return correct sum for array of numbers",
      arr: [1, 2, 3, 4, 5],
      result: "15",
    },
    {
      name: "should return correct sum for array of strings",
      arr: ["1", "2", "3", "4", "5"],
      result: "15",
    },
    {
      name: "should return correct sum for array of Decs",
      arr: [new Dec(1), new Dec(2), new Dec(3), new Dec(4), new Dec(5)],
      result: "15",
    },
    {
      name: "should return correct sum for array of objects with toDec method",
      arr: [
        { toDec: () => new Dec(1) },
        { toDec: () => new Dec(2) },
        { toDec: () => new Dec(3) },
        { toDec: () => new Dec(4) },
        { toDec: () => new Dec(5) },
      ],
      result: "15",
    },
    {
      name: "should return correct sum for mixed array",
      arr: [1, "2", new Dec(3), { toDec: () => new Dec(4) }, "5"],
      result: "15",
    },
    {
      name: "should return 0 for empty array",
      arr: [],
      result: "0",
    },
    {
      name: "should return 0 for empty array",
      arr: undefined,
      result: "0",
    },
  ]
);
