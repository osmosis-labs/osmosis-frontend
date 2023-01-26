import React, { Fragment, FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { MenuDropdownIconItemProps } from "./types";
import { LanguageState, LanguageUserSetting } from "../../stores/user-settings";
import { Listbox } from "@headlessui/react";
import { Icon } from "../assets";
import { Button } from "../buttons";
import classNames from "classnames";
import { useTranslation } from "react-multi-lang";

export type LanguageSelectProps = {
  options: { value: string; display: string }[];
};

export const LanguageSelect: FunctionComponent<LanguageSelectProps> = observer(
  (props) => {
    const { options } = props;

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
      <div className="flex flex-col gap-[46px] rounded-2xl border-2 border-osmoverse-700 bg-osmoverse-800 p-6">
        <Icon id="globe" className="text-osmoverse-200" />

        <Listbox value={currentOption} onChange={onSelect}>
          {({ open, value }) => (
            <ListBoxContent
              {...props}
              open={open}
              value={value}
              languageSetting={languageSetting}
            />
          )}
        </Listbox>
      </div>
    );
  }
);

const ListBoxContent: FunctionComponent<
  LanguageSelectProps & {
    open: boolean;
    value: LanguageSelectProps["options"][number];
    languageSetting: LanguageUserSetting;
  }
> = observer(({ open, options, value, languageSetting }) => {
  const t = useTranslation();

  useEffect(() => {
    languageSetting.setState({ isControlOpen: open });
  }, [open]);

  return (
    <>
      {" "}
      <Listbox.Button as={Fragment}>
        <Button
          mode="text"
          className="group flex justify-between text-white-full"
        >
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
            className="self-end group-hover:text-rust-200"
          />
        </Button>
      </Listbox.Button>
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
    </>
  );
});
