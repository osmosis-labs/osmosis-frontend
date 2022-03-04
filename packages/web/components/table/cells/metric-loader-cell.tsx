import Image from "next/image";
import React, { FunctionComponent } from "react";
import classNames from "classnames";
import { BaseCell } from "..";
import { useStore } from "../../../stores";
import { PoolAssetsIcon } from "../../assets";
import { IntPretty, PricePretty } from "@keplr-wallet/unit";
import { MetricLoader } from "../../loaders";
import { observer } from "mobx-react-lite";

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
