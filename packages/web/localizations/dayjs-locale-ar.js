// Spanish [es]
import dayjs from "dayjs";

const locale = {
  name: "ar",

  weekdays: "يَوم الأحَد_يَوم الإثنين_يَوم الثلاثاء_يَوم الأربعاء_يَوم الخميس_يَوم الجمعه_يَوم السبت".split("_"),
  weekdaysShort: "الأحد_الإثنين_الثلاثاء_الأربعاء_الخميس_الجمعه_السبت".split("_"),
  weekdaysMin: "الأحد_الإثنين_الثلاثاء_الأربعاء_الخميس_الجمعه_السبت".split("_"),
  months: "يناير_فبراير_مارس_أبريل_مايو_يونيو_يوليو_أغسطس_سبتمبر_أكتوبر_نوفمبر_ديسمبر".split("_"),
  monthsShort: "يناير_فبراير_مارس_أبريل_مايو_يونيو_يوليو_أغسطس_سبتمبر_أكتوبر_نوفمبر_ديسمبر".split("_"),
  weekStart: 1,
  formats: {
    LT: "HH:mm",
    LTS: "HH:mm:ss",
    L: "DD/MM/YYYY",
    LL: "D MMMM YYYY",
    LLL: "D MMMM YYYY HH:mm",
    LLLL: "dddd D MMMM YYYY HH:mm",
    l: "DD/MM/YYYY",
    ll: "D MMMM YYYY",
    lll: "D MMMM YYYY HH:mm",
    llll: "dddd D MMMM YYYY HH:mm",
  },
  relativeTime: {
    future: "بعد %s",
    past: "منذ %s",
    s: "ثوان",
    m: "دقيقة",
    mm: "%d دقائق",
    h: "ساعة",
    hh: "%d ساعات",
    d: "يوم",
    dd: "%d أيام",
    M: "شهر",
    MM: "%d أشهر",
    y: "سنة",
    yy: "%d سنوات",
  },
  ordinal: (n) => `${n}º`,
};

dayjs.locale(locale, null, true);

export default locale;
