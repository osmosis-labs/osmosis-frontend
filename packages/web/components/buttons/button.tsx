import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { ButtonProps } from "./types";

interface Props extends ButtonProps {
  color?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  type?: "block" | "arrow" | "outline";
  className?: string;
  disabled?: boolean;
}

export const Button: FunctionComponent<Props> = ({
  onClick,
  color = "primary",
  size = "md",
  type = "block",
  className,
  disabled = false,
  children,
}) => (
  <button
    className={classNames(
      "flex justify-center items-center rounded-lg text-base",
      {
        "opacity-50": disabled,
        "text-secondary-200": type === "arrow",
        "text-white-full": type !== "arrow",
        "bg-primary-200": color === "primary" && type === "block",
        "bg-secondary-200": color === "secondary" && type === "block",
        "border-solid border-2 border-primary-200": type === "outline",
        "px-3 py-2": size === "sm",
        "px-4 py-3": size === "md",
        "px-5 py-4": size === "lg",
      },
      className
    )}
    disabled={disabled}
    onClick={onClick}
  >
    <div className="px-3 select-none font-button">{children}</div>
    {type === "arrow" && (
      <Image alt="" src="/icons/chevron-right.svg" height={32} width={32} />
    )}
  </button>
);
