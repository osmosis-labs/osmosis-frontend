import React, { FunctionComponent } from "react";

import { MetricLoader } from "../../loaders";
import { CustomClasses, LoadingProps } from "../../types";
import { BaseCell } from "..";

export interface MetricLoaderCell
  extends Omit<BaseCell, "value">,
    Required<LoadingProps>,
    CustomClasses {
  value?: React.ReactNode;
}

export const MetricLoaderCell: FunctionComponent<Partial<MetricLoaderCell>> = ({
  className,
  value,
  isLoading,
}) => (
  <MetricLoader className={className} isLoading={isLoading}>
    {value}
  </MetricLoader>
);
