import { FunctionComponent, useState, useRef, useEffect } from "react";
import classNames from "classnames";
import { CustomClasses } from "../types";
import { NumberSelectProps } from "./types";
import style from "./slider.module.css";

interface Props extends Omit<NumberSelectProps, "placeholder">, CustomClasses {
  /** * `plain`: no number displayed.
   *  * `tooltip`: number above slider thumb.
   *  * `entrybox`: number as text box to right of slider. */
  type?: "plain" | "tooltip" | "entrybox";
  step?: number;
}

export const Slider: FunctionComponent<Props> = ({
  currentValue,
  onChange,
  min,
  max,
  type = "entrybox",
  step = 1,
  className,
}) => {
  const [showDetail, setShowDetail] = useState(false);

  const percent = ((currentValue - min) * 90) / (max - min) + 5;
  const rangeRef = useRef(null);
  const tooltipRef = useRef(null);

  // Programmatically set tool tip dom nodes for tooltip slider.
  useEffect(() => {
    if (type === "tooltip" && rangeRef.current && tooltipRef.current) {
      const range = rangeRef.current as any;
      const tooltip = tooltipRef.current as any;
      var setValue = () => {
        const newValue = Number(
          ((range.value - range.min) * 100) / (range.max - range.min)
        ),
          newPosition = 10 - newValue * 0.2;
        tooltip.innerHTML = `<span>${range.value}</span>`;
        tooltip.style.left = `calc(${newValue}% + (${newPosition}px))`;
      };
      document.addEventListener("DOMContentLoaded", setValue);
      range.addEventListener("input", setValue);
      return () => {
        document.removeEventListener("DOMContentLoaded", setValue);
        range.removeEventListener("input", setValue);
      };
    }
  }, [percent, rangeRef, tooltipRef]);

  return (
    <div
      className="flex gap-3"
      onFocus={() => setShowDetail(true)}
      onBlur={() => setShowDetail(false)}
      onMouseOver={() => setShowDetail(true)}
      onMouseOut={() => setShowDetail(false)}
    >
      <div className={classNames(type === "tooltip" ? "absolute" : undefined)}>
        {type === "tooltip" && (
          <div
            ref={tooltipRef}
            style={{
              position: "absolute",
              top: "-80%",
              visibility: showDetail ? "visible" : "hidden",
            }}
            className={style.tooltip}
          ></div>
        )}
        <input
          ref={rangeRef}
          type="range"
          className={classNames(style.slider, className)}
          style={{
            // calculate style of track-(thumb)-track
            background: `padding-box linear-gradient(to right, #C4A46A 0%, #C4A46A ${percent}%, rgba(196, 164, 106, 0.3) ${percent}%, rgba(196, 164, 106, 0.3) 100%)`,
            border: "1px solid rgba(196, 164, 106, 0.3)",
          }}
          value={currentValue}
          min={min}
          max={max}
          step={step}
          onChange={(e) =>
            onChange((e.target as unknown as any).value as number)
          }
        />
      </div>
      {type === "entrybox" && (
        <input
          className="leading-tight border border-secondary-200 rounded-lg w-12 appearance-none bg-transparent text-center"
          type="text"
          size={Math.min(currentValue.toString().length, 3)}
          value={currentValue}
          inputMode="decimal"
          onInput={(e: any) => {
            const num = Number(e.target.value);
            if (num >= min && num <= max) {
              onChange(num);
            }
          }}
        />
      )}
    </div>
  );
};
