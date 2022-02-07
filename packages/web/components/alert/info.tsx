import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { CustomClasses } from "../types";

export const Info: FunctionComponent<
  { message: string; caption?: string; data: string } & CustomClasses
> = ({ message, caption, data, className }) => (
  <div
    className={classNames(
      "flex gap-3 w-full bg-background border border-secondary-200 rounded-lg px-5 py-4",
      className
    )}
  >
    <div>
      <Image
        alt="error"
        src="/icons/info-secondary-200.svg"
        height={24}
        width={24}
      />
    </div>
    <div className="flex grow place-content-between">
      <div className="flex flex-col">
        <span className="text-emphasis text-h6">{message}</span>
        {caption && (
          <span className="text-iconDefault text-body2">{caption}</span>
        )}
      </div>
      <div className="flex flex-col place-content-around">
        <span>{data}</span>
      </div>
    </div>
  </div>
);
