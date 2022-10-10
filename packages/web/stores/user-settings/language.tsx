import { action, makeObservable, observable, computed } from "mobx";
import { FunctionComponent } from "react";
import { IUserSetting } from ".";
import React from "react";
import { LanguageSelect, MenuDropdownIconItem } from "../../components/control";

export type LanguageState = { language: string };

const SUPPORTED_LANGUAGES: MenuDropdownIconItem[] = [
  {
    value: "en",
    display: "settings.languages.en",
    image: "/images/flag-english.png",
  },
  {
    value: "fr",
    display: "settings.languages.fr",
    image: "/images/flag-french.png",
  },
];

export class LanguageUserSetting implements IUserSetting<LanguageState> {
  readonly id = "language";
  readonly controlComponent: FunctionComponent<LanguageState> = ({}) => {
    return (
      <div className="flex">
        <LanguageSelect options={SUPPORTED_LANGUAGES} />
      </div>
    );
  };

  @observable
  protected _state: LanguageState;

  constructor(defaultLanguage: string) {
    makeObservable(this);
    this._state = {
      language: defaultLanguage,
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
