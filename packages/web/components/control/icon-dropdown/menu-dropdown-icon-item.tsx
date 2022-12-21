import { FunctionComponent } from "react";
import Image from "next/image";
import classNames from "classnames";
import React from "react";
import { useTranslation } from "react-multi-lang";
import { MenuDropdownIconItemProps } from "../types";

interface Props {
  option: MenuDropdownIconItemProps;
  currentOption: MenuDropdownIconItemProps;
  index: number;
  optionLength: number;
  onSelect: onSelectIconDropdown;
}

export type onSelectIconDropdown = (option: MenuDropdownIconItemProps) => void;

export const MenuDropdownIconItem: FunctionComponent<Props> = ({
  option,
  onSelect,
  index,
  optionLength,
}: Props) => {
  const t = useTranslation();

  return (
    <button
      className={classNames(
        "flex cursor-pointer items-center px-4 py-2 transition-colors hover:bg-osmoverse-700 ",
        {
          "rounded-b-xlinset": index === optionLength - 1,
          "rounded-t-xlinset": index === 0,
        }
      )}
      key={option.value.toString()}
      onClick={() => onSelect(option)}
    >
      {option.iconUrl && (
        <div className="flex min-w-[24px] items-center justify-center">
          <Image
            src={option.iconUrl}
            width={24}
            height={24}
            alt={`${option.display}`}
          />
        </div>
      )}
      <p className="ml-3">{t(option.display.toString())}</p>
    </button>
  );
};
