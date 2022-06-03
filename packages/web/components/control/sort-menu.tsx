import Image from "next/image";
import React, { FunctionComponent } from "react";
import classNames from "classnames";
import { MenuDropdown } from ".";
import { Disableable, CustomClasses } from "../types";
import { MenuSelectProps } from "./types";
import { useBooleanWithWindowEvent, useWindowSize } from "../../hooks";
import { MenuOptionsModal } from "../../modals";

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
  const { isMobile } = useWindowSize();

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
        <button
          className="flex items-center"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleSortDirection && selectedOption) {
              onToggleSortDirection();
            } else if (!disabled) {
              setDropdownOpen(!dropdownOpen);
            }
          }}
        >
          <Image
            alt="sort"
            src="/icons/up-down-arrow.svg"
            height={isMobile ? 12 : 18}
            width={isMobile ? 12 : 18}
          />
        </button>
        <button
          className="flex items-center"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
              setDropdownOpen(!dropdownOpen);
            }
          }}
        >
          <span className="block m-auto md:mx-1 mx-2 leading-loose text-secondary-200 min-w-[3.75rem] select-none text-center text-ellipsis overflow-hidden md:caption">
            {selectedOption
              ? selectedOption.display
              : isMobile
              ? "SORT"
              : "SORT BY"}
          </span>
          <Image
            alt="open"
            src="/icons/chevron-down-secondary.svg"
            height={isMobile ? 12 : 15}
            width={isMobile ? 12 : 15}
          />
        </button>
      </div>
      {isMobile ? (
        <MenuOptionsModal
          title="Sort By"
          selectedOptionId={selectedOptionId}
          options={options}
          isOpen={dropdownOpen}
          onRequestClose={() => setDropdownOpen(false)}
          onSelectMenuOption={onSelect}
        />
      ) : (
        <MenuDropdown
          options={options}
          selectedOptionId={selectedOptionId}
          onSelect={onSelect}
          isOpen={dropdownOpen}
          openDropdownHDirection={openDropdownHDirection}
          openDropdownVDirection={openDropdownVDirection}
        />
      )}
    </div>
  );
};
