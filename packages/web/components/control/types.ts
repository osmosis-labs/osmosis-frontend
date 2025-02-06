import { ReactNode } from "react";

export interface ToggleProps<T = boolean> {
  isOn: boolean;
  onToggle: (value: T) => void;
}

export interface MenuOption {
  id: string;
  display: string | ReactNode;
}

export interface MenuSelectProps {
  options: MenuOption[];
  selectedOptionId?: string;
  defaultSelectedOptionId?: string;
  onSelect: (optionId: string) => void;
}

export interface MenuDropdownIconItemProps {
  value: string;
  display: string;
  iconUrl?: string;
}
