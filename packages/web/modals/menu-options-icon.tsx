import { FunctionComponent } from "react";
import { MenuDropdownIconItem as MenuDropdownIconItemType } from "../components/control";
import { ModalBase, ModalBaseProps } from "./base";
import { MenuDropdownIconItem } from "../components/control/menu-dropdown-icon";
import React from "react";

/** Intended for mobile use only - full screen alternative to menu options dropdown. */
export const MenuOptionsIconModal: FunctionComponent<
  ModalBaseProps & {
    currentValue: string;
    options: MenuDropdownIconItemType[];
    onSelect: ({ value }: { value: string }) => void;
  }
> = ({ currentValue, options, onSelect, ...props }) => (
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
  </ModalBase>
);
