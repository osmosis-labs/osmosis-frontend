import { FunctionComponent, useId } from "react";

import { Checkbox } from "~/components/ui/checkbox";
import { useTranslation } from "~/hooks";

/**
 * The high-loss acknowledgement gate (MTN-199). Bind `checked` /
 * `onCheckedChange` to `useLossAcknowledgement`'s `hasAcknowledgedLoss` /
 * `setLossAcknowledged` so ticking freezes the acknowledged basis and drift
 * re-arms it — never to local component state.
 */
export const LossAcknowledgementCheckbox: FunctionComponent<{
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}> = ({ checked, onCheckedChange }) => {
  const { t } = useTranslation();
  const id = useId();

  return (
    <div className="flex gap-4">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange(checked === true)}
      />
      <label htmlFor={id} className="body2 cursor-pointer">
        {t("transfer.lossAcknowledgement")}
      </label>
    </div>
  );
};
