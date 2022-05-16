import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { CustomClasses } from "../types";
import { Alert } from "./types";

export const Error: FunctionComponent<
  Pick<Alert, "message"> & CustomClasses
> = ({ message, className }) => (
  <div
    className={classNames(
      "flex gap-3 w-fit bg-error rounded-lg text-emphasis px-4 py-1.5",
      className
    )}
  >
    <Image
      alt="error"
      src="/icons/info-white-emphasis.svg"
      height={16}
      width={16}
    />
    <span>{message}</span>
  </div>
);
