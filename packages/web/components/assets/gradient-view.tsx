import { FunctionComponent } from "react";
import classNames from "classnames";
import { CustomClasses } from "../types";

/** Wrap a view in a gradient border. */
export const GradientView: FunctionComponent<
  { gradientClassName?: string } & CustomClasses
> = ({ gradientClassName = "bg-superfluid", className, children }) => (
  <div className={`rounded-xl p-[2px] ${gradientClassName}`}>
    <div
      className={classNames(
        "rounded-xlinset bg-background px-4 py-[19px]",
        className
      )}
    >
      {children}
    </div>
  </div>
);
