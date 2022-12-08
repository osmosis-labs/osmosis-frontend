import classNames from "classnames";
import { FunctionComponent } from "react";

interface Props {
  isLoading?: boolean;
  className?: string;
}

export const MetricLoader: FunctionComponent<Props> = ({
  isLoading,
  className,
  children,
}) => {
  return isLoading ? (
    <div
      className={classNames(
        "relative overflow-hidden rounded-sm min-w-[3.75rem] min-h-[1rem] bg-white-faint mt-[0.4375rem]",
        className
      )}
    >
      <div className="absolute left-0 -translate-x-[calc(-150%)] h-full w-1/2 bg-loading-bar animate-loading" />
    </div>
  ) : (
    <>{children}</>
  );
};
