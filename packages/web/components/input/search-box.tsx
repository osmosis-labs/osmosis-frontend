import Image from "next/image";
import { DOMAttributes, forwardRef, useState } from "react";
import classNames from "classnames";
import { InputProps, Disableable, CustomClasses } from "../types";

type SearchBoxProps = Omit<InputProps<string>, "currentValue"> &
  Disableable &
  CustomClasses & {
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
    },
    ref
  ) {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div
        className={classNames(
          "flex w-max flex-nowrap items-center justify-between gap-2 rounded-xl border border-osmoverse-500 py-[10px] px-5 transition-colors",
          {
            "opacity-50": disabled,
            "-m-px mx-0 border-2 border-osmoverse-200 px-[19px] md:m-0":
              isFocused,
          },
          className
        )}
      >
        <div className="mb-1 h-4 w-4 shrink-0">
          <Image alt="search" src="/icons/search.svg" height={16} width={16} />
        </div>
        <label className="shrink grow">
          <input
            ref={ref}
            className="placeholder:body2 h-full w-full appearance-none bg-transparent transition-colors placeholder:text-osmoverse-500"
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
