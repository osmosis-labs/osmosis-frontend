import { DOMAttributes, forwardRef, useState } from "react";
import classNames from "classnames";
import { InputProps, Disableable, CustomClasses } from "../types";
import { Icon } from "../assets";
import { cva, VariantProps } from "class-variance-authority";

const searchBoxClasses = cva(
  "flex flex-nowrap items-center justify-between gap-2 rounded-xl border border-osmoverse-500 transition-colors [&_input]:placeholder:text-osmoverse-500 [&_input]:placeholder:font-medium",
  {
    variants: {
      /**
       * Sizes modify the following properties:
       * - height
       * - width
       * - padding
       * - font size
       * - font weight
       * - line height
       * - letter spacing
       */
      size: {
        small: "h-10 px-5 w-max [&_input]:text-body2 [&_input]:font-body2",
        medium: "h-12 px-5 w-max [&_input]:text-body2 [&_input]:font-body2",
        large: "h-14 px-5 w-max [&_input]:text-body1 [&_input]:font-body2",
      },
    },
    defaultVariants: {
      size: "medium",
    },
  }
);

type SearchBoxProps = Omit<InputProps<string>, "currentValue"> &
  Disableable &
  CustomClasses &
  VariantProps<typeof searchBoxClasses> & {
    type?: string;
    currentValue?: string;
    onKeyDown?: DOMAttributes<HTMLInputElement>["onKeyDown"];
  };

export const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(
  function SearchBox(
    {
      currentValue,
      onInput,
      onFocus,
      placeholder,
      type,
      disabled = false,
      autoFocus,
      className,
      onKeyDown,
      size,
    },
    ref
  ) {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div
        className={classNames(
          searchBoxClasses({ size }),
          {
            "opacity-50": disabled,
            "border-2 border-osmoverse-200 px-[19px]": isFocused,
          },
          className
        )}
      >
        <div className="h-4 w-4 shrink-0 text-osmoverse-300">
          <Icon id="search" height={16} width={16} />
        </div>
        <label className="shrink grow">
          <input
            ref={ref}
            className="h-full w-full appearance-none bg-transparent tracking-wider transition-colors"
            value={currentValue}
            type={type}
            autoFocus={autoFocus}
            placeholder={placeholder}
            autoComplete="off"
            onFocus={(e: any) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={() => setIsFocused(false)}
            onInput={(e: any) => onInput(e.target.value)}
            onClick={(e: any) => e.target.select()}
            disabled={disabled}
            onKeyDown={onKeyDown}
          />
        </label>
      </div>
    );
  }
);
