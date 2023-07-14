import { RatePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { FunctionComponent } from "react";

import { CustomClasses } from "~/components/types";
import { generateRandom } from "~/utils/random";

import { ringFillColors } from ".";

// depends on packages/web/styles/circle.scss

const INITIAL_OFFSET = 25;
const circleConfig = {
  viewBox: "0 0 38 38",
  x: "19",
  y: "19",
  radio: "15.91549430918954",
};

export const RateRing: FunctionComponent<
  {
    percentage: RatePretty;
    /** Leave undefined for random ring color style. */
    colorIndex?: number;
  } & CustomClasses
> = ({ percentage, colorIndex, className }) => {
  const percentageNum = Number(percentage.toDec().toString()) * 100;

  return (
    <figure className={classNames("h-16 w-16", className)}>
      <svg viewBox={circleConfig.viewBox}>
        <SvgGradient id="gradient" gradientIndex={colorIndex} />
        <circle
          className="ring"
          cx={circleConfig.x}
          cy={circleConfig.y}
          r={circleConfig.radio}
          fill="transparent"
          stroke="#170F34"
          strokeWidth="6%"
        />

        <circle
          className="path"
          cx={circleConfig.x}
          cy={circleConfig.y}
          r={circleConfig.radio}
          fill="transparent"
          stroke="url(#gradient)"
          strokeWidth="6%"
          strokeDasharray={`${percentageNum} ${100 - percentageNum}`}
          strokeDashoffset={INITIAL_OFFSET}
        />
        <g style={{ transform: "translateY(0.25em)" }} className="circle-label">
          <text
            x="50%"
            y="50%"
            style={{
              fontSize: "0.7rem",
              lineHeight: "1.5rem",
              fontWeight: 600,
              fill: "rgba(255, 255, 255, 0.87)",
              letterSpacing: "0.15px",
              textAnchor: "middle",
              transform: "translateY(0em)",
            }}
          >
            {percentage.toString()}
          </text>
        </g>
      </svg>
    </figure>
  );
};

const SvgGradient: FunctionComponent<{
  id: string;
  gradientIndex?: number;
}> = ({ id, gradientIndex }) => (
  <linearGradient id={id}>
    <stop
      stopColor={generateRandom(
        gradientIndex !== undefined ? Math.max(gradientIndex, 0) : undefined,
        ringFillColors
      )}
      offset="0%"
    />
    <stop
      stopColor={generateRandom(
        gradientIndex !== undefined
          ? Math.max(gradientIndex, 0) + 2
          : undefined,
        ringFillColors
      )}
      offset="100%"
    />
  </linearGradient>
);
