!(function (e, n) {
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = n(require("dayjs")))
    : "function" == typeof define && define.amd
    ? define(["dayjs"], n)
    : ((e =
        "undefined" != typeof globalThis
          ? globalThis
          : e || self).dayjs_locale_pl = n(e.dayjs));
})(this, function (e) {
  "use strict";
  function n(e) {
    return e && "object" == typeof e && "default" in e ? e : { default: e };
  }
  var t = n(e),
    i = {
      name: "pl",
      weekdays:
        "Niedziela_Poniedziałek_Wtorek_Środa_Czwartek_Piątek_Sobota".split("_"),
      weekdaysShort: "Ndz_Pon_Wt_Śr_Czw_Pt_Sob".split("_"),
      weekdaysMin: "Nd_Pn_Wt_Śr_Cz_Pt_So".split("_"),
      months:
        "Styczeń_Luty_Marzec_Kwiecień_Maj_Czerwiec_Lipiec_Sierpień_Wrzesień_Październik_Listopad_Grudzień".split(
          "_"
        ),
      relativeTime: {
        future: "za %s",
        past: "po %s",
        s: "kilka sekund",
        m: "minuta",
        mm: "%d minut",
        h: "godzina",
        hh: "%d godzin",
        d: "tydzień",
        dd: "%d tygodni",
        M: "miesiąc",
        MM: "%d miesięcy",
        y: "rok",
        yy: "%d lat",
      },
      ordinal: function (e) {
        return e + ".";
      },
    };
  return t.default.locale(i, null, !0), i;
});
