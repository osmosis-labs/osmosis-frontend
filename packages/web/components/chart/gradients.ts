import { GradientColorObject } from "highcharts";

export const HIGHCHART_GRADIENTS: GradientColorObject[] = [
  {
    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
    stops: [
      [0, "#6976FE"],
      [1, "#3339FF"],
    ],
  },
  {
    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
    stops: [
      [0, "#FF7A45"],
      [1, "#FF00A7"],
    ],
  },
  {
    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
    stops: [
      [0, "#FFBC00"],
      [1, "#FF8E00"],
    ],
  },
  {
    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
    stops: [
      [0, "#00CEBA"],
      [1, "#008A7D"],
    ],
  },
];

export const HIGHCHART_LEGEND_GRADIENTS: string[] = [
  "linear-gradient(180deg, #6976FE 0%, #3339FF 100%)",
  "linear-gradient(180deg, #FF7A45 0%, #FF00A7 100%)",
  "linear-gradient(180deg, #FFBC00 0%, #FF8E00 100%)",
  "linear-gradient(180deg, #00CEBA 0%, #008A7D 100%)",
];
