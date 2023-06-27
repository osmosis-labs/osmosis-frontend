import { AmountConfig } from "@keplr-wallet/hooks";
import {
  AccountStore,
  basicIbcTransfer,
  IBCTransferHistory,
  OsmosisAccount,
  UncommitedHistory,
} from "@osmosis-labs/stores";
import { useCallback } from "react";
import { useMount } from "react-use";

import { useStore } from "../../stores";
import { useAmountConfig, useFakeFeeConfig } from "..";
import { useWalletSelect } from "../wallet-select";
import { CustomCounterpartyConfig, IbcTransfer } from ".";
import { useCustomBech32Address } from "./use-custom-bech32address";

/**
 * Convenience hook for handling IBC transfer state. Supports user setting custom & validated bech32 counterparty address when withdrawing.
 *
 * @param currency IBC counterparty currency.
 * @param counterpartyChainId ChainId of counterparty.
 * @param sourceChannelId IBC route source channel id.
 * @param destChannelId IBC route destination channel id.
 * @param isWithdraw Specifies whether transfer is a withdrawal.
 * @param ics20ContractAddress Smart contract address should counterparty currency be a CW20 token.
 * @returns [osmosis account, counterparty account, observable amount config, isLoading, IBC transfer callback, custom withdrawal address manager if withdrawing]
 */
export function useIbcTransfer({
  currency,
  counterpartyChainId,
  sourceChannelId,
  destChannelId,
  isWithdraw,
  ics20ContractAddress,
}: IbcTransfer): [
  ReturnType<AccountStore<[OsmosisAccount]>["getWallet"]> | undefined,
  ReturnType<AccountStore<[OsmosisAccount]>["getWallet"]> | undefined,
  AmountConfig,
  boolean,
  (
    /** Handle IBC transfer events containing `send_packet` event type. */
    onFulfill?: (
      event: Omit<IBCTransferHistory, "status" | "createdAt">
    ) => void,
    /** Handle when the IBC trasfer successfully broadcast to relayers. */
    onBroadcasted?: (event: Omit<UncommitedHistory, "createdAt">) => void,
    /** Initial tx failed. */
    onFailure?: (txHash: string, code: number) => void
  ) => void,
  CustomCounterpartyConfig | undefined
] {
  const { chainStore, queriesStore, accountStore } = useStore();
  const { chainId } = chainStore.osmosis;

  const { onOpenWalletSelect } = useWalletSelect();

  const account = accountStore.getWallet(chainId);
  const counterpartyAccountRepo =
    accountStore.getWalletRepo(counterpartyChainId);
  const counterpartyAccount = accountStore.getWallet(counterpartyChainId);

  const osmosisAddress = account?.address ?? "";
  const counterpartyAddress = counterpartyAccount?.address ?? "";

  const feeConfig = useFakeFeeConfig(
    chainStore,
    isWithdraw ? chainId : counterpartyChainId,
    isWithdraw
      ? account?.cosmos.msgOpts.ibcTransfer.gas ?? 0
      : counterpartyAccount?.cosmos.msgOpts.ibcTransfer.gas ?? 0
  );
  const amountConfig = useAmountConfig(
    chainStore,
    queriesStore,
    isWithdraw ? chainId : counterpartyChainId,
    isWithdraw ? osmosisAddress : counterpartyAddress,
    feeConfig,
    isWithdraw ? currency : currency.originCurrency!
  );
  const [customBech32Address, isCustomAddressValid, setCustomBech32Address] =
    useCustomBech32Address();
  const customCounterpartyConfig: CustomCounterpartyConfig | undefined =
    isWithdraw
      ? {
          bech32Address: customBech32Address,
          isValid: isCustomAddressValid,
          setBech32Address: (bech32Address: string) =>
            setCustomBech32Address(
              bech32Address,
              chainStore.getChain(counterpartyChainId).bech32Config
                .bech32PrefixAccAddr
            ),
        }
      : undefined;

  useMount(() => {
    /**
     * For WalletConnect display the wallet select modal to signal the user to open
     * his mobile wallet app. We don't have to do this for extension wallets because
     * feedback is given by the extension itself.
     **/
    if (account?.walletInfo.mode === "wallet-connect") {
      onOpenWalletSelect(counterpartyChainId);
    }

    counterpartyAccountRepo
      ?.connect(account?.walletName)
      .catch(() => onOpenWalletSelect(counterpartyChainId));
  });

  const transfer: (
    onFulfill?: (
      event: Omit<IBCTransferHistory, "status" | "createdAt">
    ) => void,
    onBroadcasted?: (event: Omit<UncommitedHistory, "createdAt">) => void,
    onFailure?: (txHash: string, code: number) => void
  ) => void = useCallback(
    async (onFulfill, onBroadcasted, onFailure) => {
      try {
        if (isWithdraw) {
          await basicIbcTransfer(
            {
              account: account,
              chainId,
              channelId: sourceChannelId,
            },
            {
              account:
                customBech32Address !== ""
                  ? customBech32Address
                  : counterpartyAccount,
              chainId: counterpartyChainId,
              channelId: destChannelId,
            },
            amountConfig,
            onBroadcasted,
            onFulfill,
            onFailure
          );
        } else {
          await basicIbcTransfer(
            {
              account: counterpartyAccount,
              chainId: counterpartyChainId,
              channelId: destChannelId,
              contractTransfer:
                ics20ContractAddress &&
                currency.originCurrency &&
                "contractAddress" in currency.originCurrency
                  ? {
                      contractAddress:
                        currency.originCurrency["contractAddress"],
                      cosmwasmAccount: counterpartyAccount,
                      ics20ContractAddress: ics20ContractAddress,
                    }
                  : undefined,
            },
            {
              account: account,
              chainId,
              channelId: sourceChannelId,
            },
            amountConfig,
            onBroadcasted,
            onFulfill,
            onFailure
          );
        }
      } catch (e) {
        console.error(e);
      }
    },
    [
      isWithdraw,
      account,
      amountConfig,
      chainId,
      counterpartyAccount,
      currency.originCurrency,
      counterpartyChainId,
      customBech32Address,
      destChannelId,
      ics20ContractAddress,
      sourceChannelId,
    ]
  );

  return [
    account,
    counterpartyAccount,
    amountConfig,
    (isWithdraw && account?.txTypeInProgress === "ibcTransfer") ||
      (!isWithdraw && counterpartyAccount?.txTypeInProgress === "ibcTransfer"),
    transfer,
    customCounterpartyConfig,
  ];
}

export * from "./types";
