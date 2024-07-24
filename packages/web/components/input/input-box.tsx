import classNames from "classnames";
import { FunctionComponent, HTMLInputTypeAttribute, useState } from "react";
import AutosizeInput from "react-input-autosize";
import { Optional } from "utility-types";

import { ButtonProps } from "~/components/buttons/types";
import { CustomClasses, Disableable, InputProps } from "~/components/types";
import { useControllableState } from "~/hooks/use-controllable-state";

/* https://www.figma.com/file/wQjMyxY0EnEk29gBzGDMe5/Osmosis-Component?node-id=3938%3A15177 */

/** Accessory button for the input box. */
export interface Button extends ButtonProps, CustomClasses, Disableable {
  label: string;
}

type ClassVariants = "container" | "label" | "input" | "trailingSymbol";

interface Props
  extends Optional<InputProps<string>, "currentValue">,
    Disableable,
    CustomClasses {
  inputKey?: string;
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
  trailingSymbol?: React.ReactNode;
  /** @deprecated Use 'classes' instead */
  inputClassName?: string;
  isAutosize?: boolean;
  inputRef?: React.MutableRefObject<HTMLInputElement | null>;
  classes?: Partial<Record<ClassVariants, string>>;
  styles?: Partial<Record<ClassVariants, React.CSSProperties>>;
  onClick?: () => void;
}

export const InputBox: FunctionComponent<Props> = ({
  inputKey,
  currentValue,
  onInput,
  onFocus,
  onBlur,
  placeholder,
  style = "enabled",
  type,
  rightEntry = false,
  labelButtons = [],
  trailingSymbol,
  inputClassName,
  classes,
  disabled = false,
  className,
  isAutosize,
  inputRef,
  autoFocus,
  defaultValue,
  styles,
  onClick,
}) => {
  const [inputFocused, setInputFocused] = useState(false);
  const [inputValue, setValue] = useControllableState({
    value: currentValue,
    defaultValue,
    onChange: onInput,
  });

  const inputClassName_ = classNames(
    "md:leading-0 w-full appearance-none bg-transparent pt-px align-middle leading-10 placeholder:text-osmoverse-500 md:p-0",
    {
      "text-white-disabled": disabled,
      "text-white-high": currentValue != "" && !disabled,
      "float-right text-right": rightEntry,
      "pr-1": !trailingSymbol,
    },
    classes?.input,
    inputClassName
  );

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
      style={styles?.container}
      onClick={onClick}
    >
      <label
        className={classNames(
          "flex w-full shrink grow items-center",
          classes?.label
        )}
        style={styles?.label}
        htmlFor="text-input"
      >
        {isAutosize ? (
          <AutosizeInput
            key={inputKey}
            inputRef={(ref) => {
              if (inputRef) {
                inputRef.current = ref;
              }
            }}
            inputClassName={inputClassName_}
            minWidth={0}
            value={inputValue}
            onInput={(e: any) => setValue(e.target.value)}
            onBlur={onBlur}
            onFocus={(e: any) => {
              setInputFocused(true);
              onFocus && onFocus(e);
            }}
            autoFocus={autoFocus}
            style={styles?.input}
          />
        ) : (
          <input
            key={inputKey}
            ref={inputRef}
            id="text-input"
            className={inputClassName_}
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
            disabled={disabled}
            autoFocus={autoFocus}
            style={styles?.input}
          />
        )}
        {trailingSymbol && (
          <span
            className={classes?.trailingSymbol}
            style={styles?.trailingSymbol}
          >
            {trailingSymbol}
          </span>
        )}
      </label>
      <div className="flex flex-nowrap gap-2">
        {!rightEntry &&
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
            )}
      </div>
    </div>
  );
};
