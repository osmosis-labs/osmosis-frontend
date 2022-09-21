import classNames from "classnames";
import { ButtonHTMLAttributes, FunctionComponent } from "react";
import { CustomClasses, Disableable } from "../types";

export const NewButton: FunctionComponent<
  {
    mode?: "primary" | "primary-warning" | "secondary";
  } & CustomClasses &
    ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
  const { mode = "primary", className, children } = props;

  return (
    <button
      {...props}
      className={classNames(
        "flex items-center text-center w-[400px] h-16 rounded-xl",
        {
          "bg-wosmongton-700 hover:bg-wosmongton-400": mode === "primary",
          "bg-transparent border hover:border-2": mode === "secondary",
        },
        className
      )}
    >
      {typeof children === "string" ? <h6>{children}</h6> : children}
    </button>
  );
};
