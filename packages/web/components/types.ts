import { ReactElement } from "react";

/** PROPS */
export interface InputProps<T> {
  currentValue: T;
  onInput: (value: T) => void;
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

// https://tailwindcss.com/docs/responsive-design
export const enum Breakpoint {
  SM = 640,
  MD = 768,
  LG = 1024,
  XL = 1280,
  XXL = 1536,
}
