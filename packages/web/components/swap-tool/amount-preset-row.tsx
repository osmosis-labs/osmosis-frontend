import classNames from "classnames";
import { FunctionComponent } from "react";

export type AmountPresetFraction = 0.25 | 0.5 | 0.75 | 1;

const PRESETS: { fraction: AmountPresetFraction; label: string }[] = [
  { fraction: 0.25, label: "25%" },
  { fraction: 0.5, label: "50%" },
  { fraction: 0.75, label: "75%" },
  { fraction: 1, label: "Max" },
];

export const AmountPresetRow: FunctionComponent<{
  onSelect: (fraction: AmountPresetFraction) => void;
  activeFraction: number | null;
  isDisabled: boolean;
  isLoadingMax: boolean;
}> = ({ onSelect, activeFraction, isDisabled, isLoadingMax }) => {
  // 25/50/75 are intentionally not gas-aware. Only the Max pill subtracts the
  // gas reserve via `useAmountInput`'s `maxAmountWithGas`. A user choosing 75%
  // of the fee asset can therefore still hit gas-exhaustion at execution; this
  // matches the explicit semantic that "50%" means "50% of balance" and not
  // "50% of (balance - gas)".
  return (
    <div className="flex w-full items-center gap-1">
      {PRESETS.map(({ fraction, label }) => {
        const isActive = activeFraction === fraction;
        return (
          <button
            key={`amount-preset-${fraction}`}
            type="button"
            disabled={isDisabled || (fraction === 1 && isLoadingMax)}
            onClick={() => onSelect(fraction)}
            className={classNames(
              "sm:body2 flex-1 rounded-3xl border border-osmoverse-700 py-1.5 text-center transition-colors",
              {
                "bg-wosmongton-100": isActive,
                "hover:bg-osmoverse-850": !isActive && !isDisabled,
                "cursor-not-allowed opacity-50": isDisabled,
              }
            )}
          >
            <span
              className={classNames("body2 font-semibold sm:caption", {
                "text-osmoverse-900": isActive,
                "text-wosmongton-100": !isActive,
              })}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
