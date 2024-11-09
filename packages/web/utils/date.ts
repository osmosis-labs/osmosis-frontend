import dayjs from "dayjs";

export function humanizeTime(
  date: dayjs.Dayjs,
  timeUnitsTranslationPath = "timeUnits"
): {
  value: number | string;
  unitTranslationKey: string;
} {
  // If less than a minute, show seconds
  const secondsDiff = date.diff(dayjs(), "seconds");
  if (secondsDiff < 60) {
    return {
      value: Math.max(secondsDiff, 0),
      unitTranslationKey:
        secondsDiff === 1
          ? `${timeUnitsTranslationPath}.second`
          : `${timeUnitsTranslationPath}.seconds`,
    };
  }

  const minutesDiff = date.diff(dayjs(), "minutes");
  if (minutesDiff < 60) {
    return {
      value: minutesDiff,
      unitTranslationKey:
        minutesDiff === 1
          ? `${timeUnitsTranslationPath}.minute`
          : `${timeUnitsTranslationPath}.minutes`,
    };
  }

  const hoursDiff = date.diff(dayjs(), "hours");
  if (hoursDiff < 24) {
    return {
      value: hoursDiff,
      unitTranslationKey:
        hoursDiff === 1
          ? `${timeUnitsTranslationPath}.hour`
          : `${timeUnitsTranslationPath}.hours`,
    };
  }

  const daysDiff = date.diff(dayjs(), "days");
  if (daysDiff < 30) {
    return {
      value: daysDiff,
      unitTranslationKey:
        daysDiff === 1
          ? `${timeUnitsTranslationPath}.day`
          : `${timeUnitsTranslationPath}.days`,
    };
  }

  // For months and years, since it's formatted differently, you might need to handle it separately in your translation logic
  return { value: date.format("MMM D, YYYY"), unitTranslationKey: "" };
}
