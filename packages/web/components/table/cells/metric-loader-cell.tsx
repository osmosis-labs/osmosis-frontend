import React, { FunctionComponent } from "react";

import { MetricLoader } from "../../loaders";
import { LoadingProps } from "../../types";
import { BaseCell } from "..";

export interface MetricLoaderCell extends BaseCell, Required<LoadingProps> {}

export const MetricLoaderCell: FunctionComponent<Partial<MetricLoaderCell>> = ({
  value,
  isLoading,
}) => <MetricLoader isLoading={isLoading}>{value}</MetricLoader>;
