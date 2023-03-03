import classNames from "classnames";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { useBooleanWithWindowEvent, useWindowSize } from "../../hooks";
import { MenuOptionsModal } from "../../modals";
import { Icon } from "../assets";
import { CustomClasses, Disableable } from "../types";
import { MenuDropdown } from ".";
import { MenuSelectProps } from "./types";

interface Props extends MenuSelectProps, Disableable, CustomClasses {
  label: string;
  selectedOptionLabel?: string;
}

export const SelectMenu: FunctionComponent<Props> = ({
  label,
  selectedOptionLabel,
  options,
  selectedOptionId,
  onSelect,
  disabled,
  className,
}) => {
  const [dropdownOpen, setDropdownOpen] = useBooleanWithWindowEvent(false);
  const { isMobile } = useWindowSize();
  const t = useTranslation();

  return (
    <div
      className={classNames(
        "relative flex h-10 shrink-0 cursor-pointer items-center justify-center px-6 text-sm transition-colors",
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
          className="flex items-center"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
              setDropdownOpen(!dropdownOpen);
            }
          }}
        >
          <span className="body2 m-auto mr-2 block select-none overflow-hidden text-ellipsis whitespace-nowrap text-center capitalize leading-loose text-osmoverse-200 ">
            {selectedOptionLabel ? selectedOptionLabel : label}
          </span>
          <Icon
            className="flex shrink-0 items-center text-osmoverse-200"
            id={dropdownOpen ? "chevron-up" : "chevron-down"}
            height={isMobile ? 12 : 16}
            width={isMobile ? 12 : 16}
          />
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
