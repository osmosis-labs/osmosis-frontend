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
import { stringToUint8Array } from "@osmosis-labs/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";

import { useEnvironment } from "~/hooks/use-environment";
import { useWallets } from "~/hooks/use-wallets";
import { getCachedAssetListAndChains } from "~/utils/asset-lists";

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

export const useSignAndBroadcast = () => {
  const setTxType = useTxTypeStore((state) => state.setTxType);
  const { currentWallet } = useWallets();
  const queryClient = useQueryClient();
  const { environment } = useEnvironment();

  return useMutation({
    onMutate: ({ type }) => {
      setTxType(type);
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
        publicKey: stringToUint8Array(currentWallet.accountOwnerPublicKey),
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
