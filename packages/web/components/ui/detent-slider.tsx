import classNames from "classnames";
import { FunctionComponent } from "react";

import { Slider } from "~/components/ui/slider";

/** Radix insets thumb travel by the thumb's width, so pure track percents
 *  drift from the thumb position toward the ends; compensate so the dots
 *  line up with where the thumb actually sits at each detent. */
const THUMB_WIDTH_PX = 20;
const thumbAlignedLeft = (percent: number) =>
  `calc(${percent}% + ${(0.5 - percent / 100) * THUMB_WIDTH_PX}px)`;

/**
 * Single-value slider with detent dots rendered inside the track, matching
 * the swap tool's balance-fraction slider: solid fill, dots that flip
 * contrast on the filled vs unfilled side of the handle.
 */
export const DetentSlider: FunctionComponent<{
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Values (in the slider's own scale) at which to render dots. */
  detents: number[];
  onChange: (value: number) => void;
  ariaLabel: string;
  disabled?: boolean;
}> = ({
  value,
  min,
  max,
  step = 1,
  detents,
  onChange,
  ariaLabel,
  disabled,
}) => {
  const toPercent = (v: number) =>
    max === min ? 0 : ((v - min) / (max - min)) * 100;

  return (
    <div className="relative flex w-full items-center py-1">
      <div className="pointer-events-none absolute inset-x-0 z-[1] flex h-full items-center">
        {detents.map((detent) => (
          <div
            key={detent}
            className={classNames(
              "absolute h-2 w-2 -translate-x-1/2 rounded-full",
              detent <= value ? "bg-osmoverse-800" : "bg-osmoverse-300"
            )}
            style={{ left: thumbAlignedLeft(toPercent(detent)) }}
          />
        ))}
      </div>
      <Slider
        variant="solid"
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-label={ariaLabel}
        onValueChange={([next]) => onChange(next)}
      />
    </div>
  );
};
