import React, { FunctionComponent } from "react";
import classNames from "classnames";
import { MenuDropdownIconItemProps } from "../types";
import {
  MenuDropdownIconItem,
  onSelectIconDropdown,
} from "./menu-dropdown-icon-item";

interface Props {
  currentOption: MenuDropdownIconItemProps;
  isOpen: boolean;
  options: MenuDropdownIconItemProps[];
  onSelect: onSelectIconDropdown;
}
export const MenuDropdownIcon: FunctionComponent<Props> = ({
  onSelect,
  currentOption,
  options,
  isOpen,
}: Props) => {
  return (
    <div
      className={classNames(
        "absolute top-[110%] right-0 z-[1000] flex select-none flex-col rounded-xl border border-osmoverse-600 bg-osmoverse-900",
        {
          hidden: !isOpen,
        }
      )}
    >
      {options.map((option: MenuDropdownIconItemProps, index: number) => {
        return (
          <MenuDropdownIconItem
            key={index}
            option={option}
            index={index}
            currentOption={currentOption}
            optionLength={options.length}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
};
