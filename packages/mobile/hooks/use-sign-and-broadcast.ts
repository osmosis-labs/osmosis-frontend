import { fromBase64 } from "@cosmjs/encoding";
import { type EncodeObject } from "@cosmjs/proto-signing";
import {
  broadcastTx,
  estimateGasFee,
  getAccountFromNode,
  getRegistry,
  getSmartAccountExtensionOptions,
  signWithAuthenticator,
  TxFee,
} from "@osmosis-labs/tx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";

import { useBiometricPrompt } from "~/hooks/biometrics";
import { useEnvironment } from "~/hooks/use-environment";
import { useWallets } from "~/hooks/use-wallets";
import { useSettingsStore } from "~/stores/settings";
import { getCachedAssetListAndChains } from "~/utils/asset-lists";
import { api } from "~/utils/trpc";

interface TxTypeState {
  txType: string | null;
  setTxType: (type: string | null) => void;
}

export const useTxTypeStore = create<TxTypeState>((set) => ({
  txType: null,
  setTxType: (type) => set({ txType: type }),
}));

export const useIsTransactionInProgress = () => {
  const { txType } = useTxTypeStore();
  return { isTransactionInProgress: txType !== null };
};

/** Once data is invalidated, React Query will automatically refetch data
 *  when the dependent component becomes visible. */
export function refetchUserQueries(apiUtils: ReturnType<typeof api.useUtils>) {
  apiUtils.local.assets.getUserAsset.invalidate();
  apiUtils.local.assets.getUserAssets.invalidate();
  apiUtils.local.assets.getUserMarketAsset.invalidate();
  apiUtils.local.assets.getUserAssetsTotal.invalidate();
  apiUtils.local.assets.getUserBridgeAsset.invalidate();
  apiUtils.local.assets.getUserBridgeAssets.invalidate();
  apiUtils.local.balances.getUserBalances.invalidate();
  apiUtils.local.assets.getImmersiveBridgeAssets.invalidate();
  apiUtils.local.portfolio.getPortfolioAssets.invalidate();
}

export const useSignAndBroadcast = () => {
  const setTxType = useTxTypeStore((state) => state.setTxType);
  const { currentWallet } = useWallets();
  const queryClient = useQueryClient();
  const { environment } = useEnvironment();
  const apiUtils = api.useUtils();

  const { authenticate: authenticateTransactions } = useBiometricPrompt();

  const biometricForTransactions = useSettingsStore(
    (state) => state.biometricForTransactions
  );

  return useMutation({
    onMutate: ({ type }) => {
      setTxType(type);
    },
    onSuccess: () => {
      refetchUserQueries(apiUtils);
    },
    onSettled: () => {
      setTxType(null);
    },
    mutationFn: async ({
      chainId,
      memo,
      fee,
      messages,
    }: {
      chainId: string;
      memo: string;
      fee?: TxFee;
      messages: EncodeObject[];
      type: string;
    }) => {
      if (biometricForTransactions) {
        const { success } = await authenticateTransactions();
        if (!success) {
          throw new Error("Authentication failed");
        }
      }

      if (!currentWallet?.address) {
        throw new Error("No wallet connected");
      }

      if (currentWallet.type === "view-only") {
        throw new Error("View only wallet cannot sign and broadcast");
      }

      const { chainList } = await getCachedAssetListAndChains({
        queryClient,
        environment,
      });

      let txFee: TxFee;
      if (fee) {
        txFee = fee;
      } else {
        txFee = await estimateGasFee({
          bech32Address: currentWallet.address,
          chainId,
          chainList,
          body: {
            messages: messages,
            nonCriticalExtensionOptions: await getSmartAccountExtensionOptions({
              authenticatorId: currentWallet.authenticatorId,
            }),
          },
        });
      }

      const { accountNumber, sequence } = await getAccountFromNode({
        address: currentWallet.address,
        chainId,
        chainList,
      });

      const txRaw = await signWithAuthenticator({
        authenticatorId: currentWallet.authenticatorId,
        fee: txFee,
        memo,
        messages,
        privateKey: currentWallet.privateKey,
        publicKey: fromBase64(currentWallet.accountOwnerPublicKey),
        registry: await getRegistry(),
        signerData: {
          accountNumber: Number(accountNumber.toString()),
          sequence: Number(sequence.toString()),
          chainId,
        },
      });

      const tx = await broadcastTx({
        chainId,
        chainList,
        tx: txRaw,
      });

      return { tx };
    },
  });
};
