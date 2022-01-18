import { FunctionComponent, ReactElement } from "react";
import classNames from "classnames";

export const OverviewLabelValue: FunctionComponent<{
  containerClassName?: string;
  labelClassName?: string;
  valueClassName?: string;

  label: string;
  value: string | ReactElement;
}> = ({ containerClassName, labelClassName, valueClassName, label, value }) => {
  return (
    <div className={classNames("flex flex-col", containerClassName)}>
      <div className={classNames("text-white-mid", labelClassName)}>
        {label}
      </div>
      <h4 className={classNames("mt-3", valueClassName)}>{value}</h4>
    </div>
  );
};
