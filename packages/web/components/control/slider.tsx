import { FunctionComponent, useState, useRef, useEffect } from "react";
import classNames from "classnames";
import { CustomClasses, Disableable } from "../types";
import { NumberSelectProps } from "./types";

interface Props
  extends Omit<NumberSelectProps, "placeholder">,
    Disableable,
    CustomClasses {
  /** * `plain`: no number displayed.
   *  * `tooltip`: number above slider thumb.
   *  * `entrybox`: number as text box to right of slider. */
  type?: "plain" | "tooltip" | "entrybox";
  step?: number;
}

export const Slider: FunctionComponent<Props> = ({
  currentValue,
  onInput,
  min,
  max,
  type = "entrybox",
  step = 1,
  disabled,
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
  }, [type, percent, rangeRef, tooltipRef]);

  return (
    <div
      className="flex gap-3"
      onFocus={() => setShowDetail(true)}
      onBlur={() => setShowDetail(false)}
      onMouseOver={() => setShowDetail(true)}
      onMouseOut={() => setShowDetail(false)}
    >
      <div className={classNames(type === "tooltip" ? "absolute" : undefined)}>
        {type === "tooltip" && !disabled && (
          <div
            ref={tooltipRef}
            style={{
              position: "absolute",
              top: "-80%",
              visibility: showDetail ? "visible" : "hidden",
            }}
            className="sliderTooltip"
          ></div>
        )}
        <input
          ref={rangeRef}
          type="range"
          className={classNames(
            {
              showDetail: showDetail,
              disabled: disabled,
            },
            className
          )}
          style={{
            // calculate style of track-(thumb)-track
            background: `padding-box linear-gradient(to right, ${
              disabled ? "#ffffff61" : showDetail ? "#F4CC82" : "#C4A46A"
            } 0%, ${
              disabled ? "#ffffff61" : showDetail ? "#F4CC82" : "#C4A46A"
            } ${percent}%, ${
              disabled ? "#ffffff1f" : "#c4a46a4d"
            } ${percent}%, ${disabled ? "#ffffff1f" : "#c4a46a4d"} 100%)`,
            border: `1px solid ${disabled ? "#ffffff1f" : "#c4a46a4d"}`,
          }}
          value={currentValue}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          onChange={(e) =>
            onInput((e.target as unknown as any).value as number)
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
          disabled={disabled}
          onInput={(e: any) => {
            const num = Number(e.target.value);
            if (num >= min && num <= max) {
              onInput(num);
            }
          }}
        />
      )}
    </div>
  );
};
