import classNames from "classnames";
import {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";

import { Spinner } from "~/components/loaders";

export const BridgeQuoteRemainingTime: FunctionComponent<
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
      1000 // Update every ms
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

const RadialProgress: FunctionComponent<{
  progress: number;
  strokeWidth?: number;
}> = ({ progress, strokeWidth = 4 }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = (progress / 100) * circumference;
  return (
    <svg className="h-full w-full" viewBox="0 0 50 50">
      <circle
        className="text-wosmongton-500"
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx="25"
        cy="25"
      />
      <circle
        className="origin-[50%_50%] -rotate-90 transform text-osmoverse-700 transition-[stroke-dashoffset] duration-[0.35s]"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx="25"
        cy="25"
      />
    </svg>
  );
};
