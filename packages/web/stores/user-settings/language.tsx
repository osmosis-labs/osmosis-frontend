import { action, computed, makeObservable, observable } from "mobx";
import { FunctionComponent } from "react";
import React from "react";

import {
  LanguageSelect,
  MenuDropdownIconItemProps,
} from "~/components/control";
import { UserSetting } from "~/stores/user-settings";

export type LanguageState = { language: string; isControlOpen: boolean };

const SUPPORTED_LANGUAGES: MenuDropdownIconItemProps[] = [
  {
    value: "en",
    display: "English",
  },
  {
    value: "es",
    display: "Español",
  },
  {
    value: "fr",
    display: "Français",
  },
  {
    value: "ko",
    display: "한국어",
  },
  {
    value: "pl",
    display: "Polski",
  },
  {
    value: "pt-br",
    display: "Portuguese",
  },
  {
    value: "ro",
    display: "Romana",
  },
  {
    value: "tr",
    display: "Türkçe",
  },
  {
    value: "zh-cn",
    display: "简体中文",
  },
  {
    value: "zh-tw",
    display: "正體中文",
  },
  {
    value: "zh-hk",
    display: "香港語",
  },
  {
    value: "fa",
    display: "فارسی",
  },
];

export class LanguageUserSetting implements UserSetting<LanguageState> {
  readonly id = "language";
  readonly defaultLanguage: MenuDropdownIconItemProps;
  readonly controlComponent: FunctionComponent<LanguageState> = () => (
    <LanguageSelect options={SUPPORTED_LANGUAGES} />
  );

  @observable
  protected _state: LanguageState;

  constructor(indexDefaultLanguage: number) {
    this.defaultLanguage = SUPPORTED_LANGUAGES[indexDefaultLanguage];
    this._state = {
      language: this.defaultLanguage.value,
      isControlOpen: false,
    };
    makeObservable(this);
  }

  getLabel(t: Function): string {
    return t("settings.titleLanguage");
  }

  @computed
  get state() {
    return this._state;
  }

  @action
  setState(state: Partial<LanguageState>) {
    this._state = { ...this._state, ...state };
  }
}
