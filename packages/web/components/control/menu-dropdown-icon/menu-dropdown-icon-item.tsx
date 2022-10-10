import { FunctionComponent } from "react";
import Image from "next/image";
import classNames from "classnames";
import React from "react";

interface Props {
  value: string;
  display: string;
  currentValue: string;
  image: string;
  index: number;
  optionLength: number;
  onSelect: ({ value }: { value: string }) => void;
}

export type MenuDropdownIconItem = {
  value: string;
  display: string;
  image: string;
};
export const MenuDropdownIconItem: FunctionComponent<Props> = ({
  value,
  display,
  image,
  onSelect,
  index,
  currentValue,
  optionLength,
}) => {
  return (
    <button
      className={classNames(
        "px-4 py-2 cursor-pointer hover:bg-osmoverse-700 flex items-center ",
        {
          "text-rust-200": value === currentValue,
          "rounded-b-xlinset": index === optionLength - 1,
          "rounded-t-xlinset": index === 0,
        }
      )}
      key={value.toString()}
      onClick={() => onSelect({ value })}
    >
      <div className="flex items-center justify-center min-w-[24px]">
        <Image src={image} width={24} height={24} alt={`${display}`} />
      </div>
      <p className="ml-3">{display.toString()}</p>
    </button>
  );
};
