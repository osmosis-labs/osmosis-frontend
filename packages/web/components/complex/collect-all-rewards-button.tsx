import { FunctionComponent } from "react";

import { PrivateText } from "~/components/privacy";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { useCollectAllRewards } from "~/hooks/use-collect-all-rewards";
import { formatFiatPrice } from "~/utils/formatter";

/**
 * "Collect All Rewards" with the total value to collect. With `forPoolId` it
 * covers one pool and stays visible (disabled) when there is nothing to claim;
 * without it, it covers every pool and is hidden for a user with no positions.
 */
export const CollectAllRewardsButton: FunctionComponent<{
  forPoolId?: string;
  className?: string;
  size?: "default" | "md";
}> = ({ forPoolId, className, size }) => {
  const { t } = useTranslation();
  const { hasPositions, hasClaimableRewards, totalValue, collectAllRewards } =
    useCollectAllRewards({ forPoolId });

  if (!forPoolId && !hasPositions) return null;

  return (
    <Button
      className={className}
      size={size}
      onClick={collectAllRewards}
      disabled={!hasClaimableRewards}
    >
      {t("clPositions.collectAllRewards")}
      {hasClaimableRewards && totalValue ? (
        <>
          {" ("}
          <PrivateText text={formatFiatPrice(totalValue)} />
          {")"}
        </>
      ) : null}
    </Button>
  );
};
