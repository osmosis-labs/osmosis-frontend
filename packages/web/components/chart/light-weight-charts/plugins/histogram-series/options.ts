import {
  customSeriesDefaultOptions,
  type CustomSeriesOptions,
} from "lightweight-charts";

import { theme } from "~/tailwind.config";

export interface HistogramSeriesOptions extends CustomSeriesOptions {
  colors: readonly string[];
}

export const defaultOptions: HistogramSeriesOptions = {
  ...customSeriesDefaultOptions,
  colors: [theme.colors.bullish[500]],
  priceLineVisible: false,
  lastValueVisible: false,
} as const;
