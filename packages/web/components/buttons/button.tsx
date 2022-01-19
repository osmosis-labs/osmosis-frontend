import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";

interface Props {
  color?: "primary" | "secondary";
  size?: "xs" | "md" | "lg";
  style?: "block" | "arrow" | "border";
  className?: string;
}

const colorToClassName = (location: "bg" | "border") => ({
  primary: `${location}-primary-200`,
  secondary: `${location}-secondary-200`,
});
const sizeToClassName = {
  xs: "px-3 py-2",
  md: "px-4 py-3",
  lg: "px-5 py-4",
};

export const Button: FunctionComponent<Props> = ({
  color = "primary",
  size = "md",
  style = "block",
  className,
  children,
}) => (
  <button
    className={classNames(
      "flex justify-center items-center rounded-lg text-base",
      style === "arrow" ? "text-secondary-200" : "text-white-full",
      style === "block"
        ? colorToClassName("bg")[color]
        : style === "border"
        ? `border-solid border-2 ${colorToClassName("border")[color]}`
        : null,
      sizeToClassName[size],
      className
    )}
  >
    {children}
    {style === "arrow" && (
      <Image alt="" src="/icons/chevron-right.svg" height={32} width={32} />
    )}
  </button>
);
