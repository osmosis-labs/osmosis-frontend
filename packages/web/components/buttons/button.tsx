import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { CustomClasses, Disableable } from "../types";
import { ButtonProps } from "./types";

interface Props extends ButtonProps, CustomClasses, Disableable {
  color?: "primary" | "secondary" | "error";
  size?: "xs" | "sm" | "lg";
  type?: "block" | "arrow" | "arrow-sm" | "outline";
  loading?: boolean;
}

export const Button: FunctionComponent<Props> = ({
  onClick,
  color = "primary",
  size = "md",
  type = "block",
  loading = false,
  className,
  disabled = false,
  children,
}) => (
  <button
    className={classNames(
      "button flex justify-center items-center rounded-lg base",
      {
        "opacity-50": disabled && !loading,
        "opacity-70": disabled && loading,
        "bg-white-faint": disabled && !loading && type === "outline",
        "text-white-full":
          size !== "xs" || (type === "outline" && color === "primary"),
        [`text-secondary-200 ${!disabled ? "hover:text-secondary-100" : ""}`]:
          (color === "secondary" || type !== "outline") && size === "xs",
        [`bg-primary-200 ${!disabled ? "hover:bg-primary-100" : ""}`]:
          color === "primary" && size !== "xs" && type !== "outline",
        [`bg-primary-200/30 ${!disabled ? "hover:bg-primary-100/60" : ""}`]:
          color === "primary" && size === "xs" && type === "outline",
        [`${!disabled ? "hover:bg-secondary-100/60" : ""}`]:
          color === "secondary" && type === "outline" && size === "xs",
        [`border border-2 border-primary-200 ${
          !disabled ? "hover:border-primary-100" : ""
        }`]: (color === "primary" || size !== "xs") && type === "outline",
        [`border border-2 border-secondary-200 ${
          !disabled ? "hover:border-secondary-100" : ""
        }`]: color === "secondary" && size === "xs" && type === "outline",
        "bg-error": color === "error",
        "px-2 py-0.5": size === "xs",
        "px-3 py-1": size === "sm",
        "px-16 py-3": size === "lg",
      },
      className
    )}
    disabled={disabled}
    onClick={onClick}
  >
    <div
      className={classNames("select-none", size === "xs" ? "px-1.5" : "px-3", {
        subtitle2: size === "xs",
        subtitle1: size === "sm",
        "text-h6 font-h6": size === "lg",
      })}
    >
      {children}
    </div>
    {(type === "arrow" || type === "arrow-sm") && size === "xs" && (
      <div className="min-w-fit">
        <Image
          alt=""
          src="/icons/chevron-right.svg"
          height={type === "arrow" ? 13 : 6.67}
          width={type === "arrow" ? 8 : 4}
        />
      </div>
    )}
    {size !== "xs" && loading && (
      <Image alt="" src="/icons/loading.svg" height={24} width={24} />
    )}
  </button>
);
