export interface ToggleProps {
  isOn: boolean;
  onChange: (value: boolean) => void;
}

export interface Disableable {
  disabled?: boolean;
}
