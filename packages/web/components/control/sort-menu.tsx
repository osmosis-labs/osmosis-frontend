import Image from "next/image";
import React, { FunctionComponent } from "react";
import classNames from "classnames";
import { MenuDropdown } from ".";
import { Disableable, CustomClasses } from "../types";
import { MenuSelectProps } from "./types";
import { useBooleanWithWindowEvent } from "../../hooks";

interface Props extends MenuSelectProps, Disableable, CustomClasses {
  onToggleSortDirection?: () => void;
  /** Default: `"left"` */
  openDropdownHDirection?: "left" | "right";
  /** Default: `"down"` */
  openDropdownVDirection?: "down" | "up";
}

export const SortMenu: FunctionComponent<Props> = ({
  options,
  selectedOptionId,
  onSelect,
  disabled,
  openDropdownHDirection,
  openDropdownVDirection,
  className,
  onToggleSortDirection,
}) => {
  const [dropdownOpen, setDropdownOpen] = useBooleanWithWindowEvent(false);

  const selectedOption = options.find(
    (option) => option.id === selectedOptionId
  );

  return (
    <div className="relative">
      <div
        className={classNames(
          "flex w-fit cursor-pointer",
          {
            "opacity-50 cursor-default": disabled,
          },
          className
        )}
      >
        <Image
          alt="sort"
          src="/icons/up-down-arrow.svg"
          height={18}
          width={18}
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleSortDirection && selectedOption) {
              onToggleSortDirection();
            } else if (!disabled) {
              setDropdownOpen(!dropdownOpen);
            }
          }}
        />
        <div
          className="flex"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
              setDropdownOpen(!dropdownOpen);
            }
          }}
        >
          <span className="block m-auto mx-2 leading-loose text-secondary-200 min-w-[3.75rem] select-none text-center text-ellipsis overflow-hidden">
            {selectedOption ? selectedOption.display : "SORT BY"}
          </span>
          <Image
            alt="open"
            src="/icons/chevron-down-secondary.svg"
            height={15}
            width={15}
          />
        </div>
      </div>
      <MenuDropdown
        options={options}
        selectedOptionId={selectedOptionId}
        onSelect={onSelect}
        isOpen={dropdownOpen}
        openDropdownHDirection={openDropdownHDirection}
        openDropdownVDirection={openDropdownVDirection}
      />
    </div>
  );
};
