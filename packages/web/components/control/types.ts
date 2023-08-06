import { ReactNode } from "react";

import { InputProps } from "~/components/types";

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
  onSelect: (optionId: string) => void;
}

export interface NumberSelectProps extends InputProps<number> {
  min: number;
  max: number;
}

export interface MenuDropdownIconItemProps {
  value: string;
  display: string;
  iconUrl?: string;
}
