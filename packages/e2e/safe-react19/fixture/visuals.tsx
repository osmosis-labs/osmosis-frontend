import {
  ButtonHTMLAttributes,
  PropsWithChildren,
  ReactNode,
  SVGAttributes,
} from "react";

// Native visual-only substitutes avoid importing application/provider barrels.
// ModalBase, Drawer, Stepper, Visx, Spring, Tippy and Lottie stay real.
export const Icon = (_props: SVGAttributes<SVGElement>) => (
  <span aria-hidden="true">•</span>
);
export function IconButton({
  icon,
  mode: _mode,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  mode?: string;
}) {
  return (
    <button {...props}>
      {icon}
      {props.children}
    </button>
  );
}
export function ChartButton({
  label,
  selected,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  selected: boolean;
}) {
  return (
    <button aria-pressed={selected} {...props}>
      {label}
    </button>
  );
}
export const SkeletonLoader = ({
  children,
}: PropsWithChildren<{ isLoaded: boolean }>) => <div>{children}</div>;
