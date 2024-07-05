import classNames from "classnames";
import { FunctionComponent, useState } from "react";
import { Optional } from "utility-types";

import { InputProps } from "~/components/types";
import { useControllableState } from "~/hooks/use-controllable-state";

type ClassVariants = "label" | "textarea" | "trailingSymbol";

interface TextareaBoxProps
  extends Optional<InputProps<string>, "currentValue"> {
  textareaKey?: string;
  /** Style of the component, see Figma. */
  style?: "no-border" | "enabled" | "active" | "error";
  /** Determine if textarea text is right justified. Setting to `true` will ignore all accessory buttons. */
  rightEntry?: boolean;
  /** Show a clear button when `currentValue !== ""`. */
  clearButton?: boolean;
  /** Display a symbol after the textarea box, ex: '%'. */
  trailingSymbol?: React.ReactNode;
  textareaRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
  classes?: Partial<Record<ClassVariants, string>>;
  /** Use a textarea instead of an input */
  isTextarea?: boolean;
  rows?: number;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export const TextareaBox: FunctionComponent<TextareaBoxProps> = ({
  textareaKey,
  currentValue,
  onInput,
  onFocus,
  onBlur,
  placeholder,
  style = "enabled",
  rightEntry = false,
  trailingSymbol,
  classes,
  disabled = false,
  className,
  textareaRef,
  autoFocus,
  defaultValue,
  rows,
  id,
}) => {
  const [textareaFocused, setTextareaFocused] = useState(false);
  const [textareaValue, setValue] = useControllableState({
    value: currentValue,
    defaultValue,
    onChange: onInput,
  });

  return (
    <div
      className={classNames(
        "flex h-fit w-full flex-nowrap justify-between rounded-lg bg-osmoverse-1000 px-2 text-white-high",
        {
          border: style !== "no-border",
          "border-osmoverse-200":
            style !== "no-border" && (style === "active" || textareaFocused),
          "border-osmoverse-1000":
            style !== "no-border" && style === "enabled" && !textareaFocused,
          "border-missionError": style === "error",
          "cursor-default border-white-disabled bg-osmoverse-800": disabled,
        },
        className
      )}
    >
      <div className={classNames("flex w-full shrink grow", classes?.label)}>
        <textarea
          id={id}
          key={textareaKey}
          ref={textareaRef}
          className={classNames(
            "md:leading-0 w-full resize-none appearance-none bg-transparent pt-px align-middle leading-10 outline-none placeholder:text-osmoverse-500 md:p-0",
            {
              "text-white-disabled": disabled,
              "text-white-high": currentValue != "" && !disabled,
              "float-right text-right": rightEntry,
              "pr-1": !trailingSymbol,
            },
            classes?.textarea
          )}
          value={textareaValue}
          placeholder={placeholder ?? ""}
          autoComplete="off"
          onBlur={(e: any) => {
            setTextareaFocused(false);
            onBlur && onBlur(e);
          }}
          onFocus={(e: any) => {
            setTextareaFocused(true);
            onFocus && onFocus(e);
          }}
          onInput={(e: any) => setValue(e.target.value)}
          disabled={disabled}
          autoFocus={autoFocus}
          rows={rows}
          data-1p-ignore
          data-enable-grammarly="false"
        />

        {trailingSymbol && (
          <span className={classNames("pt-3", classes?.trailingSymbol)}>
            {trailingSymbol}
          </span>
        )}
      </div>
    </div>
  );
};
