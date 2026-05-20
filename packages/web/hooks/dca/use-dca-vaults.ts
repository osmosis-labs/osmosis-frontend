import { DcaVault } from "@osmosis-labs/server";
import { useCallback } from "react";

import { DCA_CONTRACT } from "~/config/dca";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export type { DcaVault };

export function useDcaVaults() {
  const { accountStore } = useStore();
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const userAddress = account?.address ?? "";

  const enabled = !!userAddress;

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
      if (!account) return;
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
    vaults: data?.vaults ?? [],
    isLoading: enabled && isLoading,
    refetch,
    cancelVault,
  };
}
