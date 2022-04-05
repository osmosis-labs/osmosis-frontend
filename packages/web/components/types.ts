import { ReactElement } from "react";

/** PROPS */
export interface InputProps<T> {
  currentValue: T;
  onInput: (value: T) => void;
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
