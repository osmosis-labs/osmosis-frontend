import { action, makeObservable, observable, computed } from "mobx";
import { FunctionComponent } from "react";
import { IUserSetting } from ".";
import React from "react";
import {
  LanguageSelect,
  MenuDropdownIconItemProps,
} from "../../components/control";

export type LanguageState = { language: string };

const SUPPORTED_LANGUAGES: MenuDropdownIconItemProps[] = [
  {
    value: "en",
    display: "settings.languages.en",
    iconUrl: "/images/flag-english.png",
  },
  {
    value: "fr",
    display: "settings.languages.fr",
    iconUrl: "/images/flag-french.png",
  },
  {
    value: "ko",
    display: "settings.languages.ko",
    iconUrl: "/images/flag-korean.png",
  },
];

export class LanguageUserSetting implements IUserSetting<LanguageState> {
  readonly id = "language";
  readonly defaultLanguage: MenuDropdownIconItemProps;
  readonly controlComponent: FunctionComponent<LanguageState> = ({}) => {
    return <LanguageSelect options={SUPPORTED_LANGUAGES} />;
  };

  @observable
  protected _state: LanguageState;

  constructor(indexDefaultLanguage: number) {
    makeObservable(this);
    this.defaultLanguage = SUPPORTED_LANGUAGES[indexDefaultLanguage];
    this._state = {
      language: this.defaultLanguage.value,
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
  setState(state: LanguageState) {
    this._state = state;
  }
}
