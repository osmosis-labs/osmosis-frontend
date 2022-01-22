export interface InputProps<T> {
  currentValue: T;
  onChange: (value: T) => void;
}

export interface Disableable {
  disabled?: boolean;
}

export interface CustomClasses {
  className?: string;
}
