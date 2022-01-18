import { FunctionComponent } from "react";
import classNames from "classnames";

const colorToClassName = {
  primary: "bg-primary-200",
};
const sizeToClassName = {
  sm: "px-4 py-3",
};

export const Button: FunctionComponent<{
  color: "primary";
  size: "sm";
  block?: boolean;
  className?: string;
}> = ({ color, size, block, className, children }) => {
  return (
    <button
      className={classNames(
        "flex justify-center items-center rounded-lg text-white-full text-base ",
        colorToClassName[color],
        sizeToClassName[size],
        className
      )}
    >
      {children}
    </button>
  );
};
