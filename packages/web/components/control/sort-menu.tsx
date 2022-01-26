import Image from "next/image";
import React, { FunctionComponent } from "react";
import classNames from "classnames";
import { MenuDropdown } from ".";
import { Disableable } from "../types";
import { MenuSelectProps } from "./types";
import { useBooleanWithWindowEvent } from "../../hooks";

export const SortMenu: FunctionComponent<MenuSelectProps & Disableable> = ({
  options,
  selectedOptionId,
  onSelect,
  disabled,
}) => {
  const [dropdownOpen, setDropdownOpen] = useBooleanWithWindowEvent(false);

  return (
    <React.Fragment>
      <div
        className={classNames("absolute flex w-32 cursor-pointer", {
          "opacity-50 cursor-default": disabled,
        })}
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
        <span className="m-auto leading-loose text-secondary-200 select-none">
          SORT BY
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
    </React.Fragment>
  );
};
