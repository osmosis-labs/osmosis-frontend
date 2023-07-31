import classNames from "classnames";
import { FunctionComponent } from "react";

import { Alert } from "~/components/alert/types";
import { CustomClasses, MobileProps } from "~/components/types";

export const Info: FunctionComponent<
  { size?: "large" | "subtle" } & Alert & {
      data?: string;
      borderClassName?: string;
      textClassName?: string;
    } & CustomClasses &
    MobileProps
> = ({
  size = "large",
  message,
  caption,
  data,
  borderClassName,
  textClassName,
  className,
  isMobile = false,
}) =>
  size === "subtle" &&
  typeof message === "string" &&
  typeof caption === "string" ? (
    <div
      className={classNames(
        "w-full rounded-lg border border-rust-500 p-2",
        className
      )}
    >
      <span
        className={classNames(
          "subtitle1 md:caption text-wosmongton-100",
          textClassName
        )}
      >
        {message}
      </span>
    </div>
  ) : (
    <div
      className={classNames(
        "flex w-full gap-3 rounded-2xl bg-gradient-neutral p-px md:gap-1.5",
        borderClassName
      )}
    >
      <div
        className={classNames(
          "flex grow place-content-between rounded-2xlinset bg-osmoverse-800 px-3 py-2 md:gap-1 md:p-2",
          {
            "items-center": !data,
          },
          className
        )}
      >
        <div className="flex flex-col">
          {isMobile ? (
            <span className={classNames("caption", textClassName)}>
              {message}
              {data && ` - ${data}`}
            </span>
          ) : (
            <span className={classNames("body2", textClassName)}>
              {message}
            </span>
          )}
          {caption && (
            <span
              className={classNames(
                "body2 md:caption text-wosmongton-100",
                textClassName
              )}
            >
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
