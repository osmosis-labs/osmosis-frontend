import React, { FunctionComponent } from "react";
import { BaseCell } from "..";
import { MetricLoader } from "../../loaders";
import { LoadingProps } from "../../types";

export interface MetricLoaderCell extends BaseCell, Required<LoadingProps> {}

export const MetricLoaderCell: FunctionComponent<Partial<MetricLoaderCell>> = ({
  value,
  isLoading,
}) => <MetricLoader isLoading={isLoading}>{value}</MetricLoader>;
