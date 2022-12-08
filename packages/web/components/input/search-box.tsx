import Image from "next/image";
import { FunctionComponent, useState } from "react";
import classNames from "classnames";
import { InputProps, Disableable, CustomClasses } from "../types";

export const SearchBox: FunctionComponent<
  InputProps<string> & Disableable & CustomClasses & { type?: string }
> = ({
  currentValue,
  onInput,
  onFocus,
  placeholder,
  type,
  disabled = false,
  autoFocus,
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div
      className={classNames(
        "flex items-center flex-nowrap gap-2 justify-between w-max rounded-xl py-[10px] px-5 border border-osmoverse-500 transition-colors",
        {
          "opacity-50": disabled,
          "-m-px mx-0 md:m-0 px-[19px] border-2 border-osmoverse-200":
            isFocused,
        },
        className
      )}
    >
      <div className="h-4 w-4 mb-1 shrink-0">
        <Image alt="search" src="/icons/search.svg" height={16} width={16} />
      </div>
      <label className="grow shrink">
        <input
          className="w-full h-full appearance-none bg-transparent placeholder:body2 placeholder:text-osmoverse-500 transition-colors"
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
        />
      </label>
    </div>
  );
};
