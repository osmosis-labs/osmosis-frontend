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
    name: "es",
    weekdays: "Domingo_Lunes_Martes_Jueves_Viernes_Sabado_Domingo".split("_"),
    months:
      "Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Augosto_Septiembre_Octubre_Noviembre_Diciembre".split(
        "_"
      ),
  };
});
