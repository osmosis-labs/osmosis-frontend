## Improve slippage field affordance on review modal

### Goal

Make the slippage percentage text field on the review modal clearly look editable by adding:

- **A light, always-visible neutral outline**, and
- **A slightly stronger outline when focused/actively edited**,
while preserving current logic, analytics, and error styling.

### Key locations

- Review modal component: [`packages/web/modals/review-order.tsx`](packages/web/modals/review-order.tsx)
- Slippage row wrapper and input: the `RecapRow` with `left={t("swap.settings.slippage")}` and the `AutosizeInput` inside the `div` that conditionally adds `border-2 border-wosmongton-300` when `isEditingSlippage` is true.
- Swap entry point: [`packages/web/components/swap-tool/index.tsx`](packages/web/components/swap-tool/index.tsx)
- Passes `slippageConfig` into `ReviewOrder` (no behavioral change needed here, just for context).

### Implementation steps

- **Step 1 – Add neutral base outline**
- In `review-order.tsx`, update the wrapper `div` around `AutosizeInput` so it always has a subtle neutral border, e.g. `border border-osmoverse-700 bg-osmoverse-900 rounded-lg`, instead of only showing a border when `isEditingSlippage` is true.
- Keep padding and layout consistent so the row height and alignment in `RecapRow` remain unchanged.

- **Step 2 – Strengthen outline on focus/edit**
- Replace the current `isEditingSlippage` styles so that, instead of jumping from no border to `border-2`, we:
  - Change only the **border color** (and optionally background shade) on `isEditingSlippage` / focus, using a slightly brighter neutral (e.g. `border-osmoverse-500`) or the existing accent, but keeping the same border width.
  - Optionally add `focus-within:` utilities (e.g. `focus-within:border-osmoverse-500`) on the wrapper `div` so keyboard focus also triggers the stronger outline.
- Ensure existing high-slippage error color (`text-rust-400`) remains clearly visible and is not overridden by the new border classes.

- **Step 3 – Verify interactions and states**
- Manually verify the following states on the review modal:
  - Default (not focused, no manual value): light neutral border visible, placeholder still shows e.g. `defaultManualSlippage + "%"`.
  - Focused/typing: outline clearly stronger but not overwhelming; `%` suffix still appears only when `manualSlippage !== ""`.
  - High/low slippage warnings: confirm that error banners still render correctly and that the new border does not conflict with the warning visuals.
- Confirm that clicking the slippage field still correctly toggles manual mode and fires analytics (`Swap.slippageToleranceSet`).

If you'd like, we can later refactor the wrapper to reuse the shared text-input styles from the design system so all inline numeric inputs are visually consistent across the app.

