import { FunctionComponent } from "react";
import classNames from "classnames";
import { CustomClasses, Metric, MobileProps } from "../types";

interface Props extends Metric, MobileProps {
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
  isMobile = false,
}) => (
  <div
    className={classNames(
      "flex flex-col justify-items-start",
      containerClassName
    )}
  >
    <span className={classNames("text-white-mid md:caption", labelClassName)}>
      {label}
    </span>
    {prominence === "primary" ? (
      <PrimaryMetric className={valueClassName} isMobile={isMobile}>
        {value}
      </PrimaryMetric>
    ) : (
      <SecondaryMetric className={valueClassName} isMobile={isMobile}>
        {value}
      </SecondaryMetric>
    )}
  </div>
);

export const PrimaryMetric: FunctionComponent<MobileProps & CustomClasses> = ({
  isMobile = false,
  className,
  children,
}) =>
  isMobile ? (
    <h5 className={className}>{children}</h5>
  ) : (
    <h4 className={classNames("mt-3", className)}>{children}</h4>
  );

export const SecondaryMetric: FunctionComponent<
  MobileProps & CustomClasses
> = ({ isMobile = false, className, children }) =>
  isMobile ? (
    <span className={classNames("mt-1 subtitle1", className)}>{children}</span>
  ) : (
    <h6 className={classNames("mt-3", className)}>{children}</h6>
  );
