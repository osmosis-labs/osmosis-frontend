import React, { FunctionComponent } from "react";
import { BaseCell } from "..";
import { MetricLoader } from "../../loaders";

export interface MetricLoaderCell extends BaseCell {
  isLoading: boolean;
}

export const MetricLoaderCell: FunctionComponent<Partial<MetricLoaderCell>> = ({
  value,
  isLoading,
}) => <MetricLoader isLoading={isLoading}>{value}</MetricLoader>;
