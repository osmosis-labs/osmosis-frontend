import Image from "next/image";
import { FunctionComponent } from "react";
import { ButtonProps } from "./types";

export const SwitchWalletButton: FunctionComponent<
  ButtonProps & { selectedWalletIconUrl: string }
> = ({ onClick, selectedWalletIconUrl }) => (
  <button
    className="flex shrink-0 items-center gap-2 border border-primary-50 rounded-md px-2 py-1 hover:bg-primary-50/30"
    onClick={onClick}
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
