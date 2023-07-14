import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useEffect, useRef, useState } from "react";

import { normalize } from "~/utils/math";
import { CustomClasses, Disableable } from "../types";
import { NumberSelectProps } from "./types";

interface Props
  extends Omit<NumberSelectProps, "placeholder">,
    Disableable,
    CustomClasses {
  step?: number;
  inputClassName?: string;
  useSuperchargedGradient?: boolean;
}

const defaultGradientTemplate =
  "padding-box linear-gradient(to right, %c1 0%, %c2 %p%, %c3 %p%, %c4 100%)";

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
    useSuperchargedGradient,
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

    const gradientStyle = defaultGradientTemplate
      .replace(
        /%c1/g,
        disabled ? "#3C356D" : useSuperchargedGradient ? "#EE64E8" : "#462ADF"
      )
      .replace(
        /%c2/g,
        disabled ? "#3C356D" : useSuperchargedGradient ? "#64C5EE" : "#8A86FF"
      )
      .replace(/%c3/g, disabled ? "#ffffff1f" : "#3C356D4d")
      .replace(/%c4/g, disabled ? "#ffffff1f" : "#3C356D4d")
      .replace(/%p/g, percent.toFixed(0));

    return (
      <div
        className={classNames(
          {
            "w-full":
              className?.split(" ").find((c) => c === "w-full") !== undefined,
          },
          className
        )}
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
            background: gradientStyle,
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
