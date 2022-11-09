import Image from "next/image";
import { FunctionComponent } from "react";
import { Disableable } from "../types";
import { ButtonProps } from "./types";

export const SwitchWalletButton: FunctionComponent<
  ButtonProps & Disableable & { selectedWalletIconUrl: string }
> = ({ onClick, disabled, selectedWalletIconUrl }) => (
  <button
    className="flex shrink-0 items-center gap-2 border border-wosmongton-100 rounded-md px-2 py-1 hover:bg-wosmongton-100/30"
    onClick={onClick}
    disabled={disabled}
  >
    <Image
      alt="wallet icon"
      src={selectedWalletIconUrl}
      height={14}
      width={14}
    />
    <Image
      alt="switch icon"
      src="/icons/left-right.svg"
      height={14}
      width={14}
    />
  </button>
);
