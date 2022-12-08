import { FunctionComponent } from "react";
import { ValidatorInfo } from "./types";

export const ValidatorInfoCell: FunctionComponent<ValidatorInfo> = ({
  value,
  imgSrc,
}) => (
  <div className="flex items-center md:gap-2 gap-3">
    <div className="rounded-full w-9 h-9 p-1 flex shrink-0">
      <img // don't use next/image because we may not know what origin the image is on, next.config.js requires listed origins
        className="rounded-full"
        alt=""
        placeholder=""
        src={imgSrc ?? "/icons/profile.svg"}
      />
    </div>
    <span>{value ?? ""}</span>
  </div>
);
