import { InputProps } from "../types";

export interface ToggleProps {
  isOn: boolean;
  onChange: (value: boolean) => void;
}

export interface NumberSelectProps extends InputProps<number> {
  min: number;
  max: number;
}
