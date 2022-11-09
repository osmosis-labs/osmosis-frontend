import Image from "next/image";
import classNames from "classnames";
import { FunctionComponent } from "react";
import { ButtonProps } from "../buttons/types";
import { CustomClasses, Disableable } from "../types";

export const AssetSourceCard: FunctionComponent<
  {
    id: string;
    iconUrl: string;
    displayName: string;
    isConnected?: boolean;
    isSelected?: boolean;
  } & Partial<ButtonProps> &
    CustomClasses &
    Disableable
> = ({
  iconUrl,
  displayName,
  isSelected = false,
  isConnected = false,
  onClick,
  className,
  disabled,
}) => (
  <button disabled={disabled} onClick={onClick}>
    <div
      className={classNames({
        "p-0.5 bg-wosmongton-200 rounded-2xl": isConnected,
      })}
    >
      <div
        className={classNames(
          "flex flex-col gap-4 bg-osmoverse-900 py-8",
          isConnected ? "rounded-2xlinset" : "rounded-2xl",
          {
            "bg-wosmongton-500": isSelected,
            "opacity-30": disabled,
          },
          className
        )}
      >
        <div
          className={classNames("mx-auto transition", {
            "-rotate-6 scale-110": isSelected,
          })}
        >
          <Image src={iconUrl} width={52} height={52} alt="wallet logo" />
        </div>
        <div className="mx-auto">
          <h6 className="md:caption">{displayName}</h6>
        </div>
      </div>
    </div>
  </button>
);
