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
    <div className="flex items-center gap-2">
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
        <span className={cn("caption", totalPercentClassNames)}>
          {totalPercent}%
        </span>
      )}
    </div>
  );
};
