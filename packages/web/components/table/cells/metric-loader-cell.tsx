import React, { FunctionComponent } from "react";

import { MetricLoader } from "~/components/loaders";
import { BaseCell } from "~/components/table";
import { CustomClasses, LoadingProps } from "~/components/types";

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
