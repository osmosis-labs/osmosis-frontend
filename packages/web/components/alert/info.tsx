import { FunctionComponent } from "react";
import classNames from "classnames";
import { CustomClasses, MobileProps } from "../types";
import { Alert } from "./types";

export const Info: FunctionComponent<
  { size?: "large" | "subtle" } & Alert & {
      data?: string;
      borderClassName?: string;
    } & CustomClasses &
    MobileProps
> = ({
  size = "large",
  message,
  caption,
  data,
  borderClassName,
  className,
  isMobile = false,
}) =>
  size === "subtle" ? (
    <div
      className={classNames(
        "w-full p-2 rounded-lg border border-rust-500",
        className
      )}
    >
      <span className="subtitle1 text-white-mid md:caption">{message}</span>
    </div>
  ) : (
    <div
      className={classNames(
        "flex gap-3 md:gap-1.5 w-full rounded-2xl bg-gradient-neutral p-px",
        borderClassName
      )}
    >
      <div
        className={classNames(
          "flex grow place-content-between md:gap-1 px-5 py-4 md:p-2 bg-osmoverse-800 rounded-2xlinset",
          {
            "items-center": !data,
          },
          className
        )}
      >
        <div className="flex flex-col">
          {isMobile ? (
            <span className="caption">
              {message}
              {data && ` - ${data}`}
            </span>
          ) : (
            <h6>{message}</h6>
          )}
          {caption && (
            <span className="text-osmoverse-400 body2 md:caption">
              {caption}
            </span>
          )}
        </div>
        {!isMobile && data && (
          <div className="flex flex-col place-content-around">
            <h6>{data}</h6>
          </div>
        )}
      </div>
    </div>
  );
