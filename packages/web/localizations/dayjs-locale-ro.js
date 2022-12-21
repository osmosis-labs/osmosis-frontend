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
    name: "en",
    weekdays: "Duminica_Luni_Marti_Miercuri_Joi_Vineri_Sambata".split(
      "_"
    ),
    months:
      "Ianuarie_Februarie_Martie_Aprilie_Mai_Iunie_Iulie_August_Septembrie_Octombrie_Noiembrie_Decembrie".split(
        "_"
      ),
  };
});
