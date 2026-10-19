import { FunctionComponent, useId } from "react";

/** Top-to-bottom gradient stops, cycled per segment. */
const DONUT_GRADIENTS: readonly (readonly [string, string])[] = [
  ["#6976FE", "#3339FF"],
  ["#FF7A45", "#FF00A7"],
  ["#FFBC00", "#FF8E00"],
  ["#00CEBA", "#008A7D"],
];

/** CSS background matching the segment at `index`, for legends. */
export function donutLegendGradient(index: number): string {
  const [from, to] = DONUT_GRADIENTS[index % DONUT_GRADIENTS.length];
  return `linear-gradient(180deg, ${from} 0%, ${to} 100%)`;
}

/** Ring thickness: inner diameter is 80% of the outer one. */
const INNER_RATIO = 0.8;
/** Gap between adjacent segments, in radians. */
const PAD_ANGLE = 0.04;
/** Keeps a single full segment from collapsing into a zero-length arc. */
const MAX_SWEEP = 2 * Math.PI - 1e-4;

function point(cx: number, r: number, angle: number) {
  return `${cx + r * Math.sin(angle)} ${cx - r * Math.cos(angle)}`;
}

/** Annulus segment between two angles, measured clockwise from 12 o'clock. */
function segmentPath(size: number, start: number, end: number): string {
  const c = size / 2;
  const outer = c;
  const inner = c * INNER_RATIO;
  const largeArc = end - start > Math.PI ? 1 : 0;
  return [
    `M ${point(c, outer, start)}`,
    `A ${outer} ${outer} 0 ${largeArc} 1 ${point(c, outer, end)}`,
    `L ${point(c, inner, end)}`,
    `A ${inner} ${inner} 0 ${largeArc} 0 ${point(c, inner, start)}`,
    "Z",
  ].join(" ");
}

/** Proportional ring chart. Non-finite or non-positive values are skipped. */
export const DonutChart: FunctionComponent<{
  size: number;
  values: number[];
}> = ({ size, values }) => {
  const idPrefix = useId().replace(/:/g, "");

  const segments = values
    .map((value, index) => ({ value, index }))
    .filter(({ value }) => Number.isFinite(value) && value > 0);
  const total = segments.reduce((sum, { value }) => sum + value, 0);
  if (total <= 0) return null;

  const pad = segments.length > 1 ? PAD_ANGLE : 0;
  const arcs: { index: number; d: string }[] = [];
  let angle = 0;
  for (const { value, index } of segments) {
    const sweep = Math.min((value / total) * 2 * Math.PI, MAX_SWEEP);
    // Segments too thin to afford the gap are drawn without it so they stay visible.
    const gap = sweep > 2 * pad ? pad : 0;
    const start = angle + gap / 2;
    const end = angle + sweep - gap / 2;
    arcs.push({ index, d: segmentPath(size, start, end) });
    angle += sweep;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      <defs>
        {segments.map(({ index }) => {
          const [from, to] = DONUT_GRADIENTS[index % DONUT_GRADIENTS.length];
          return (
            <linearGradient
              key={index}
              id={`${idPrefix}-${index}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={from} />
              <stop offset="100%" stopColor={to} />
            </linearGradient>
          );
        })}
      </defs>
      {arcs.map(({ index, d }) => (
        <path key={index} d={d} fill={`url(#${idPrefix}-${index})`} />
      ))}
    </svg>
  );
};
