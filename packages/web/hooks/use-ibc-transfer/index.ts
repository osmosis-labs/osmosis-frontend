import { useEffect } from "react";
import {
  AccountWithCosmos,
  getKeplrFromWindow,
  WalletStatus,
} from "@keplr-wallet/stores";
import { ObservableAmountConfig, basicIbcTransfer } from "@osmosis-labs/stores";
import { useStore } from "../../stores";
import { useAmountConfig } from "../use-amount-config";
import { useFakeFeeConfig } from "../use-fake-fee-config";
import { IbcTransfer } from ".";

export function useIbcTransfer({
  currency,
  counterpartyChainId,
  sourceChannelId,
  destChannelId,
  isWithdraw,
  ics20ContractAddress,
}: IbcTransfer): [
  AccountWithCosmos,
  AccountWithCosmos,
  ObservableAmountConfig,
  boolean,
  () => void
] {
  const { chainStore, accountStore, queriesStore } = useStore();
  const { chainId } = chainStore.osmosis;

  const account = accountStore.getAccount(chainId);
  const counterpartyAccount = accountStore.getAccount(counterpartyChainId);

  const amountConfig = useAmountConfig(
    chainStore,
    chainId,
    isWithdraw ? account.bech32Address : counterpartyAccount.bech32Address,
    isWithdraw ? currency : currency.originCurrency!,
    isWithdraw
      ? queriesStore.get(chainId).queryBalances
      : queriesStore.get(counterpartyChainId).queryBalances
  );
  const feeConfig = useFakeFeeConfig(
    chainStore,
    isWithdraw ? chainId : counterpartyChainId,
    isWithdraw
      ? account.msgOpts.ibcTransfer.gas
      : counterpartyAccount.msgOpts.ibcTransfer.gas
  );
  amountConfig.setFeeConfig(feeConfig);

  useEffect(() => {
    if (
      account.bech32Address &&
      counterpartyAccount.walletStatus === WalletStatus.NotInit
    ) {
      counterpartyAccount.init();
    }
  }, [account.bech32Address, counterpartyAccount]);

  useEffect(() => {
    if (
      account.walletStatus === WalletStatus.Loaded && // TODO: handle mobile web (it is always connected)
      currency.originCurrency
    ) {
      if ("contractAddress" in currency.originCurrency) {
        getKeplrFromWindow()
          .then((keplr) => {
            // If the keplr is from extension and the ibc token is from cw20,
            // suggest the token to the keplr.
            if (
              keplr &&
              keplr.mode === "extension" &&
              currency.originChainId &&
              currency.originCurrency &&
              "contractAddress" in currency.originCurrency
            ) {
              keplr
                .suggestToken(
                  currency.originChainId,
                  (currency.originCurrency as any).contractAddress
                )
                .catch((e) => {
                  console.error(e);
                });
            }
          })
          .catch((e: unknown) => {
            console.error(e);
          });
      }
    }
  }, [account.walletStatus, currency.originCurrency, currency.originChainId]);

  const transfer = async () => {
    if (isWithdraw) {
      await basicIbcTransfer(
        {
          account: account,
          chainId: chainId,
          channelId: sourceChannelId,
        },
        {
          account: counterpartyAccount,
          chainId: counterpartyChainId,
          channelId: destChannelId,
        },
        currency,
        amountConfig
      );
    } else {
      if (
        !currency.originCurrency ||
        !("contractAddress" in currency.originCurrency)
      ) {
        throw new Error(
          "IBC is requested to be used via cosmwam, but the provided currency does not have a contract address"
        );
      }

      await basicIbcTransfer(
        {
          account: counterpartyAccount,
          chainId: counterpartyChainId,
          channelId: destChannelId,
          contractTransfer: ics20ContractAddress
            ? {
                contractAddress: currency.originCurrency["contractAddress"],
                cosmwasmAccount: (counterpartyAccount as any)["cosmwasm"], // TODO: add cosmwasm to Account type
                ics20ContractAddress: ics20ContractAddress,
              }
            : undefined,
        },
        {
          account: account,
          chainId: chainId,
          channelId: sourceChannelId,
        },
        currency,
        amountConfig
      );
    }
  };

  return [
    account,
    counterpartyAccount,
    amountConfig,
    (isWithdraw && account.isSendingMsg === "ibcTransfer") ||
      (!isWithdraw && counterpartyAccount.isSendingMsg === "ibcTransfer"),
    transfer,
  ];
}

export * from "./types";
