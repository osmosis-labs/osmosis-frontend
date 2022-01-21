export interface ToggleProps {
  isOn: boolean;
  onChange: (value: boolean) => void;
}

export interface Disableable {
  disabled?: boolean;
}

export interface CustomClasses {
  className?: string;
}

export interface NumberSelectProps {
  currentValue: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}
