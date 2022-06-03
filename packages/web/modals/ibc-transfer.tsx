import Image from "next/image";
import { FunctionComponent, useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { ModalBase, ModalBaseProps } from ".";
import { useStore } from "../stores";
import {
  IbcTransfer,
  useIbcTransfer,
  useWindowSize,
  useConnectWalletModalRedirect,
} from "../hooks";
import { Button } from "../components/buttons";
import { InputBox } from "../components/input";
import { CheckBox } from "../components/control";
import { Error } from "../components/alert";

export const IbcTransferModal: FunctionComponent<ModalBaseProps & IbcTransfer> =
  observer((props) => {
    const { currency, counterpartyChainId, isWithdraw } = props;
    const { chainStore, queriesStore, ibcTransferHistoryStore } = useStore();
    const { chainId: osmosisChainId } = chainStore.osmosis;
    const { isMobile } = useWindowSize();

    const [
      account,
      counterpartyAccount,
      amountConfig,
      inTransit,
      transfer,
      customCounterpartyConfig,
    ] = useIbcTransfer(props);
    const [isEditingWithdrawAddr, setIsEditingWithdrawAddr] = useState(false);
    const [wasCustomWithdrawAddrEntered, setCustomWithdrawAddrEntered] =
      useState(false); // address is locked in for modal lifecycle if user presses enter
    const [didVerifyWithdrawRisk, setDidVerifyWithdrawRisk] = useState(false);
    const isCustomWithdrawValid =
      !customCounterpartyConfig ||
      customCounterpartyConfig?.bech32Address === "" || // if not changed, it's valid since it's from Keplr
      (customCounterpartyConfig.isValid && wasCustomWithdrawAddrEntered);

    const { showModalBase, accountActionButton } =
      useConnectWalletModalRedirect(
        {
          className: "md:w-full w-2/3 md:p-4 p-6 hover:opacity-75 rounded-2xl",
          disabled:
            !account.isReadyToSendTx ||
            !counterpartyAccount.isReadyToSendTx ||
            account.txTypeInProgress !== "" ||
            amountConfig.error != undefined ||
            inTransit ||
            !isCustomWithdrawValid,
          onClick: () =>
            transfer(
              (txFullfillEvent) => {
                ibcTransferHistoryStore.pushPendingHistory(txFullfillEvent);
                props.onRequestClose();
              },
              (txBroadcastEvent) => {
                ibcTransferHistoryStore.pushUncommitedHistory(txBroadcastEvent);
              }
            ),
          loading: inTransit,
          children: (
            <h6 className="md:text-base text-lg">
              {isWithdraw ? "Withdraw" : "Deposit"}
            </h6>
          ),
        },
        props.onRequestClose
      );

    // Mobile only - copy to clipboard
    const [showCopied, setShowCopied] = useState(false);
    useEffect(() => {
      if (showCopied) {
        setTimeout(() => {
          setShowCopied(false);
        }, 5000);
      }
    }, [showCopied, setShowCopied]);

    return (
      <ModalBase {...props} isOpen={props.isOpen && showModalBase}>
        <div className="text-white-high">
          <div className="relative md:mb-5 mb-10 flex items-center w-full">
            <h5 className="md:text-lg text-xl">
              {isWithdraw ? "Withdraw" : "Deposit"}
              {!isMobile && " IBC Asset"}
            </h5>
            {showCopied && (
              <span className="absolute inset-[45%] -top-0 w-fit h-fit rounded-full px-1.5 subtitle2 border-2 border-primary-200 bg-primary-200/60">
                Copied!
              </span>
            )}
          </div>
          <h6 className="md:mb-3 mb-4 md:text-base text-lg">IBC Transfer</h6>
          <section className="flex flex-col items-center">
            <div className="w-full flex-1 md:p-3 p-4 border border-white-faint rounded-2xl">
              <p className="text-white-high">From</p>
              <div
                className="flex items-center gap-3"
                onClick={() => {
                  if (isMobile) {
                    navigator.clipboard
                      .writeText(
                        isWithdraw
                          ? account.bech32Address
                          : counterpartyAccount.bech32Address
                      )
                      .then(() => setShowCopied(true));
                  }
                }}
              >
                <p className="text-white-disabled truncate overflow-ellipsis">
                  {Bech32Address.shortenAddress(
                    isWithdraw
                      ? account.bech32Address
                      : counterpartyAccount.bech32Address,
                    isMobile ? 20 : 100
                  )}
                </p>
                {isMobile && (
                  <Image
                    alt="copy"
                    src="/icons/copy.svg"
                    height={20}
                    width={20}
                  />
                )}
              </div>
            </div>
            <div className="flex justify-center items-center w-10 my-2">
              <Image
                alt="arrow"
                src={"/icons/arrow-down.svg"}
                height={20}
                width={20}
              />
            </div>
            <div className="w-full flex-1 md:p-3 p-4 border border-white-faint rounded-2xl">
              <p className="text-white-high">To</p>
              <div className="flex gap-2 place-content-between">
                <div className="w-full flex flex-col gap-5">
                  {isEditingWithdrawAddr && (
                    <div className="flex md:gap-1 gap-3 place-content-evenly border border-secondary-200 rounded-xl p-1 mt-2">
                      <div className="flex items-center w-[16px] shrink-0">
                        <Image
                          alt="warning"
                          src="/icons/warning.svg"
                          height={16}
                          width={16}
                        />
                      </div>
                      <p className="md:text-xs text-sm my-auto">
                        Warning: Withdrawing to central exchange address will
                        result in loss of funds.
                      </p>
                    </div>
                  )}
                  {isEditingWithdrawAddr && customCounterpartyConfig ? (
                    <InputBox
                      className="w-full"
                      style="no-border"
                      currentValue={customCounterpartyConfig.bech32Address}
                      onInput={customCounterpartyConfig.setBech32Address}
                      labelButtons={[
                        {
                          label: "Enter",
                          onClick: () => {
                            setIsEditingWithdrawAddr(false);
                            setCustomWithdrawAddrEntered(true);
                          },
                          disabled:
                            !customCounterpartyConfig.isValid ||
                            !didVerifyWithdrawRisk,
                        },
                      ]}
                    />
                  ) : (
                    <div
                      className="flex items-center gap-3"
                      onClick={() => {
                        if (isMobile) {
                          navigator.clipboard
                            .writeText(
                              isWithdraw
                                ? wasCustomWithdrawAddrEntered &&
                                  customCounterpartyConfig
                                  ? customCounterpartyConfig.bech32Address
                                  : counterpartyAccount.bech32Address
                                : account.bech32Address
                            )
                            .then(() => setShowCopied(true));
                        }
                      }}
                    >
                      <p className="text-white-disabled truncate overflow-ellipsis">
                        {Bech32Address.shortenAddress(
                          isWithdraw
                            ? wasCustomWithdrawAddrEntered &&
                              customCounterpartyConfig
                              ? customCounterpartyConfig.bech32Address
                              : counterpartyAccount.bech32Address
                            : account.bech32Address,
                          isMobile ? 20 : 100
                        )}
                      </p>
                      {isMobile && (
                        <Image
                          alt="copy"
                          src="/icons/copy.svg"
                          height={20}
                          width={20}
                        />
                      )}
                    </div>
                  )}
                  <div className="flex items-center place-content-end">
                    {isEditingWithdrawAddr && (
                      <CheckBox
                        className="pt-0.5 after:!bg-transparent after:!border-2 after:!border-white-full"
                        isOn={didVerifyWithdrawRisk}
                        onToggle={() => {
                          setDidVerifyWithdrawRisk(!didVerifyWithdrawRisk);
                        }}
                      >
                        <span className="caption md:text-xs text-sm md:ml-1 ml-2">
                          I verify I am not sending to an exchange address.
                        </span>
                      </CheckBox>
                    )}
                  </div>
                </div>
                {customCounterpartyConfig &&
                  !isEditingWithdrawAddr &&
                  !wasCustomWithdrawAddrEntered && (
                    <Button
                      className="h-6 !w-fit text-caption"
                      size="xs"
                      color="primary"
                      type="outline"
                      onClick={() => {
                        setIsEditingWithdrawAddr(true);
                        if (!wasCustomWithdrawAddrEntered) {
                          customCounterpartyConfig.setBech32Address(
                            counterpartyAccount.bech32Address
                          );
                        }
                      }}
                    >
                      Edit
                    </Button>
                  )}
              </div>
            </div>
          </section>
          <h6 className="md:text-base text-lg mt-7">
            Amount To {isWithdraw ? "Withdraw" : "Deposit"}
          </h6>
          <div className="md:mt-3 mt-4 w-full md:p-0 p-5 md:border-0 border border-secondary-50 border-opacity-60 rounded-2xl">
            <p className="md:text-sm text-base mb-2">
              Available balance:{" "}
              <span className="text-primary-50">
                {(isWithdraw
                  ? queriesStore
                      .get(osmosisChainId)
                      .queryBalances.getQueryBech32Address(
                        account.bech32Address
                      )
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
            <InputBox
              type="number"
              className="text-h6"
              inputClassName="text-right"
              style="no-border"
              currentValue={amountConfig.amount}
              onInput={(value) => amountConfig.setAmount(value)}
              labelButtons={[
                {
                  label: "MAX",
                  onClick: () => amountConfig.toggleIsMax(),
                },
              ]}
            />
          </div>
          <div className="flex items-center md:mt-1 mt-2">
            {amountConfig.error && (
              <Error className="mx-auto" message={amountConfig.error.message} />
            )}
          </div>
          <div className="w-full md:mt-6 mt-9 flex items-center justify-center">
            {accountActionButton}
          </div>
        </div>
      </ModalBase>
    );
  });
