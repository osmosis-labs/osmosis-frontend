import classNames from "classnames";
import { FunctionComponent, HTMLInputTypeAttribute, useState } from "react";
import AutosizeInput from "react-input-autosize";

import { CloseButton } from "../buttons";
import { ButtonProps } from "../buttons/types";
import { CustomClasses, Disableable, InputProps } from "../types";

const AutosizeInputAny: any = AutosizeInput;

/* https://www.figma.com/file/wQjMyxY0EnEk29gBzGDMe5/Osmosis-Component?node-id=3938%3A15177 */

/** Accessory button for the input box. */
export interface Button extends ButtonProps, CustomClasses, Disableable {
  label: string;
}

interface Props extends InputProps<string>, Disableable, CustomClasses {
  /** Style of the component, see Figma. */
  style?: "no-border" | "enabled" | "active" | "error";
  type?: HTMLInputTypeAttribute;
  /** Determine if input text is right justified. Setting to `true` will ignore all accessory buttons. */
  rightEntry?: boolean;
  /** Will only render the first two. If `clearButton` is enabled, will show that as long as `currentValue !== ""`. */
  labelButtons?: Button[];
  /** Show a clear button when `currentValue !== ""`. */
  clearButton?: boolean;
  /** Display a symbol after the input box, ex: '%'. */
  trailingSymbol?: string;
  inputClassName?: string;
  isAutosize?: boolean;
  inputRef?: React.MutableRefObject<HTMLInputElement | null>;
}

export const InputBox: FunctionComponent<Props> = ({
  currentValue,
  onInput,
  onFocus,
  onBlur,
  placeholder,
  style = "enabled",
  type,
  rightEntry = false,
  labelButtons = [],
  clearButton = false,
  trailingSymbol,
  inputClassName,
  disabled = false,
  className,
  isAutosize,
  inputRef,
  autoFocus,
}) => {
  const [inputFocused, setInputFocused] = useState(false);

  return (
    <div
      className={classNames(
        "flex h-fit w-full flex-nowrap justify-between rounded-lg bg-osmoverse-1000 px-2 text-white-high",
        {
          border: style !== "no-border",
          "border-osmoverse-200":
            style !== "no-border" && (style === "active" || inputFocused),
          "border-osmoverse-1000":
            style !== "no-border" && style === "enabled" && !inputFocused,
          "border-missionError": style === "error",
          "cursor-default border-white-disabled bg-osmoverse-800": disabled,
        },
        className
      )}
    >
      <label
        className="flex w-full shrink grow items-center"
        htmlFor="text-input"
      >
        {/* seems to be an issue with autosizeinput and react 18 types. Casting here to bypass.*/}
        {isAutosize ? (
          <AutosizeInputAny
            inputRef={(ref: any) => {
              if (inputRef) {
                inputRef.current = ref;
              }
            }}
            inputClassName={inputClassName}
            minWidth={0}
            value={currentValue}
            onInput={(e: any) => onInput(e.target.value)}
            onBlur={onBlur}
            onFocus={(e: any) => {
              setInputFocused(true);
              onFocus && onFocus(e);
            }}
            autoFocus={autoFocus}
          />
        ) : (
          <input
            ref={inputRef}
            id="text-input"
            className={classNames(
              "md:leading-0 w-full appearance-none bg-transparent pt-px align-middle leading-10 placeholder:text-osmoverse-500 md:p-0",
              {
                "text-white-disabled": disabled,
                "text-white-high": currentValue != "" && !disabled,
                "float-right text-right": rightEntry,
                "pr-1": !trailingSymbol,
              },
              inputClassName
            )}
            value={currentValue}
            placeholder={placeholder ?? ""}
            autoComplete="off"
            type={type}
            onBlur={(e: any) => {
              setInputFocused(false);
              onBlur && onBlur(e);
            }}
            onFocus={(e: any) => {
              setInputFocused(true);
              onFocus && onFocus(e);
            }}
            onInput={(e: any) => onInput(e.target.value)}
            onClick={(e: any) => e.target.select()}
            disabled={disabled}
            autoFocus={autoFocus}
          />
        )}
        {trailingSymbol && <span>{trailingSymbol}</span>}
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
            labelButtons
              .slice(0, 2)
              .map(
                (
                  { label, onClick, disabled: labelButtonDisabled, className },
                  index
                ) => (
                  <button
                    key={index}
                    className={classNames(
                      "button mt-2.5 h-[1.375rem] select-none rounded-lg border-2 border-wosmongton-200 bg-wosmongton-200/30",
                      {
                        "opacity-30": disabled || labelButtonDisabled,
                        "hover:bg-wosmongton-200/60":
                          !disabled && !labelButtonDisabled,
                      },
                      className
                    )}
                    onClick={onClick}
                    disabled={disabled || labelButtonDisabled}
                  >
                    <span className="mx-2 text-caption">{label}</span>
                  </button>
                )
              )
          ))}
      </div>
    </div>
  );
};
