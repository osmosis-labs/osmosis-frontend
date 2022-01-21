import { FunctionComponent } from "react";
import classNames from "classnames";
import { CustomClasses, NumberSelectProps } from "./types";
import style from "./slider.module.css";

interface Props extends NumberSelectProps, CustomClasses {
  step?: number;
}

export const Slider: FunctionComponent<Props> = ({
  currentValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className,
}) => {
  const percent = ((currentValue - min) * 100) / (max - min);
  return (
    <input
      type="range"
      className={classNames(style.slider, className)}
      style={{
        // calculate style of track-(thumb)-track
        background: `linear-gradient(to right, #C4A46A 0%, #C4A46A ${percent}%, rgba(196, 164, 106, 0.3) ${percent}%, rgba(196, 164, 106, 0.3) 100%)`,
      }}
      value={currentValue}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange((e.target as unknown as any).value as number)}
    />
  );
};
