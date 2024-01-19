import { MouseEventHandler, ReactElement, ReactNode } from "react";

import { AmplitudeEvent } from "~/config";

export type MainLayoutMenu = {
  label: string;
  link: string | MouseEventHandler;
  icon: string | ReactNode;
  iconSelected?: string;
  selectionTest?: RegExp;
  amplitudeEvent?: AmplitudeEvent;
  isNew?: Boolean;
  badge?: ReactNode;
  secondaryLogo?: ReactNode;
  subtext?: string;
  showMore?: boolean;
};

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

export interface LoadingProps {
  isLoading?: boolean;
}

export interface Disableable {
  disabled?: boolean;
}

export type SortDirection = "ascending" | "descending";

export interface Metric {
  label: string;
  value: string | ReactElement;
}

export interface MobileProps {
  isMobile?: boolean;
}

export type StakeOrUnstake = "Stake" | "Unstake";
export type StakeOrEdit = "stake" | "edit";
