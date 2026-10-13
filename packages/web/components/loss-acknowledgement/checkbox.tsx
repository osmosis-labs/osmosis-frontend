import { FunctionComponent, useId } from "react";

import { Checkbox } from "~/components/ui/checkbox";

/**
 * The high-loss acknowledgement gate (MTN-199, extended to the trade surfaces by
 * MTN-150). Bind `checked` / `onCheckedChange` to `useLossAcknowledgement`'s
 * `hasAcknowledgedLoss` / `setLossAcknowledged` so ticking freezes the
 * acknowledged basis and drift re-arms it — never to local component state.
 *
 * The label is passed in rather than looked up here: each surface describes its
 * own risk, and a transfer that "could cause heavy loss of funds" is not the same
 * warning as a trade that may fill far from the price shown.
 */
export const LossAcknowledgementCheckbox: FunctionComponent<{
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}> = ({ label, checked, onCheckedChange }) => {
  const id = useId();

  return (
    <div className="flex gap-4">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange(checked === true)}
      />
      <label htmlFor={id} className="body2 cursor-pointer">
        {label}
      </label>
    </div>
  );
};
