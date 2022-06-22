import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { CustomClasses, MobileProps } from "../types";
import { Alert } from "./types";

export const Info: FunctionComponent<
  { size?: "large" | "subtle" } & Alert & { data?: string } & CustomClasses &
    MobileProps
> = ({ size = "large", message, caption, data, className, isMobile = false }) =>
  size === "subtle" ? (
    <div
      className={classNames(
        "w-full p-2 rounded-lg border border-secondary-200",
        className
      )}
    >
      <span className="subtitle1 text-white-mid md:caption">{message}</span>
    </div>
  ) : (
    <div
      className={classNames(
        "flex gap-3 md:gap-1.5 w-full border border-secondary-200 rounded-2xl px-5 py-4 md:p-2",
        className
      )}
    >
      <div className="flex items-center">
        <Image
          alt="error"
          src="/icons/info-secondary-200.svg"
          height={isMobile ? 16 : 24}
          width={isMobile ? 16 : 24}
        />
      </div>
      <div
        className={classNames("flex grow place-content-between md:gap-1", {
          "items-center": !data,
        })}
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
            <span className="text-iconDefault body2 md:caption">{caption}</span>
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
