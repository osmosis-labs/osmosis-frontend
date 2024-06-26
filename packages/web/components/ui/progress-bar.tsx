import cn from "classnames";
import React from "react";

interface ProgressSegment {
  percentage: string;
  classNames: string;
}

interface ProgressBarProps {
  segments: ProgressSegment[];
  classNames?: string;
  totalPercentClassNames?: string;
  totalPercent?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  segments,
  classNames,
  totalPercent,
  totalPercentClassNames,
}) => {
  return (
    <div className="flex w-full items-center">
      <div
        className={cn(
          "w-full overflow-hidden rounded-xl bg-osmoverse-700",
          classNames
        )}
      >
        {segments.map((segment, index) => (
          <div
            key={index}
            style={{
              width: `${segment.percentage}%`,
            }}
            className={cn("h-full", segment.classNames)}
          />
        ))}
      </div>
      {totalPercent && totalPercent.length > 0 && (
        <span className={cn("ml-2 text-bullish-400", totalPercentClassNames)}>
          {totalPercent}%
        </span>
      )}
    </div>
  );
};
