import { Listbox } from "@headlessui/react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { Fragment, FunctionComponent, useEffect } from "react";
import { useTranslation } from "react-multi-lang";

import { useStore } from "../../stores";
import { LanguageUserSetting } from "../../stores/user-settings";
import { Icon } from "../assets";
import { MenuDropdownIconItemProps } from "./types";

export type LanguageSelectProps = {
  options: { value: string; display: string }[];
};

export const LanguageSelect: FunctionComponent<LanguageSelectProps> = observer(
  (props) => {
    const { options } = props;

    const t = useTranslation();

    const { userSettings } = useStore();
    const languageSetting = userSettings.getUserSettingById(
      "language"
    ) as LanguageUserSetting;
    const currentLanguage = languageSetting?.state.language;
    const currentOption = options.find(
      (option) => option.value === currentLanguage
    );

    const onSelect = (option: MenuDropdownIconItemProps) => {
      languageSetting.setState({ language: option.value });
    };

    return (
      <Listbox value={currentOption} onChange={onSelect}>
        {({ open, value }) => (
          <>
            <Listbox.Button className="flex w-full cursor-pointer flex-col gap-[46px] rounded-2xl border-2 border-osmoverse-700 bg-osmoverse-800 p-6 hover:border-wosmongton-200 hover:bg-osmoverse-700">
              <Icon id="globe" className="text-osmoverse-200" />
              <div className="flex w-full justify-between text-white-full">
                <div className="flex flex-col gap-1">
                  <span className="subtitle1 text-left tracking-wide">
                    {value?.display}
                  </span>
                  <span className="caption tracking-wider text-osmoverse-200">
                    {t("settings.selectLanguage")}
                  </span>
                </div>

                <Icon
                  id="chevron-right"
                  width={8}
                  height={13.33}
                  className="self-end text-osmoverse-200"
                />
              </div>
            </Listbox.Button>

            <ListBoxContent
              {...props}
              open={open}
              languageSetting={languageSetting}
            />
          </>
        )}
      </Listbox>
    );
  }
);

const ListBoxContent: FunctionComponent<
  LanguageSelectProps & {
    open: boolean;
    languageSetting: LanguageUserSetting;
  }
> = observer(({ open, options, languageSetting }) => {
  useEffect(() => {
    languageSetting.setState({ isControlOpen: open });
  }, [open]);

  return (
    <Listbox.Options className="absolute inset-0 z-50 bg-osmoverse-800 outline-none">
      {options.map((option) => (
        <Listbox.Option
          key={option.value}
          value={option}
          className={({ active, selected }) =>
            classNames(
              "subtitle1 cursor-pointer justify-start py-4 px-6 hover:bg-osmoverse-900 focus:bg-osmoverse-900",
              {
                "bg-osmoverse-900": active,
                "border-2 border-osmoverse-200": selected,
              }
            )
          }
        >
          {option.display}
        </Listbox.Option>
      ))}
    </Listbox.Options>
  );
});
