import type { CustomData, Time } from "lightweight-charts";

/**
 * Histogram Series Data
 */
export interface HistogramData<T = Time> extends CustomData<T> {
  value: number;
  time: T;
}
