import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useEffect, useRef, useState } from "react";

import { normalize } from "../../utils/math";
import { CustomClasses, Disableable } from "../types";
import { NumberSelectProps } from "./types";

interface Props
  extends Omit<NumberSelectProps, "placeholder">,
    Disableable,
    CustomClasses {
  step?: number;
  inputClassName?: string;
}

export const Slider: FunctionComponent<Props> = observer(
  ({
    currentValue,
    onInput,
    min,
    max,
    step = 1,
    disabled,
    inputClassName,
    className,
  }) => {
    const [sliderWidth, setSliderWidth] = useState(1);

    // ensure background stays behind center of thumb
    const range = max - min;
    const percent = normalize(
      currentValue,
      max,
      min,
      min + (range * 10) / sliderWidth,
      max - (range * 10) / sliderWidth
    );
    const rangeRef = useRef(null);

    // get the slider width
    useEffect(() => {
      const rangeRf = rangeRef.current as any;
      const rangeWidth = parseInt(rangeRf.clientWidth);
      if (rangeRf && !isNaN(rangeWidth)) {
        setSliderWidth(rangeWidth);
      }
    }, []);

    return (
      <div
        className={classNames({
          "w-full":
            className?.split(" ").find((c) => c === "w-full") !== undefined,
        })}
      >
        <input
          ref={rangeRef}
          type="range"
          className={classNames(
            {
              disabled: disabled,
              "!w-full":
                className?.split(" ").find((c) => c === "w-full") !== undefined,
            },
            inputClassName
          )}
          style={{
            // calculate style of track-(thumb)-track
            background: `padding-box linear-gradient(to right, ${
              disabled ? "#3C356D" : "#462ADF"
            } 0%, ${disabled ? "#3C356D" : "#8A86FF"} ${percent}%, ${
              disabled ? "#ffffff1f" : "#3C356D4d"
            } ${percent}%, ${disabled ? "#ffffff1f" : "#3C356D4d"} 100%)`,
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
    );
  }
);
