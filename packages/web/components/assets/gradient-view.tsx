import classNames from "classnames";
import { FunctionComponent } from "react";

import { CustomClasses } from "~/components/types";

/** Wrap a view in a gradient border. */
export const GradientView: FunctionComponent<
  { gradientClassName?: string; bgClassName?: string } & CustomClasses
> = ({
  gradientClassName = "bg-superfluid",
  bgClassName = "bg-osmoverse-900",
  className,
  children,
}) => (
  <div className={`rounded-xl p-[2px] ${gradientClassName}`}>
    <div
      className={classNames(
        "rounded-xlinset px-4 py-[19px] md:py-2 md:leading-3",
        bgClassName,
        className
      )}
    >
      {children}
    </div>
  </div>
);
