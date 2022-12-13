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
    className="!rounded-xl border border-white-faint !p-0"
    {...props}
    hideCloseButton
    title=""
    overlayClassName="-bottom-1/2"
  >
    <span className="subtitle1 w-full p-2 text-center text-white-high">
      {props.title}
    </span>
    <hr className="mx-3 h-px text-white-faint shadow-separator" />
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
