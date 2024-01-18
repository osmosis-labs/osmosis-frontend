!(function (e, n) {
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = n())
    : "function" == typeof define && define.amd
    ? define(n)
    : ((e =
        "undefined" != typeof globalThis
          ? globalThis
          : e || self).dayjs_locale_en = n());
})(this, function () {
  "use strict";
  return {
    name: "ru",
    weekdays:
      "воскресенье_понедельник_вторник_среда_четверг_пятница_суббота".split(
        "_"
      ),
    weekdaysShort: "вск_пнд_втр_срд_чтв_птн_сбт".split("_"),
    weekdaysMin: "вс_пн_вт_ср_чт_пт_сб".split("_"),
    months,
    monthsShort,
    weekStart: 1,
    yearStart: 4,
    formats: {
      LT: "H:mm",
      LTS: "H:mm:ss",
      L: "DD.MM.YYYY",
      LL: "D MMMM YYYY г.",
      LLL: "D MMMM YYYY г., H:mm",
      LLLL: "dddd, D MMMM YYYY г., H:mm",
    },
    relativeTime: {
      future: "через %s",
      past: "%s назад",
      s: "несколько секунд",
      m: relativeTimeWithPlural,
      mm: relativeTimeWithPlural,
      h: "час",
      hh: relativeTimeWithPlural,
      d: "день",
      dd: relativeTimeWithPlural,
      M: "месяц",
      MM: relativeTimeWithPlural,
      y: "год",
      yy: relativeTimeWithPlural,
    },
    ordinal: (n) => n,
    meridiem: (hour) => {
      if (hour < 4) {
        return "ночи";
      } else if (hour < 12) {
        return "утра";
      } else if (hour < 17) {
        return "дня";
      }
      return "вечера";
    },
  };
});
