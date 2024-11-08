import { FunctionComponent } from "react";

export interface ValidatorInfo {
  name?: string;
  imgSrc?: string;
}

export const ValidatorInfoCell: FunctionComponent<ValidatorInfo> = ({
  name,
  imgSrc,
}) => (
  <div className="flex items-center gap-3 md:gap-2">
    <div className="flex h-9 w-9 shrink-0 rounded-full p-1">
      <img // don't use next/image because we may not know what origin the image is on, next.config.js requires listed origins
        className="rounded-full"
        alt=""
        src={imgSrc ?? "/icons/profile.svg"}
      />
    </div>
    <span>{name ?? ""}</span>
  </div>
);
