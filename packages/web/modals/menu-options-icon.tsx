import React, { FunctionComponent } from "react";
import { MenuDropdownIconItemProps } from "../components/control";
import { ModalBase, ModalBaseProps } from "./base";
import {
  MenuDropdownIconItem,
  onSelectIconDropdown,
} from "../components/control/icon-dropdown";

/** Intended for mobile use only - full screen alternative to menu options dropdown. */
export const MenuOptionsIconModal: FunctionComponent<
  ModalBaseProps & {
    currentOption: MenuDropdownIconItemProps;
    options: MenuDropdownIconItemProps[];
    onSelect: onSelectIconDropdown;
  }
> = ({ currentOption, options, onSelect, ...props }) => (
  <ModalBase
    className="border border-white-faint !p-0 !rounded-xl"
    {...props}
    hideCloseButton
    title=""
    overlayClassName="-bottom-1/2"
  >
    <span className="w-full subtitle1 text-center p-2 text-white-high">
      {props.title}
    </span>
    <hr className="mx-3 shadow-separator h-px text-white-faint" />
    <div className="flex flex-col">
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
  </ModalBase>
);
