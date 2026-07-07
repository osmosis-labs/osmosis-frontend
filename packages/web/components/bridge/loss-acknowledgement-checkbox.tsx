import { FunctionComponent } from "react";

import { Checkbox } from "~/components/ui/checkbox";
import { useTranslation } from "~/hooks";

/**
 * The high-loss acknowledgement gate (MTN-199). Bind `checked` /
 * `onCheckedChange` to `useBridgeQuotes`'s `hasAcknowledgedLoss` /
 * `setLossAcknowledged` so ticking freezes the acknowledged basis and drift
 * re-arms it — never to local component state.
 */
export const LossAcknowledgementCheckbox: FunctionComponent<{
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}> = ({ checked, onCheckedChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-4">
      <Checkbox
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange(checked === true)}
      />
      <h2 className="body2">{t("transfer.lossAcknowledgement")}</h2>
    </div>
  );
};
