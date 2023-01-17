import { action, makeObservable, observable, computed } from "mobx";
import { FunctionComponent } from "react";
import { IUserSetting } from ".";
import React from "react";
import {
  LanguageSelect,
  MenuDropdownIconItemProps,
} from "../../components/control";

export type LanguageState = { language: string; isControlOpen: boolean };

export const SUPPORTED_LANGUAGES: MenuDropdownIconItemProps[] = [
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
];

export class LanguageUserSetting implements IUserSetting<LanguageState> {
  readonly id = "language";
  readonly defaultLanguage: MenuDropdownIconItemProps;
  readonly controlComponent: FunctionComponent<LanguageState> = () => (
    <LanguageSelect options={SUPPORTED_LANGUAGES} />
  );

  @observable
  protected _state: LanguageState;

  constructor(indexDefaultLanguage: number) {
    makeObservable(this);
    this.defaultLanguage = SUPPORTED_LANGUAGES[indexDefaultLanguage];
    this._state = {
      language: this.defaultLanguage.value,
      isControlOpen: false,
    };
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
