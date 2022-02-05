import Image from "next/image";
import React, { FunctionComponent } from "react";
import classNames from "classnames";
import { MenuDropdown } from ".";
import { Disableable, CustomClasses } from "../types";
import { MenuSelectProps } from "./types";
import { useBooleanWithWindowEvent } from "../../hooks";

export const SortMenu: FunctionComponent<
  MenuSelectProps & Disableable & CustomClasses
> = ({ options, selectedOptionId, onSelect, disabled, className }) => {
  const [dropdownOpen, setDropdownOpen] = useBooleanWithWindowEvent(false);

  const selectedOption = options.find(
    (option) => option.id === selectedOptionId
  );

  return (
    <div>
      <div
        className={classNames(
          "relative flex w-fit cursor-pointer",
          {
            "opacity-50 cursor-default": disabled,
          },
          className
        )}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) {
            setDropdownOpen(!dropdownOpen);
          }
        }}
      >
        <Image
          alt="sort"
          src="/icons/up-down-arrow.svg"
          height={18}
          width={18}
        />
        <span className="m-auto mx-2 leading-loose text-secondary-200 select-none min-w-[60px] max-w-[100px] text-center text-ellipsis overflow-hidden">
          {selectedOption ? selectedOption.display : "SORT BY"}
        </span>
        <Image
          alt="open"
          src="/icons/chevron-down-green.svg"
          height={15}
          width={15}
        />
      </div>
      <MenuDropdown
        options={options}
        selectedOptionId={selectedOptionId}
        onSelect={onSelect}
        isOpen={dropdownOpen}
      />
    </div>
  );
};
