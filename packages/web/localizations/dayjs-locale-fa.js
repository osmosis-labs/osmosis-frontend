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
        name: "fa",
        weekdays: "یکشنبه_دوشنبه_سه شنبه_چهارشنبه_پنج شنبه_جمعه_شنبه".split(
            "_"
        ),
        months:
            "January_February_March_April_May_June_July_August_September_October_November_December".split(
                "_"
            ),
    };
});
