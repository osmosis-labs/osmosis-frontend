import Image from "next/image";
import React, { FunctionComponent } from "react";
import classNames from "classnames";
import { MenuDropdown } from ".";
import { Disableable, CustomClasses } from "../types";
import { MenuSelectProps } from "./types";
import { useBooleanWithWindowEvent, useWindowSize } from "../../hooks";
import { MenuOptionsModal } from "../../modals";
import { useTranslation } from "react-multi-lang";

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
  const { isMobile } = useWindowSize();
  const t = useTranslation();

  const selectedOption = options.find(
    (option) => option.id === selectedOptionId
  );

  return (
    <div
      className={classNames(
        "relative shrink-0 cursor-pointer px-6 py-2 transition-colors",
        dropdownOpen
          ? "rounded-t-xl border-x border-t border-osmoverse-600"
          : "rounded-xl border border-osmoverse-500"
      )}
      onClick={() => {
        if (!disabled) {
          setDropdownOpen(!dropdownOpen);
        }
      }}
    >
      <div
        className={classNames(
          "flex w-fit",
          {
            "cursor-default opacity-50": disabled,
          },
          className
        )}
      >
        <button
          className="flex shrink-0 items-center"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
              if (onToggleSortDirection && selectedOption) {
                console.log("good");
                onToggleSortDirection();
              } else {
                console.log("bad");
                setDropdownOpen(!dropdownOpen);
              }
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
          <span className="body2 md:caption m-auto ml-2 block min-w-[3.75rem] select-none overflow-hidden text-center leading-loose text-osmoverse-200">
            {isMobile
              ? t("components.sort.SORTMobile")
              : t("components.sort.SORT")}
          </span>
        </button>
      </div>
      {isMobile ? (
        <MenuOptionsModal
          title={t("components.sort.mobileMenu")}
          selectedOptionId={selectedOptionId}
          options={options}
          isOpen={dropdownOpen}
          onRequestClose={() => setDropdownOpen(false)}
          onSelectMenuOption={onSelect}
        />
      ) : (
        <MenuDropdown
          className="top-full -left-px w-[calc(100%_+_2px)]"
          options={options}
          selectedOptionId={selectedOptionId}
          onSelect={onSelect}
          isOpen={dropdownOpen}
        />
      )}
    </div>
  );
};
