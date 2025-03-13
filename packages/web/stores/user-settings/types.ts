import { FunctionComponent } from "react";

export interface UserSetting<TState = any> {
  readonly id: string;
  readonly state: TState;
  readonly getLabel: (t: Function) => string;
  readonly controlComponent: FunctionComponent<TState>;
  setState(value: TState): void;
}
