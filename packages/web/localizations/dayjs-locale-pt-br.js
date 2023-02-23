// Portuguese [pt]
import dayjs from "dayjs";

const locale = {
  name: "pt-br",
  monthsShort: "jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez".split("_"),
  weekdays: "domingo_segunda_terça_quarta_quinta_sexta_sábado".split("_"),
  weekdaysShort: "dom._seg._ter._qua._qui._sex._sáb.".split("_"),
  weekdaysMin: "do_se_te_qua_qui_sext_sá".split("_"),
  months:
    "janeiro_fevereiro_março_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro".split(
      "_"
    ),
  weekStart: 1,
  formats: {
    LT: "HH:mm",
    LTS: "HH:mm:ss",
    L: "DD/MM/YYYY",
    LL: "D [de] MMMM [de] YYYY",
    LLL: "D [de] MMMM [de] YYYY HH:mm",
    LLLL: "dddd, D [de] MMMM [de] YYYY GH:mm",
  },
  relativeTime: {
    future: "em %s",
    past: "faz %s",
    s: "uns segundos",
    m: "um minuto",
    mm: "%d minutos",
    h: "uma hora",
    hh: "%d horas",
    d: "um dia",
    dd: "%d dias",
    M: "um mês",
    MM: "%d meses",
    y: "um ano",
    yy: "%d anos",
  },
  ordinal: (n) => `${n}º`,
};

dayjs.locale(locale, null, true);

export default locale;
