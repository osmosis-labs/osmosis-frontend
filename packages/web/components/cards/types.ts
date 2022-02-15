import { ReactElement } from "react";

export interface PoolMetric {
  label: string;
  value: string | ReactElement;
  isLoading?: boolean;
}
