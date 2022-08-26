import Image from "next/image";
import classNames from "classnames";
import { FunctionComponent } from "react";
import { ButtonProps } from "../buttons/types";
import { CustomClasses, Disableable } from "../types";

export type Source = {
  id: string;
  iconUrl: string;
  displayName: string;
};

export const AssetSource: FunctionComponent<
  Source & { isSelected?: boolean } & Partial<ButtonProps> &
    CustomClasses &
    Disableable
> = ({
  iconUrl,
  displayName,
  isSelected = false,
  onClick,
  className,
  disabled,
}) => (
  <button
    className={classNames(
      "flex flex-col gap-4 rounded-2xl bg-background py-8",
      {
        "bg-primary-600": isSelected,
        "opacity-30": disabled,
      },
      className
    )}
    disabled={disabled}
    onClick={onClick}
  >
    <div
      className={classNames("mx-auto transition", {
        "-rotate-6 scale-110": isSelected,
      })}
    >
      <Image src={iconUrl} width={52} height={52} alt="wallet logo" />
    </div>
    <div className="mx-auto">
      <h6>{displayName}</h6>
    </div>
  </button>
);
