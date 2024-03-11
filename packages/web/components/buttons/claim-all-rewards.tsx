import { FunctionComponent, useState } from "react";

import { Button } from "~/components/buttons/button";
import { ToggleProps } from "~/components/control";
import { useTranslation } from "~/hooks";

export const ClaimAllRewardsButton: FunctionComponent<ToggleProps<any>> = ({
  onToggle,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div className="max-w-xs">
      <Button
        mode="secondary"
        className="mt-8 gap-3 whitespace-nowrap !px-6"
        onClick={async () => {
          if (!loading) {
            setLoading(true);
            onToggle(setLoading);
            setTimeout(() => {
              setLoading(false);
            }, 3000);
          }
        }}
        disabled={loading}
      >
        {loading ? "Loading..." : t("pool.claimAllRewards")}
      </Button>
    </div>
  );
};
