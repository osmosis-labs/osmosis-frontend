import { FunctionComponent } from "react";

export const RadialProgress: FunctionComponent<{
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
