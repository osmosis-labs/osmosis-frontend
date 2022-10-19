import React, { FunctionComponent } from "react";
import { useBooleanWithWindowEvent, useWindowSize } from "../../../hooks";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { MenuDropdownIconItemProps } from "../types";
import classNames from "classnames";
import { MenuOptionsIconModal } from "../../../modals";
import { useTranslation } from "react-multi-lang";
import { onSelectIconDropdown, MenuDropdownIcon } from ".";

export type IconDropdownProps = {
  options: MenuDropdownIconItemProps[];
  currentOption: MenuDropdownIconItemProps;
  onSelect: onSelectIconDropdown;
  title: string;
};

export const IconDropdown: FunctionComponent<IconDropdownProps> = observer(
  ({ options, currentOption, onSelect, title }: IconDropdownProps) => {
    const { isMobile } = useWindowSize();
    const t = useTranslation();
    const [dropdownOpen, setDropdownOpen] = useBooleanWithWindowEvent(false);

    const handleSelect = (option: MenuDropdownIconItemProps) => {
      onSelect(option);
      setDropdownOpen(false);
    };

    return (
      <div className="relative">
        <button
          className={classNames(
            "flex items-center border rounded-xl bg-osmoverse-900",
            dropdownOpen ? "border-osmoverse-200" : "border-osmoverse-600"
          )}
          onClick={(e) => {
            e.stopPropagation();
            setDropdownOpen(!dropdownOpen);
          }}
        >
          <span className="flex items-center my-[0.6875rem] m-auto md:ml-1 ml-2 leading-loose select-none text-center body md:caption overflow-hidden">
            <div className="flex items-center justify-center min-w-[24px]">
              {currentOption &&
                currentOption.iconUrl &&
                currentOption.display && (
                  <Image
                    src={currentOption.iconUrl}
                    width={24}
                    height={24}
                    alt={`${currentOption.display}`}
                  />
                )}
            </div>
            <p className="mx-3">{t(currentOption?.display ?? "")}</p>
            <div className="flex items-center justify-center min-w-[24px] mr-3">
              {currentOption &&
                currentOption.iconUrl &&
                currentOption.display && (
                  <Image
                    src={"/icons/chevron-down.svg"}
                    width={13}
                    height={20}
                    alt={``}
                  />
                )}
            </div>
          </span>
        </button>
        {isMobile ? (
          <MenuOptionsIconModal
            currentOption={currentOption}
            onSelect={handleSelect}
            isOpen={dropdownOpen}
            onRequestClose={() => setDropdownOpen(false)}
            options={options}
            title={title}
          />
        ) : (
          <MenuDropdownIcon
            currentOption={currentOption}
            onSelect={handleSelect}
            isOpen={dropdownOpen}
            options={options}
          />
        )}
      </div>
    );
  }
);
