import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";

interface Props {
  onClick: () => void;
  color?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  type?: "block" | "arrow" | "border";
  className?: string;
  disabled?: boolean;
}

const colorToClassName = (location: "bg" | "border") => ({
  primary: `${location}-primary-200`,
  secondary: `${location}-secondary-200`,
});
const sizeToClassName = {
  sm: "px-3 py-2",
  md: "px-4 py-3",
  lg: "px-5 py-4",
};

export const Button: FunctionComponent<Props> = ({
  onClick,
  color = "primary",
  size = "md",
  type: style = "block",
  className,
  disabled = false,
  children,
}) => (
  <button
    className={classNames(
      "flex justify-center items-center rounded-lg text-base",
      disabled ? "opacity-50" : null,
      style === "arrow" ? "text-secondary-200" : "text-white-full",
      style === "block"
        ? colorToClassName("bg")[color]
        : style === "border"
        ? `border-solid border-2 ${colorToClassName("border")[color]}`
        : null,
      sizeToClassName[size],
      className
    )}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
    {style === "arrow" && (
      <Image alt="" src="/icons/chevron-right.svg" height={32} width={32} />
    )}
  </button>
);
