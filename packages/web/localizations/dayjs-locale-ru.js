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
    name: "ру",
    weekdays: "Воскресенье_Понедельник_Вторник_Среда_Четверг_Пятница_Суббота".split(
      "_"
    ),
    months:
      "Январь_Февраль_Март_Апрель_Май_Июнь_Июль_Август_Сентябрь_Октябрь_Ноябрь_Декабрь".split(
        "_"
      ),
  };
});
