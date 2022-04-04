import { FunctionComponent, useState } from "react";
import classNames from "classnames";
import { InputProps, Disableable, CustomClasses } from "../types";
import { ButtonProps } from "../buttons/types";
import { CloseButton } from "../buttons";

/* https://www.figma.com/file/wQjMyxY0EnEk29gBzGDMe5/Osmosis-Component?node-id=3938%3A15177 */

/** Accessory button for the input box. */
export interface Button extends ButtonProps, CustomClasses {
  label: string;
}

interface Props extends InputProps<string>, Disableable, CustomClasses {
  /** Style of the component, see Figma. */
  style?: "no-border" | "enabled" | "active" | "error";
  /** Determine if input text is right justified. Setting to `true` will ignore all accessory buttons. */
  rightEntry?: boolean;
  /** Will only render the first two. If `clearButton` is enabled, will show that as long as `currentValue !== ""`. */
  labelButtons?: Button[];
  /** Show a clear button when `currentValue !== ""`. */
  clearButton?: boolean;
  inputClassName?: string;
}

export const InputBox: FunctionComponent<Props> = ({
  currentValue,
  onInput,
  placeholder,
  style = "enabled",
  rightEntry = false,
  labelButtons = [],
  clearButton = false,
  inputClassName,
  disabled = false,
  className,
}) => {
  const [inputFocused, setInputFocused] = useState(false);

  return (
    <div
      className={classNames(
        "flex flex-nowrap justify-between w-full h-fit mad-h-2 rounded-lg px-2 text-white-high bg-background",
        {
          border: style !== "no-border",
          "border-secondary-200":
            style !== "no-border" && (style === "active" || inputFocused),
          "border-background":
            style !== "no-border" && style === "enabled" && !inputFocused,
          "border-missionError": style === "error",
          "cursor-default bg-[#C4A46A14] border-white-disabled": disabled,
        },
        className
      )}
    >
      <label className="grow shrink w-fit" htmlFor="text-input">
        <input
          id="text-input"
          className={classNames(
            "w-full appearance-none bg-transparent align-middle leading-10 pt-px pr-1",
            {
              "text-white-disabled": disabled,
              "text-white-high": currentValue != "" && !disabled,
              "text-right float-right": rightEntry,
            },
            inputClassName
          )}
          value={currentValue}
          placeholder={placeholder}
          autoComplete="off"
          onBlur={() => setInputFocused(false)}
          onFocus={() => setInputFocused(true)}
          onInput={(e: any) => onInput(e.target.value)}
          onClick={(e: any) => e.target.select()}
          disabled={disabled}
        />
      </label>
      <div className="flex flex-nowrap gap-2">
        {!rightEntry &&
          (clearButton && currentValue !== "" ? (
            <CloseButton
              className="my-2.5 mr-1.5"
              onClick={() => onInput("")}
              disabled={disabled}
            />
          ) : (
            labelButtons.slice(0, 2).map(({ label, onClick, className }, i) => (
              <button
                key={i}
                className={classNames(
                  "h-8 border-2 border-primary-200 rounded-lg my-1.5 bg-[#322dc24d] select-none",
                  {
                    "opacity-30": disabled,
                  },
                  className
                )}
                onClick={onClick}
                disabled={disabled}
              >
                <span className="mx-2">{label}</span>
              </button>
            ))
          ))}
      </div>
    </div>
  );
};
