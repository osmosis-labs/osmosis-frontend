import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { BaseCell } from "..";
import { MetricLoader } from "../../loaders";

export interface MetricLoaderCell extends BaseCell {
  isLoading: boolean;
}

export const MetricLoaderCell: FunctionComponent<MetricLoaderCell> = observer(
  ({ value, isLoading }) => {
    return (
      <MetricLoader isLoading={isLoading}>{value.toString()}</MetricLoader>
    );
  }
);
