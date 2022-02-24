import Image from "next/image";
import { FunctionComponent, useState } from "react";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { WalletStatus } from "@keplr-wallet/stores";
import { ModalBase, ModalBaseProps } from ".";
import { useStore } from "../stores";
import { IbcTransfer, useIbcTransfer } from "../hooks/use-ibc-transfer";
import { Button } from "../components/buttons";
import { InputBox } from "../components/input";

export const IbcTransferModal: FunctionComponent<
  ModalBaseProps & IbcTransfer
> = (props) => {
  const { currency, counterpartyChainId, isWithdraw } = props;
  const { chainStore, queriesStore, ibcTransferHistoryStore } = useStore();
  const { chainId } = chainStore.osmosis;

  const [account, counterpartyAccount, amountConfig, inTransit] =
    useIbcTransfer(props);

  return (
    <ModalBase {...props}>
      <div className="text-white-high">
        <div className="mb-5 md:mb-10 flex justify-between items-center w-full">
          <h5 className="text-lg md:text-xl">
            {isWithdraw ? "Withdraw" : "Deposit"} IBC Asset
          </h5>
        </div>
        <h6 className="mb-3 md:mb-4 text-base md:text-lg">IBC Transfer</h6>
        <section className="flex flex-col md:flex-row items-center">
          <div className="w-full flex-1 p-3 md:p-4 border border-white-faint rounded-2xl">
            <p className="text-white-high">From</p>
            <p className="text-white-disabled truncate overflow-ellipsis">
              {isWithdraw
                ? Bech32Address.shortenAddress(account.bech32Address, 25)
                : Bech32Address.shortenAddress(
                    counterpartyAccount.bech32Address,
                    25
                  )}
            </p>
          </div>
          <div className="flex justify-center items-center w-10 my-2 md:my-0">
            <Image
              alt="arrow"
              src={"/public/assets/Icons/Arrow-Down.svg"}
              height={20}
              width={20}
            />
          </div>
          <div className="w-full flex-1 p-3 md:p-4 border border-white-faint rounded-2xl">
            <p className="text-white-high">To</p>
            <p className="text-white-disabled truncate overflow-ellipsis">
              {isWithdraw
                ? Bech32Address.shortenAddress(
                    counterpartyAccount.bech32Address,
                    25
                  )
                : Bech32Address.shortenAddress(account.bech32Address, 25)}
            </p>
          </div>
        </section>
        <h6 className="text-base md:text-lg mt-7">
          Amount To {isWithdraw ? "Withdraw" : "Deposit"}
        </h6>
        <div className="mt-3 md:mt-4 w-full p-0 md:p-5 border-0 md:border border-secondary-50 border-opacity-60 rounded-2xl">
          <p className="text-sm md:text-base mb-2">
            Available balance:{" "}
            <span className="text-primary-50">
              {(isWithdraw
                ? queriesStore
                    .get(chainId)
                    .queryBalances.getQueryBech32Address(account.bech32Address)
                    .getBalanceFromCurrency(currency)
                : queriesStore
                    .get(counterpartyChainId)
                    .queryBalances.getQueryBech32Address(
                      counterpartyAccount.bech32Address
                    )
                    .getBalanceFromCurrency(currency.originCurrency!)
              )
                .upperCase(true)
                .trim(true)
                .maxDecimals(6)
                .toString()}
            </span>
          </p>
          <div className="py-2 px-2.5 bg-background rounded-lg flex gap-5 relative">
            <InputBox
              currentValue={amountConfig.amount}
              onInput={amountConfig.setAmount}
              labelButtons={[
                {
                  label: "MAX",
                  onClick: () => amountConfig.toggleIsMax(),
                },
              ]}
            />
          </div>
        </div>
        <div className="w-full mt-6 md:mt-9 flex items-center justify-center">
          {!(account.walletStatus === WalletStatus.Loaded) ? (
            <Button onClick={() => account.init()}>
              <span>Connect Wallet</span>
            </Button>
          ) : (
            <Button
              className="w-full md:w-2/3 p-4 md:p-6 bg-primary-200 rounded-2xl flex items-center justify-center hover:opacity-75 disabled:opacity-50"
              disabled={
                !account.isReadyToSendMsgs ||
                !counterpartyAccount.isReadyToSendMsgs ||
                amountConfig.getError() != null ||
                inTransit
              }
              loading={inTransit}
              onClick={() => {
                // do transfer from fn from hoook
              }}
            >
              <h6 className="text-base md:text-lg">
                {isWithdraw ? "Withdraw" : "Deposit"}
              </h6>
            </Button>
          )}
        </div>
      </div>
    </ModalBase>
  );
};
