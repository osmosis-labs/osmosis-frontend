import { Listbox } from "@headlessui/react";
import classNames from "classnames";
import React, { FunctionComponent, useEffect } from "react";

import { Icon } from "~/components/assets";
import { MenuDropdownIconItemProps } from "~/components/control/types";
import { useTranslation } from "~/hooks";
import { useUserSettingsStore } from "~/stores/user-settings-store";

type LanguageSelectProps = {
  options: { value: string; display: string }[];
  onOpenChange?: (isOpen: boolean) => void;
};

export const LanguageSelect: FunctionComponent<LanguageSelectProps> = (
  props
) => {
  const { options, onOpenChange } = props;
  const { t } = useTranslation();

  const currentLanguage = useUserSettingsStore((state) => state.language);
  const setLanguage = useUserSettingsStore((state) => state.setLanguage);

  const currentOption = options.find(
    (option) => option.value === currentLanguage
  );

  const onSelect = (option: MenuDropdownIconItemProps) => {
    setLanguage(option.value);
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

          <ListBoxContent {...props} open={open} onOpenChange={onOpenChange} />
        </>
      )}
    </Listbox>
  );
};

const ListBoxContent: FunctionComponent<
  LanguageSelectProps & {
    open: boolean;
    onOpenChange?: (isOpen: boolean) => void;
  }
> = ({ open, options, onOpenChange }) => {
  useEffect(() => {
    onOpenChange?.(open);
  }, [onOpenChange, open]);

  return (
    <Listbox.Options className="absolute inset-0 z-50 overflow-auto bg-osmoverse-800 outline-none">
      {options.map((option) => (
        <Listbox.Option
          key={option.value}
          value={option}
          className={({ active, selected }) =>
            classNames(
              "subtitle1 cursor-pointer justify-start px-6 py-4 hover:bg-osmoverse-900 focus:bg-osmoverse-900",
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
};
