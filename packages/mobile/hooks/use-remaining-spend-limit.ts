import { Dec, PricePretty } from "@osmosis-labs/unit";
import { useCallback, useMemo } from "react";

import { api } from "../utils/trpc";

/**
 * Hook to get the remaining spend limit for a specific wallet address.
 *
 * @param {Object} params - Parameters for the hook
 * @param {string} params.walletAddress - The wallet address to check the spend limit for
 * @param {string} params.authenticatorId - The authenticator ID associated with the wallet
 * @param {boolean} params.enabled - Whether the query should be enabled
 * @returns {Object} An object containing the remaining spend limit and related data
 */
export function useRemainingSpendLimit({
  walletAddress,
  authenticatorId,
  enabled = true,
}: {
  walletAddress: string;
  authenticatorId: string;
  enabled?: boolean;
}) {
  // Get the amount spent so far
  const { data: amountSpentData, isLoading: isLoadingAmountSpent } =
    api.local.oneClickTrading.getAmountSpent.useQuery(
      {
        authenticatorId,
        userOsmoAddress: walletAddress,
      },
      {
        enabled: enabled && !!walletAddress && !!authenticatorId,
      }
    );

  // Calculate the remaining spend limit
  const remainingSpendLimit = useMemo(() => {
    if (!amountSpentData?.totalLimit || !amountSpentData?.amountSpent) {
      return undefined;
    }

    return amountSpentData.totalLimit.sub(amountSpentData.amountSpent);
  }, [amountSpentData]);

  // Check if a transaction would exceed the spend limit
  const wouldExceedSpendLimit = useCallback(
    (wantToSpend: Dec | PricePretty) => {
      if (!enabled) return false;

      const spendAmount =
        wantToSpend instanceof PricePretty ? wantToSpend.toDec() : wantToSpend;

      if (spendAmount.isZero()) return false;

      const spendLimit = amountSpentData?.totalLimit?.toDec() ?? new Dec(0);
      const amountSpent = amountSpentData?.amountSpent?.toDec() ?? new Dec(0);
      const wouldSpend = amountSpent.add(spendAmount);

      return wouldSpend.gt(spendLimit);
    },
    [amountSpentData?.amountSpent, amountSpentData?.totalLimit, enabled]
  );

  // Calculate the percentage of the spend limit that has been used
  const spendLimitUsedPercentage = useMemo(() => {
    if (!amountSpentData?.totalLimit || !amountSpentData?.amountSpent) {
      return new Dec(0);
    }

    const totalLimit = amountSpentData.totalLimit.toDec();
    if (totalLimit.isZero()) return new Dec(0);

    const amountSpent = amountSpentData.amountSpent.toDec();
    return amountSpent.quo(totalLimit).mul(new Dec(100));
  }, [amountSpentData]);

  return {
    amountSpent: amountSpentData?.amountSpent,
    totalSpendLimit: amountSpentData?.totalLimit,
    remainingSpendLimit,
    spendLimitUsedPercentage,
    wouldExceedSpendLimit,
    isLoading: isLoadingAmountSpent,
  };
}
