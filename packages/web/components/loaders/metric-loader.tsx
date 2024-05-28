import classNames from "classnames";
import { PropsWithChildren } from "react";

interface Props {
  isLoading?: boolean;
  className?: string;
}

export const MetricLoader = ({
  isLoading,
  className,
  children,
}: PropsWithChildren<Props>) => {
  return isLoading ? (
    <div
      className={classNames(
        "relative h-4 w-full overflow-hidden rounded-sm bg-white-faint",
        className
      )}
    >
      <div className="absolute left-0 h-full w-1/2 -translate-x-[calc(-150%)] animate-loading bg-loading-bar" />
    </div>
  ) : (
    <>{children}</>
  );
};
