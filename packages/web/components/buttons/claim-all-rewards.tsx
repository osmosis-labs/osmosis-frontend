import { FunctionComponent } from "react";

import { Button } from "~/components/buttons/button";
import { ToggleProps } from "~/components/control";

export const ClaimAllRewardsButton: FunctionComponent<ToggleProps> = ({
  onToggle,
}) => {
  // TODO: Use translations
  //const {t} = useTranslation();
  return (
    <div className="max-w-xs">
      <Button
        mode="secondary"
        className="mt-8 gap-3 whitespace-nowrap !px-6"
        onClick={() => onToggle(false)}
      >
        Claim All Rewards
      </Button>
    </div>
  );
};
