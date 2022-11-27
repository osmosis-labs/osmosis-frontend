export type Icons = "star";

export interface IconProps {
  color?: string;
  name?: Icons;
  onClick?: () => void;
  size?: number;
}
