import { ReactElement } from "react";

/** PROPS */
export interface InputProps<T> {
  currentValue: T;
  onInput: (value: T) => void;
  defaultValue?: T;
  autoFocus?: boolean;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
  placeholder?: T;
}

export interface CustomClasses {
  className?: string;
}

export interface Disableable {
  disabled?: boolean;
}

export interface Metric {
  label: string;
  value: string | ReactElement;
}

export interface MobileProps {
  isMobile?: boolean;
}

export type StakeOrUnstake = "Stake" | "Unstake";
export type StakeOrEdit = "stake" | "edit";
