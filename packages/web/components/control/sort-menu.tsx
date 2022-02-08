import Image from "next/image";
import React, { FunctionComponent } from "react";
import classNames from "classnames";
import { MenuDropdown } from ".";
import { Disableable, CustomClasses } from "../types";
import { MenuSelectProps } from "./types";
import { useBooleanWithWindowEvent } from "../../hooks";

interface Props extends MenuSelectProps, Disableable, CustomClasses {
  onToggleSortDirection?: () => void;
}

export const SortMenu: FunctionComponent<Props> = ({
  options,
  selectedOptionId,
  onSelect,
  disabled,
  className,
  onToggleSortDirection,
}) => {
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
      >
        <div>
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
        </div>
        <div
          className="flex"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
              setDropdownOpen(!dropdownOpen);
            }
          }}
        >
          <span className="block m-auto mx-2 leading-loose text-secondary-200 min-w-[60px] max-w-[100px] select-none text-center text-ellipsis overflow-hidden">
            {selectedOption ? selectedOption.display : "SORT BY"}
          </span>
          <div>
            <Image
              alt="open"
              src="/icons/chevron-down-green.svg"
              height={15}
              width={15}
            />
          </div>
        </div>
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
