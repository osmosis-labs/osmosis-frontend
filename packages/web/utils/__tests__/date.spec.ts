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
    expect(result.value).toEqual(opts.expected.value);
    if (opts.expected.unit !== "") {
      expect(result.unitTranslationKey).toEqual(
        `timeUnits.${opts.expected.unit}`
      );
    }
  },
  [
    {
      name: "should return seconds for less than a minute",
      input: 30, // 30 seconds from now
      expected: { value: 30, unit: "seconds" },
    },
    {
      name: "should return a single second",
      input: 1, // 1 second from now
      expected: { value: 1, unit: "second" },
    },
    {
      name: "should return minutes for less than an hour",
      input: 120, // 2 minutes from now
      expected: { value: 2, unit: "minutes" },
    },
    {
      name: "should return a single minute",
      input: 60, // 1 minute from now
      expected: { value: 1, unit: "minute" },
    },
    {
      name: "should return 59 minutes",
      input: 59 * 60, // 59 minutes from now
      expected: { value: 59, unit: "minutes" },
    },
    {
      name: "should return hours for less than a day",
      input: 2 * 60 * 60, // 2 hours from now
      expected: { value: 2, unit: "hours" },
    },
    {
      name: "should return a single hour",
      input: 60 * 60, // 1 hour from now
      expected: { value: 1, unit: "hour" },
    },
    {
      name: "should return formatted date for more than a day",
      input: 25 * 60 * 60, // 25 hours from now
      expected: {
        value: dayjs().add(25, "hour").format("MMM D, YYYY"),
        unit: "", // No unit expected for dates
      },
    },
  ]
);
