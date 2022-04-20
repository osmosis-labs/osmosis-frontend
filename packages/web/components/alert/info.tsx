import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { CustomClasses } from "../types";
import { Alert } from "./types";

export const Info: FunctionComponent<
  Alert & { data: string } & CustomClasses
> = ({ message, caption, data, className }) => (
  <div
    className={classNames(
      "flex gap-3 w-full border border-secondary-200 rounded-2xl px-5 py-4",
      className
    )}
  >
    <div className="my-auto">
      <Image
        alt="error"
        src="/icons/info-secondary-200.svg"
        height={24}
        width={24}
      />
    </div>
    <div className="flex grow place-content-between">
      <div className="flex flex-col">
        <h6>{message}</h6>
        {caption && <span className="text-iconDefault body2">{caption}</span>}
      </div>
      <div className="flex flex-col place-content-around">
        <h6>{data}</h6>
      </div>
    </div>
  </div>
);
