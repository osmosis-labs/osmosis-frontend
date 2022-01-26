import { InputProps } from "../types";

export interface ToggleProps<T = boolean> {
  isOn: boolean;
  onChange: (value: T) => void;
}

export interface MenuOption {
  id: string;
  display: string;
}

export interface MenuSelectProps {
  options: MenuOption[];
  selectedOptionId: string;
  onSelect: (optionId: string) => void;
}

export interface NumberSelectProps extends InputProps<number> {
  min: number;
  max: number;
}
