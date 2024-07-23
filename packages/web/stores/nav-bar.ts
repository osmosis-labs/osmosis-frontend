import { makeObservable, observable, runInAction } from "mobx";
import { ReactNode } from "react";
import { ButtonHTMLAttributes } from "react";

export type CallToAction = {
  label: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export class NavBarStore {
  @observable
  protected _title: ReactNode | undefined;

  @observable
  protected _callToActionButtons: CallToAction[] = [];

  constructor(protected readonly chainId: string) {
    makeObservable(this);
  }

  get title() {
    return this._title;
  }

  get callToActionButtons() {
    return this._callToActionButtons;
  }

  set title(val: ReactNode | undefined) {
    runInAction(() => (this._title = val));
  }

  /** Use `useEffect` hook to apply currrent page's CTAs. */
  set callToActionButtons(buttons: CallToAction[]) {
    runInAction(() => (this._callToActionButtons = buttons));
  }
}
