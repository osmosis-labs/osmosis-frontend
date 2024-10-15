import classNames from "classnames";
import {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";

import { Spinner } from "~/components/loaders";
import { RadialProgress } from "~/components/radial-progress";

export const QueryRemainingTime: FunctionComponent<
  PropsWithChildren<{
    className?: string;
    refetchInterval: number;
    dataUpdatedAt: number;
    isPaused?: boolean;
    strokeWidth?: number;
  }>
> = ({
  className,
  refetchInterval,
  dataUpdatedAt,
  isPaused = false,
  children,
  strokeWidth,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!dataUpdatedAt) return;

    const updateProgress = () => {
      const now = isPaused ? dataUpdatedAt : Date.now();
      const elapsed = now - dataUpdatedAt;
      const percentage = Math.max((1 - elapsed / refetchInterval) * 100, 0);
      setProgress(percentage);
    };

    updateProgress();

    const intervalId = setInterval(
      () => {
        updateProgress();
      },
      1000 // Update every s
    );

    return () => clearInterval(intervalId);
  }, [dataUpdatedAt, refetchInterval, isPaused]);

  return (
    <div className={classNames("relative h-7 w-7 md:h-5 md:w-5", className)}>
      <div className="absolute top-0 left-0 h-full w-full">
        {progress <= 0 ? (
          <Spinner className="relative top-0 left-0 !h-full !w-full text-wosmongton-500" />
        ) : (
          <RadialProgress progress={progress} strokeWidth={strokeWidth} />
        )}
      </div>
      {children}
    </div>
  );
};
