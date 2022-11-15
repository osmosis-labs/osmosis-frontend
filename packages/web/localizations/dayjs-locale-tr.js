!(function (e, n) {
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = n(require("dayjs")))
    : "function" == typeof define && define.amd
    ? define(["dayjs"], n)
    : ((e =
        "undefined" != typeof globalThis
          ? globalThis
          : e || self).dayjs_locale_tr = n(e.dayjs));
})(this, function (e) {
  "use strict";
  function n(e) {
    return e && "object" == typeof e && "default" in e ? e : { default: e };
  }
  var t = n(e),
    i = {
      name: "tr",
      weekdays: "pazar_pazartesi_salı_çarşamba_perşembe_cuma_cumartesi".split(
        "_"
      ),
      weekdaysShort: "paz._pzt._sal._çar._per._cum._cmt.".split("_"),
      weekdaysMin: "pa_pt_sa_ça_pe_cu_ct".split("_"),
      months:
        "ocak_şubat_mart_nisan_mayıs_haziran_temmuz_ağustos_eylül_ekim_kasım_aralık".split(
          "_"
        ),
      monthsShort:
        "oca._şub._mar_nis._may_haz_tem._ağu_eyl._eki._kas._ara.".split("_"),
      weekStart: 1,
      yearStart: 4,
      formats: {
        LT: "HH:mm",
        LTS: "HH:mm:ss",
        L: "DD/MM/YYYY",
        LL: "D MMMM YYYY",
        LLL: "D MMMM YYYY HH:mm",
        LLLL: "dddd D MMMM YYYY HH:mm",
      },
      relativeTime: {
        future: "%s sonra",
        past: "%s önce",
        s: "birkaç saniye",
        m: "bir dakika",
        mm: "%d dakika",
        h: "bir saat",
        hh: "%d saat",
        d: "bir gün",
        dd: "%d gün",
        M: "bir ay",
        MM: "%d ay",
        y: "bir yıl",
        yy: "%d yıl",
      },
      ordinal: function (e) {
        return "" + e + (1 === e ? "er" : "");
      },
    };
  return t.default.locale(i, null, !0), i;
});
