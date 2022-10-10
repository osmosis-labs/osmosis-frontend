import React, { useCallback } from "react";
import { FunctionComponent } from "react";
import { useBooleanWithWindowEvent, useWindowSize } from "../../hooks";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import Image from "next/image";
import { MenuDropdownIcon } from "./menu-dropdown-icon/menu-dropdown-icon";
import { MenuDropdownIconItem } from "./types";

export type LanguageSelectProps = {
  options: MenuDropdownIconItem[];
};

export const LanguageSelect: FunctionComponent<LanguageSelectProps> = observer(
  ({ options }) => {
    const { isMobile } = useWindowSize();
    const { userSettings } = useStore();
    const [dropdownOpen, setDropdownOpen] = useBooleanWithWindowEvent(false);
    const currentLanguage =
      userSettings.getUserSettingById("language")?.state.language;
    const currentOption = options.find(
      (option) => option.value === currentLanguage
    );

    const onSelect = useCallback(
      ({ value }: { value: string }) => {
        setDropdownOpen(false);

        userSettings
          .getUserSettingById("language")
          ?.setState({ language: value });
      },
      [setDropdownOpen]
    );

    return (
      <div className="relative">
        <button
          className="flex items-center border border-osmoverse-200 rounded-xl bg-osmoverse-900"
          onClick={(e) => {
            e.stopPropagation();
            setDropdownOpen(!dropdownOpen);
          }}
        >
          <span className="flex items-center my-[0.6875rem] m-auto md:ml-1 ml-2 leading-loose select-none text-center body md:caption overflow-hidden">
            <div className="flex items-center justify-center min-w-[24px]">
              {currentOption &&
                currentOption.image &&
                currentOption.display && (
                  <Image
                    src={currentOption.image}
                    width={24}
                    height={24}
                    alt={`language ${currentOption.display}`}
                  />
                )}
            </div>
            <p className="mx-3">{currentOption?.display}</p>
            <div className="flex items-center justify-center min-w-[24px] mr-3">
              {currentOption &&
                currentOption.image &&
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
          <div></div>
        ) : (
          <MenuDropdownIcon
            currentValue={currentLanguage}
            onSelect={onSelect}
            open={dropdownOpen}
            options={options}
          />
        )}
      </div>
    );
  }
);
