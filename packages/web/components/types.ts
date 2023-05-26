import { MouseEventHandler, ReactElement, ReactNode } from "react";

import { AmplitudeEvent } from "../config";

export type MainLayoutMenu = {
  label: string;
  link: string | MouseEventHandler;
  icon: string | ReactNode;
  iconSelected?: string;
  selectionTest?: RegExp;
  amplitudeEvent?: AmplitudeEvent;
  isNew?: Boolean;
};

/** PROPS */
export interface InputProps<T> {
  currentValue: T;
  onInput: (value: T) => void;
  autoFocus?: boolean;
  onFocus?: (e: any) => void;
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

/** Should match settings in tailwind.config.js
 *
 *  https://tailwindcss.com/docs/responsive-design
 */
export const enum Breakpoint {
  SM = 640,
  MD = 768,
  LG = 1024,
  XLG = 1152,
  XL = 1280,
  XLHALF = 1408,
  XXL = 1536,
}
