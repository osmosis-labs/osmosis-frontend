import { action, makeObservable, observable, computed } from "mobx";
import { FunctionComponent } from "react";
import { IUserSetting } from ".";
import React from "react";
import { LanguageOption, LanguageSelect } from "../../components/control";

export type LanguageState = { language: string };

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { value: "en", display: "English", image: "/images/flag-english.png" },
  { value: "fr", display: "Français", image: "/images/flag-french.png" },
];

export class LanguageUserSetting implements IUserSetting<LanguageState> {
  readonly id = "language";
  readonly displayLabel: string;
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
    this.displayLabel = `Language`;

    makeObservable(this);
    this._state = {
      language: defaultLanguage,
    };
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
