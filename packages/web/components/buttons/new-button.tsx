import classNames from "classnames";
import { ButtonHTMLAttributes, FunctionComponent } from "react";
import { CustomClasses } from "../types";

export const NewButton: FunctionComponent<
  {
    mode?: "primary" | "primary-warning" | "secondary";
    size?: "sm" | "normal";
  } & CustomClasses &
    ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
  const { mode = "primary", size = "normal", className, children } = props;

  return (
    <button
      {...props}
      className={classNames(
        "flex items-center text-center rounded-xl disabled:text-osmoverse-100 disabled:cursor-default py-2",
        size === "sm" ? "px-5" : "px-6",
        {
          "bg-wosmongton-700 hover:bg-wosmongton-400":
            mode === "primary" && !props.disabled,
          "bg-transparent border hover:border-2":
            mode === "secondary" && !props.disabled,
          "bg-osmoverse-500": props.disabled,
        },
        className
      )}
    >
      {typeof children === "string" ? (
        size === "sm" ? (
          <span className="subtitle1 mx-auto">{children}</span>
        ) : (
          <h6 className="mx-auto">{children}</h6>
        )
      ) : (
        children
      )}
    </button>
  );
};
