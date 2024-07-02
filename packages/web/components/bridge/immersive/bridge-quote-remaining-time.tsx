import classNames from "classnames";
import { FunctionComponent, useEffect, useState } from "react";

export const BridgeQuoteRemainingTime: FunctionComponent<{
  className?: string;
  refetchInterval: number;
  expiredElement?: React.ReactNode;
  dataUpdatedAt: number;
}> = ({ className, refetchInterval, expiredElement, dataUpdatedAt }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!dataUpdatedAt) return;

    const updateProgress = () => {
      const elapsed = Date.now() - dataUpdatedAt;
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
  }, [dataUpdatedAt, refetchInterval]);

  if (progress <= 0) {
    return expiredElement;
  }

  return (
    <div className={classNames("relative h-7 w-7", className)}>
      <div className="absolute top-0 left-0 h-full w-full">
        <RadialProgress progress={progress} />
      </div>
    </div>
  );
};

const RadialProgress: FunctionComponent<{ progress: number }> = ({
  progress,
}) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = (progress / 100) * circumference;
  return (
    <svg className="h-full w-full" viewBox="0 0 50 50">
      <circle
        className="text-wosmongton-500"
        strokeWidth="4"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx="25"
        cy="25"
      />
      <circle
        className="origin-[50%_50%] -rotate-90 transform text-osmoverse-700 transition-[stroke-dashoffset] duration-[0.35s]"
        strokeWidth="4"
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
