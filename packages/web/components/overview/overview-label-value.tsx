import { FunctionComponent } from "react";
import classNames from "classnames";
import { OverviewLabel } from "./types";

interface Props extends OverviewLabel {
  containerClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  prominence?: "primary" | "secondary";
}

export const OverviewLabelValue: FunctionComponent<Props> = ({
  containerClassName,
  labelClassName,
  valueClassName,
  prominence = "primary",
  label,
  value,
}) => {
  return (
    <div className={classNames("flex flex-col", containerClassName)}>
      <div className={classNames("text-white-mid", labelClassName)}>
        {label}
      </div>
      {prominence === "primary" ? (
        <h4 className={classNames("mt-3", valueClassName)}>{value}</h4>
      ) : (
        <h6 className={classNames("mt-3", valueClassName)}>{value}</h6>
      )}
    </div>
  );
};
