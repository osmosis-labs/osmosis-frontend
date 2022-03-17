import React, { FunctionComponent } from "react";
import { MetricLoader } from "../../loaders";
import { MetricLoaderCell as Cell } from "./types";

export const MetricLoaderCell: FunctionComponent<Partial<Cell>> = ({
  value,
  isLoading,
}) => <MetricLoader isLoading={isLoading}>{value}</MetricLoader>;
