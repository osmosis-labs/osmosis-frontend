import classNames from "classnames";
import { ButtonHTMLAttributes, FunctionComponent } from "react";
import { CustomClasses } from "../types";
import { IS_FRONTIER } from "../../config";

export const Button: FunctionComponent<
  {
    mode?: "primary" | "primary-warning" | "secondary" | "tertiary";
    size?: "sm" | "normal";
  } & CustomClasses &
    ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
  const { mode = "primary", size = "normal", className, children } = props;

  return (
    <button
      {...props}
      className={classNames(
        "flex w-full items-center text-center place-content-center disabled:cursor-default transition-colors py-2",
        size === "sm" ? "h-10 px-5" : "h-[56px] px-6",
        mode === "tertiary" ? "rounded-md" : "rounded-xl",
        {
          "border-2 border-wosmongton-700 bg-wosmongton-700 hover:bg-wosmongton-400 hover:border-wosmongton-400":
            mode === "primary" && !props.disabled,
          "border-2 border-osmoverse-500 bg-osmoverse-500 text-osmoverse-100":
            (mode === "primary" || mode === "primary-warning") &&
            props.disabled,
          "border-0 bg-gradient-negative": mode === "primary-warning",
          "bg-transparent border-2":
            mode === "secondary" || mode === "tertiary",
          "border-wosmongton-400 hover:border-wosmongton-200":
            mode === "secondary" && !props.disabled,
          "border-osmoverse-600 text-osmoverse-400":
            mode === "secondary" && props.disabled,
          "border-osmoverse-400": mode === "tertiary" && !props.disabled,
          "text-osmoverse-1000":
            IS_FRONTIER &&
            !props.disabled &&
            (mode === "primary" || mode === "primary-warning"),
        },
        className
      )}
    >
      {typeof children === "string" ? (
        size === "sm" ? (
          <span className="button mx-auto md:text-subtitle1 md:font-subtitle1">
            {children}
          </span>
        ) : (
          <h6 className="mx-auto md:text-subtitle1 md:font-subtitle1">
            {children}
          </h6>
        )
      ) : (
        children
      )}
    </button>
  );
};
