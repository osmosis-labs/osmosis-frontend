import classNames from "classnames";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import { useBooleanWithWindowEvent, useWindowSize } from "~/hooks";

import { MenuOptionsModal } from "~/modals";
import { CustomClasses, Disableable } from "../types";
import { MenuDropdown } from ".";
import { MenuSelectProps } from "./types";

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
        "relative flex h-10 shrink-0 cursor-pointer items-center justify-center px-6 transition-colors",
        dropdownOpen
          ? "rounded-t-xl border-x border-t border-osmoverse-600"
          : "rounded-xl border border-osmoverse-500 hover:border-2 hover:border-osmoverse-200 hover:px-[23px]"
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
          className="flex shrink-0 items-center text-osmoverse-200"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
              if (onToggleSortDirection && selectedOption) {
                onToggleSortDirection();
              } else {
                setDropdownOpen(!dropdownOpen);
              }
            }
          }}
        >
          <Icon
            id="up-down-arrow"
            height={isMobile ? 12 : 16}
            width={isMobile ? 12 : 16}
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
          <span className="body2 m-auto ml-2 block select-none overflow-hidden text-center leading-loose text-osmoverse-200">
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
