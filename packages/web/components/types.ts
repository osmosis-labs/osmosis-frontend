export interface InputProps<T> {
  currentValue: T;
  onInput: (value: T) => void;
  placeholder?: T;
}

export interface Disableable {
  disabled?: boolean;
}

export interface CustomClasses {
  className?: string;
}

export type SortDirection = "ascending" | "descending";
