import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { prepareCollectAllPositionsRewardsMsgs } from "@osmosis-labs/tx";
import { Dec, PricePretty } from "@osmosis-labs/unit";
import { useCallback, useMemo } from "react";

import { useWallet } from "~/hooks/use-wallet";
import { useWalletSelect } from "~/hooks/use-wallet-select";
import { api } from "~/utils/trpc";

/**
 * Collects spread rewards and incentives from every CL position the user holds
 * in one tx. Pass `forPoolId` to limit it to one pool. The collect messages
 * only check that the sender owns each position, so one tx can span pools.
 */
export function useCollectAllRewards({ forPoolId }: { forPoolId?: string }) {
  const { address, signAndBroadcast, transactionContext } = useWallet();
  const { isLoading: isWalletLoading } = useWalletSelect();

  const { data: positions } =
    api.local.concentratedLiquidity.getUserPositions.useQuery(
      {
        userOsmoAddress: address ?? "",
        forPoolId,
      },
      {
        enabled: !isWalletLoading && Boolean(address),

        // expensive query
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );

  const claimableSpreadRewardPositions = useMemo(
    () =>
      positions?.filter(
        ({ position }) => position.claimable_spread_rewards.length > 0
      ) ?? [],
    [positions]
  );
  const claimableIncentivePositions = useMemo(
    () =>
      positions?.filter(
        ({ position }) => position.claimable_incentives.length > 0
      ) ?? [],
    [positions]
  );
  const hasClaimableRewards =
    claimableSpreadRewardPositions.length > 0 ||
    claimableIncentivePositions.length > 0;

  // Total fiat value of what gets collected; undefined (unknown) if any
  // collected position has a reward that can't be priced, never a partial sum.
  const totalValue = useMemo(() => {
    const collectedPositions = new Map(
      [...claimableSpreadRewardPositions, ...claimableIncentivePositions].map(
        (position) => [position.id, position]
      )
    );
    let total = new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0));
    for (const { claimableRewardsValue } of collectedPositions.values()) {
      if (!claimableRewardsValue) return undefined;
      total = total.add(claimableRewardsValue);
    }
    return total;
  }, [claimableSpreadRewardPositions, claimableIncentivePositions]);

  const collectAllRewards = useCallback(() => {
    prepareCollectAllPositionsRewardsMsgs(
      transactionContext,
      claimableSpreadRewardPositions.map(({ id }) => id),
      claimableIncentivePositions.map(({ id }) => id),
      undefined
    )
      .then((prepared) => signAndBroadcast(...prepared))
      .catch(console.error);
  }, [
    transactionContext,
    claimableSpreadRewardPositions,
    claimableIncentivePositions,
    signAndBroadcast,
  ]);

  return {
    hasPositions: Boolean(positions?.length),
    hasClaimableRewards,
    totalValue,
    collectAllRewards,
  };
}
