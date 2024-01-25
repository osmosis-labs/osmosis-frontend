import classNames from "classnames";
import { ReactNode } from "react";

interface StrategyButtonProps {
  icon: ReactNode;
  label: string;
  resp: string;
  isOn: boolean;
  onChange: (resp: string) => void;
}

export const StrategyButton = ({
  icon,
  label,
  onChange,
  resp,
  isOn,
}: StrategyButtonProps) => {
  return (
    <button
      onClick={() => onChange(resp)}
      className={classNames(
        "mx-1 flex min-w-strategy-buttons items-center gap-4 rounded-lg py-1 px-4",
        {
          "bg-osmoverse-800": isOn === true,
        }
      )}
    >
      <div className="inline-flex max-h-11 w-11 items-center justify-center rounded-lg bg-osmoverse-800 px-2 py-3">
        {icon}
      </div>
      <span className="text-base font-subtitle1 text-osmoverse-200">
        {label}
      </span>
    </button>
  );
};
