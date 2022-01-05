import React, { FunctionComponent } from "react";
import classNames from "classnames";

export const StatLabelValue: FunctionComponent<{
  containerClassName?: string;
  labelClassName?: string;
  valueClassName?: string;

  label: string;
  value: string;
}> = ({ containerClassName, labelClassName, valueClassName, label, value }) => {
  return (
    <div className={classNames("flex flex-col", containerClassName)}>
      <div
        className={classNames(
          "subtitle2 text-white-disabled md-[2px]",
          labelClassName
        )}
      >
        {label}
      </div>
      <h6 className={classNames("text-white-high", valueClassName)}>{value}</h6>
    </div>
  );
};
