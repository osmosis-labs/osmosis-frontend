import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";

type IconPath = string;

interface Props {
  onClick: () => void;
  color?: "primary" | "secondary";
  size?: "sm";
  type?: "chevron-right" | "chevron-down" | IconPath;
  disabled?: boolean;
}

const colorToClassName = {
  primary: "bg-primary-200",
  secondary: "bg-secondary-200",
};
const sizeToClassName = {
  sm: "px-2 py-2",
};

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
      disabled ? "opacity-50" : null,
      sizeToClassName[size],
      type !== "chevron-right" && type !== "chevron-down"
        ? `rounded-full ${colorToClassName[color]}`
        : null
    )}
    disabled={disabled}
    onClick={onClick}
  >
    <Image alt="" src={`/icons/${type}.svg`} height={32} width={32} />
  </button>
);
