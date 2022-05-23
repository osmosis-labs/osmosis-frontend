import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { ButtonProps } from "./types";
import { Disableable } from "../types";

type IconName = string;

interface Props extends ButtonProps, Disableable {
  color?: "primary" | "secondary";
  size?: "sm";
  type?: "chevron-right" | "chevron-down-secondary" | IconName;
}

export const IconButton: FunctionComponent<Props> = ({
  onClick,
  color = "primary",
  size = "sm",
  type = "chevron-right",
  disabled = false,
}) => (
  <button
    className={classNames(
      "flex justify-center items-center rounded-lg text-base",
      {
        "opacity-50": disabled,
        "px-2 py-2": size === "sm",
        "rounded-full":
          type !== "chevron-right" && type !== "chevron-down-secondary",
      },
      type !== "chevron-right" && type !== "chevron-down-secondary"
        ? {
            "bg-primary-200": color === "primary",
            "bg-secondary-200": color === "secondary",
          }
        : null
    )}
    disabled={disabled}
    onClick={onClick}
  >
    <Image alt="" src={`/icons/${type}.svg`} height={20} width={20} />
  </button>
);
