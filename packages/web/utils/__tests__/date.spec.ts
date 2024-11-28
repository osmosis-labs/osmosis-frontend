import dayjs from "dayjs";
import cases from "jest-in-case";

import { humanizeTime } from "~/utils/date";

jest.mock("dayjs", () => {
  const originalDayjs = jest.requireActual("dayjs");
  const specificTime = originalDayjs("2024-01-01T00:00:00.000Z");
  return (...args: dayjs.ConfigType[]) =>
    args.length ? originalDayjs(...args) : specificTime;
});

cases(
  "humanizeTime",
  (opts) => {
    const inputDate = dayjs().add(opts.input, "second");
    const result = humanizeTime(inputDate);

    // Check the first time unit
    for (const [index, expectedUnit] of opts.expected.entries()) {
      expect(result[index].value).toEqual(expectedUnit.value);
      if (expectedUnit.unit !== "") {
        expect(result[index].unitTranslationKey).toEqual(
          `timeUnits.${expectedUnit.unit}`
        );
      }
    }
  },
  [
    {
      name: "should return seconds for less than a minute",
      input: 30, // 30 seconds from now
      expected: [{ value: 30, unit: "seconds" }],
    },
    {
      name: "should return a single second",
      input: 1, // 1 second from now
      expected: [{ value: 1, unit: "second" }],
    },
    {
      name: "should return minutes for less than an hour",
      input: 120, // 2 minutes from now
      expected: [{ value: 2, unit: "minutes" }],
    },
    {
      name: "should return a single minute",
      input: 60, // 1 minute from now
      expected: [{ value: 1, unit: "minute" }],
    },
    {
      name: "should return 59 minutes",
      input: 59 * 60, // 59 minutes from now
      expected: [{ value: 59, unit: "minutes" }],
    },
    {
      name: "should return hours and minutes for less than a day",
      input: 2 * 60 * 60 + 30 * 60, // 2 hours and 30 minutes from now
      expected: [
        { value: 2, unit: "hours" },
        { value: 30, unit: "minutes" },
      ],
    },
    {
      name: "should return a single hour",
      input: 60 * 60, // 1 hour from now
      expected: [{ value: 1, unit: "hour" }],
    },
    {
      name: "should return formatted date for more than a day",
      input: 32 * 24 * 60 * 60, // 32 days from now
      expected: [
        { value: dayjs().add(32, "days").format("MMM D, YYYY"), unit: "" },
      ],
    },
  ]
);
