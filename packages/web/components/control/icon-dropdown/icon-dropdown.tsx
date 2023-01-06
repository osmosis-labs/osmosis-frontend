import React, { FunctionComponent } from "react";
import { useBooleanWithWindowEvent, useWindowSize } from "../../../hooks";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { MenuDropdownIconItemProps } from "../types";
import classNames from "classnames";
import { MenuOptionsIconModal } from "../../../modals";
import { useTranslation } from "react-multi-lang";
import { onSelectIconDropdown, MenuDropdownIcon } from ".";
import { Icon } from "../../assets";

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
            "flex items-center rounded-xl border bg-osmoverse-900 transition-colors hover:bg-osmoverse-700",
            dropdownOpen
              ? "border-osmoverse-200"
              : "border-osmoverse-600 hover:border-osmoverse-700"
          )}
          onClick={(e) => {
            e.stopPropagation();
            setDropdownOpen(!dropdownOpen);
          }}
        >
          <span className="body md:caption my-1 ml-1 flex select-none items-center overflow-hidden text-center leading-loose md:ml-1.5">
            {currentOption && currentOption.iconUrl && currentOption.display && (
              <div className="flex min-w-[24px] items-center justify-center">
                <Image
                  src={currentOption.iconUrl}
                  width={24}
                  height={24}
                  alt={`${currentOption.display}`}
                />
              </div>
            )}
            <p className="mx-3">{t(currentOption?.display ?? "")}</p>
            <div className="mr-3 flex min-w-[24px] items-center justify-center">
              {currentOption && currentOption.display && (
                <Icon
                  id="chevron-down"
                  className="text-osmoverse-400"
                  width={13}
                  height={20}
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
