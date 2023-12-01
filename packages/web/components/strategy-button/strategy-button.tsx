import { ReactNode } from "react";

interface StrategyButtonProps {
  icon: ReactNode;
  label: string;
  resp: string;
}

export const StrategyButton = ({ icon, label }: StrategyButtonProps) => {
  return (
    <div className="flex min-w-strategy-buttons items-center gap-4 py-1 px-4">
      <button className="inline-flex max-h-11 items-center justify-center rounded-lg bg-osmoverse-800 px-2 py-3">
        {icon}
      </button>
      <span className="text-base font-subtitle1 text-osmoverse-200">
        {label}
      </span>
    </div>
  );
};
