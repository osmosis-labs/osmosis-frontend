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

  const minutesDiff = Math.abs(date.diff(dayjs(), "minutes"));
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

  const hoursDiff = Math.abs(date.diff(dayjs(), "hours"));
  if (hoursDiff < 24) {
    const minutes = Math.abs(date.diff(dayjs(), "minutes")) % 60;
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

  const daysDiff = Math.abs(date.diff(dayjs(), "days"));
  if (daysDiff < 30) {
    const hours = Math.abs(date.diff(dayjs(), "hours")) % 24;
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
