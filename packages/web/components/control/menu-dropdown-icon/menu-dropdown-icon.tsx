import { FunctionComponent } from "react";
import classNames from "classnames";
import React from "react";
import { MenuDropdownIconItem as MenuDropdownIconItemType } from "../types";
import { MenuDropdownIconItem } from "./menu-dropdown-icon-item";

interface Props {
  currentValue: string;
  open: boolean;
  options: MenuDropdownIconItemType[];
  onSelect: ({ value }: { value: string }) => void;
}
export const MenuDropdownIcon: FunctionComponent<Props> = ({
  onSelect,
  currentValue,
  options,
  open,
}: Props) => {
  return (
    <div
      className={classNames(
        "absolute flex flex-col bg-osmoverse-900 border border-osmoverse-600 select-none z-[1000] rounded-xl right-0",
        {
          hidden: !open,
        }
      )}
    >
      {options.map(
        (
          { value, display, image }: MenuDropdownIconItemType,
          index: number
        ) => {
          return (
            <MenuDropdownIconItem
              key={index}
              value={value}
              display={display}
              image={image}
              index={index}
              currentValue={currentValue}
              optionLength={options.length}
              onSelect={onSelect}
            />
          );
        }
      )}
    </div>
  );
};
