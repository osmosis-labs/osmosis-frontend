import dayjs from "dayjs";

export function humanizeTime(
  date: dayjs.Dayjs,
  useShortTimeUnits = false
): {
  value: number | string;
  unitTranslationKey: string;
}[] {
  // Use absolute diffs so both future ("in 2 hours") and past ("2 hours ago")
  // produce the same unit/value breakdown. Direction is the caller's concern.
  // Every unit derives from one elapsed duration: dayjs's day diff adjusts for
  // UTC-offset changes while its hour diff doesn't, so mixing them across a DST
  // change gives e.g. "6 days 0 hours" for 169 hours.
  const secondsDiff = Math.abs(date.diff(dayjs(), "seconds"));
  if (secondsDiff < 60) {
    return [
      {
        value: secondsDiff,
        unitTranslationKey:
          secondsDiff === 1
            ? useShortTimeUnits
              ? "timeUnitsShort.second"
              : "timeUnits.second"
            : useShortTimeUnits
              ? "timeUnitsShort.seconds"
              : "timeUnits.seconds",
      },
    ];
  }

  const minutesDiff = Math.floor(secondsDiff / 60);
  if (minutesDiff < 60) {
    return [
      {
        value: minutesDiff,
        unitTranslationKey:
          minutesDiff === 1
            ? useShortTimeUnits
              ? "timeUnitsShort.minute"
              : "timeUnits.minute"
            : useShortTimeUnits
              ? "timeUnitsShort.minutes"
              : "timeUnits.minutes",
      },
    ];
  }

  const hoursDiff = Math.floor(minutesDiff / 60);
  if (hoursDiff < 24) {
    const minutes = minutesDiff % 60;
    return [
      {
        value: hoursDiff,
        unitTranslationKey:
          hoursDiff === 1
            ? useShortTimeUnits
              ? "timeUnitsShort.hour"
              : "timeUnits.hour"
            : useShortTimeUnits
              ? "timeUnitsShort.hours"
              : "timeUnits.hours",
      },
      {
        value: minutes,
        unitTranslationKey:
          minutes === 1
            ? useShortTimeUnits
              ? "timeUnitsShort.minute"
              : "timeUnits.minute"
            : useShortTimeUnits
              ? "timeUnitsShort.minutes"
              : "timeUnits.minutes",
      },
    ];
  }

  const daysDiff = Math.floor(hoursDiff / 24);
  // The cutoff uses calendar days so a 30-day span that gained an hour across a
  // DST change still counts down instead of switching to a date.
  if (Math.abs(date.diff(dayjs(), "days")) < 30) {
    const hours = hoursDiff % 24;
    return [
      {
        value: daysDiff,
        unitTranslationKey:
          daysDiff === 1
            ? useShortTimeUnits
              ? "timeUnitsShort.day"
              : "timeUnits.day"
            : useShortTimeUnits
              ? "timeUnitsShort.days"
              : "timeUnits.days",
      },
      {
        value: hours,
        unitTranslationKey:
          hours === 1
            ? useShortTimeUnits
              ? "timeUnitsShort.hour"
              : "timeUnits.hour"
            : useShortTimeUnits
              ? "timeUnitsShort.hours"
              : "timeUnits.hours",
      },
    ];
  }

  // For months and years, since it's formatted differently, you might need to handle it separately in your translation logic
  return [{ value: date.format("MMM D, YYYY"), unitTranslationKey: "" }];
}

export function displayHumanizedTime({
  humanizedTime,
  t,
  delimitedBy = " and ",
}: {
  humanizedTime: ReturnType<typeof humanizeTime>;
  t: (key: string) => string;
  delimitedBy?: string;
}) {
  return humanizedTime
    .map((time) => `${time.value} ${t(time.unitTranslationKey)}`)
    .join(delimitedBy);
}
