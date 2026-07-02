import classNames from "classnames";
import { FunctionComponent } from "react";

import { Spinner } from "~/components/loaders";

export type AmountPresetFraction = 0.25 | 0.5 | 0.75 | 1;

const PRESETS: { fraction: AmountPresetFraction; label: string }[] = [
  { fraction: 0.25, label: "25%" },
  { fraction: 0.5, label: "50%" },
  { fraction: 0.75, label: "75%" },
  { fraction: 1, label: "Max" },
];

/**
 * Balance-fraction shortcuts rendered as a row of compact pill buttons,
 * matching the look of the standalone "Max" button they replaced (`rounded-5xl`
 * bordered pill, wosmongton text, filled when active). Sits on its own
 * right-aligned line directly beneath the available-balance line of the asset
 * fieldset (above the amount input and token selector).
 *
 * 25/50/75 are intentionally not gas-aware. Only "Max" subtracts the gas
 * reserve via `useAmountInput`'s `maxAmountWithGas`. A user choosing 75% of
 * the fee asset can therefore still hit gas-exhaustion at execution; this
 * matches the explicit semantic that "50%" means "50% of balance" and not
 * "50% of (balance - gas)".
 */
export const AmountPresetRow: FunctionComponent<{
  onSelect: (fraction: AmountPresetFraction) => void;
  /**
   * The currently-active fraction, used to highlight the matching pill. Kept
   * as `number | null` (not `AmountPresetFraction`) because it is fed directly
   * from `useAmountInput.fraction` / the limit-buy highlight state, both of
   * which store an arbitrary `number | null`. The `=== fraction` comparison
   * below is still exhaustive against the four preset literals.
   */
  activeFraction: number | null;
  /**
   * Disables every preset. Used by callers that render the row unconditionally
   * (e.g. place-limit-tool passes `balanceZero`). Callers that already gate the
   * whole row on wallet/balance upstream (e.g. swap-tool) pass `false`.
   */
  isDisabled: boolean;
  /**
   * Disables the Max preset only. The 25/50/75 presets are not gas-aware, so
   * gas-specific concerns (estimation in flight, insufficient balance to cover
   * the fee on a Max swap) must not grey them out.
   */
  isMaxDisabled?: boolean;
  isLoadingMax: boolean;
}> = ({
  onSelect,
  activeFraction,
  isDisabled,
  isMaxDisabled = false,
  isLoadingMax,
}) => {
  return (
    <div className="flex items-center gap-1">
      {PRESETS.map(({ fraction, label }) => {
        const isActive = activeFraction === fraction;
        const isMax = fraction === 1;
        const isMaxLoading = isMax && isLoadingMax;
        const buttonDisabled =
          isDisabled || (isMax && (isMaxDisabled || isLoadingMax));
        return (
          <button
            key={`amount-preset-${fraction}`}
            type="button"
            disabled={buttonDisabled}
            onClick={() => onSelect(fraction)}
            className={classNames(
              "caption flex h-6 items-center justify-center rounded-5xl border px-2 transition-colors disabled:pointer-events-none disabled:opacity-50",
              // Hold the Max pill at its resting "Max" width so swapping the
              // label for the spinner doesn't shrink the pill and reflow the
              // row.
              isMax && "min-w-[2.75rem]",
              isActive
                ? "border-wosmongton-100 bg-wosmongton-100 text-osmoverse-900"
                : "border-osmoverse-700 text-wosmongton-300 hover:bg-osmoverse-800"
            )}
          >
            {/* On the Max pill, the spinner replaces the label while gas
                estimation is in flight (the pill keeps its width via min-w, so
                the row doesn't move). */}
            {isMaxLoading ? (
              <Spinner
                className={classNames("!h-3 !w-3 shrink-0", {
                  "text-osmoverse-900": isActive,
                  "text-wosmongton-300": !isActive,
                })}
              />
            ) : (
              label
            )}
          </button>
        );
      })}
    </div>
  );
};
