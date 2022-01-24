import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { InputProps, Disableable, CustomClasses } from "../types";

interface Props
  extends Required<InputProps<string>>,
    Disableable,
    CustomClasses {
  /** Style of the component, see Figma. */
  state?: "enabled" | "active" | "error";
}

export const SearchBox: FunctionComponent<Props> = ({
  currentValue,
  onChange,
  placeholder,
  state = "enabled",
  disabled = false,
  className,
}) => (
  <div
    className={classNames(
      "flex flex-nowrap w-48 h-8 rounded-xl pr-1 pl-2 text-white-high border text-sm",
      {
        "border-secondary-200": state === "active" || state === "enabled",
        "border-missionError": state === "error",
        "cursor-default bg-[#C4A46A14] border-white-disabled": disabled,
      },
      className
    )}
  >
    <Image
      className="shrink-0"
      alt="search"
      src="/icons/search-hollow.svg"
      height={14}
      width={14}
    />
    <label
      className="grow max-w-[92%] shrink h-full  pl-3"
      htmlFor="text-search"
    >
      <input
        id="text-search"
        className={classNames(
          "h-full max-w-[92%] appearance-none bg-transparent pt-px",
          {
            "text-white-disabled": disabled,
          }
        )}
        value={currentValue}
        placeholder={placeholder}
        size={Math.min(
          Math.max(currentValue.length + 1, placeholder.length + 1),
          21
        )}
        autoComplete="off"
        onInput={(e: any) => onChange(e.target.value)}
        onClick={(e: any) => e.target.select()}
        disabled={disabled}
      />
    </label>
  </div>
);
