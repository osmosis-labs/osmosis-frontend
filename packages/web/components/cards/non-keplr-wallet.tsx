import Image from "next/image";
import classNames from "classnames";
import { FunctionComponent } from "react";
import { WalletDisplay } from "../../integrations/wallets";
import { ButtonProps } from "../buttons/types";
import { CustomClasses } from "../types";

export const NonKeplrWalletCard: FunctionComponent<
  WalletDisplay & { isSelected?: boolean } & Partial<ButtonProps> &
    CustomClasses
> = ({
  iconUrl,
  displayName,
  caption,
  isSelected = false,
  onClick,
  className,
}) => (
  <button
    className={classNames(
      "flex flex-col gap-4 rounded-2xl bg-background py-8",
      {
        "bg-primary-700": isSelected,
      },
      className
    )}
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
      {caption && <span className="body2 text-iconDefault">{caption}</span>}
    </div>
  </button>
);
