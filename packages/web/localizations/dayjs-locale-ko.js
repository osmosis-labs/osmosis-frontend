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
    name: "ko",
    weekdays: "일요일_월요일_화요일_수요일_목요일_금요일_토요일".split("_"),
    months: "1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월".split("_"),
  };
});
