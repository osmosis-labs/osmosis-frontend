import dayjs from "dayjs";

export function humanizeTime(date: dayjs.Dayjs): {
  value: number | string;
  unitTranslationKey: string;
} {
  // If less than a minute, show seconds
  const secondsDiff = date.diff(dayjs(), "seconds");
  if (secondsDiff < 60) {
    return {
      value: secondsDiff,
      unitTranslationKey:
        secondsDiff === 1 ? "timeUnits.second" : "timeUnits.seconds",
    };
  }

  const minutesDiff = date.diff(dayjs(), "minutes");
  if (minutesDiff < 60) {
    return {
      value: minutesDiff,
      unitTranslationKey:
        minutesDiff === 1 ? "timeUnits.minute" : "timeUnits.minutes",
    };
  }

  const hoursDiff = date.diff(dayjs(), "hours");
  if (hoursDiff < 24) {
    return {
      value: hoursDiff,
      unitTranslationKey:
        hoursDiff === 1 ? "timeUnits.hour" : "timeUnits.hours",
    };
  }

  // For days, since it's formatted differently, you might need to handle it separately in your translation logic
  return { value: date.format("MMM D, YYYY"), unitTranslationKey: "" };
}
