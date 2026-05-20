import { useCallback } from "react";

import { DCA_CONTRACT } from "~/config/dca";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export interface DcaVault {
  id: string;
  sendDenom: string;
  targetDenom: string;
  swapAmount: string;
  timeInterval: string;
  status: "Scheduled" | "Active" | "Inactive" | "Cancelled";
  balance: string;
  swappedAmount: string;
  receivedAmount: string;
}

export function useDcaVaults() {
  const { accountStore } = useStore();
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const userAddress = account?.address ?? "";

  const enabled = !!userAddress && !!DCA_CONTRACT;

  const {
    data,
    isLoading,
    refetch,
  } = api.local.dca.getVaultsByOwner.useQuery(
    { userOsmoAddress: userAddress, contractAddress: DCA_CONTRACT },
    {
      enabled,
      refetchInterval: 15_000,
    }
  );

  const cancelVault = useCallback(
    async (vaultId: string) => {
      if (!account || !DCA_CONTRACT) return;
      await account.cosmwasm.sendExecuteContractMsg(
        "executeWasm",
        DCA_CONTRACT,
        { cancel_vault: { vault_id: Number(vaultId) } },
        []
      );
      refetch();
    },
    [account, refetch]
  );

  return {
    vaults: (data?.vaults ?? []) as DcaVault[],
    isLoading: enabled && isLoading,
    refetch,
    cancelVault,
  };
}
