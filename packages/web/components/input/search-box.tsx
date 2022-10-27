import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { InputProps, Disableable, CustomClasses } from "../types";

export const SearchBox: FunctionComponent<
  InputProps<string> & Disableable & CustomClasses
> = ({
  currentValue,
  onInput,
  onFocus,
  placeholder,
  disabled = false,
  className,
}) => (
  <div
    className={classNames(
      "flex items-center flex-nowrap gap-3 justify-between w-max rounded-xl py-[10px] px-5 border border-osmoverse-500",
      {
        "opacity-50": disabled,
      },
      className
    )}
  >
    <div className="h-4 w-4 mb-1 shrink-0">
      <Image alt="search" src="/icons/search.svg" height={16} width={16} />
    </div>
    <label className="grow shrink">
      <input
        className="w-full h-full appearance-none bg-transparent placeholder:text-osmoverse-400 placeholder:body1"
        value={currentValue}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={(e: any) => onFocus?.(e)}
        onInput={(e: any) => onInput(e.target.value)}
        onClick={(e: any) => e.target.select()}
        disabled={disabled}
      />
    </label>
  </div>
);
