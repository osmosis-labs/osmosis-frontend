import Image from "next/image";
import { FunctionComponent, useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { WalletStatus } from "@keplr-wallet/stores";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { ModalBase, ModalBaseProps } from ".";
import { useStore } from "../stores";
import { IbcTransfer, useIbcTransfer, useWindowSize } from "../hooks";
import { Button } from "../components/buttons";
import { InputBox } from "../components/input";
import { CheckBox } from "../components/control";

export const IbcTransferModal: FunctionComponent<ModalBaseProps & IbcTransfer> =
  observer((props) => {
    const { currency, counterpartyChainId, isWithdraw } = props;
    const { chainStore, queriesStore } = useStore();
    const { chainId } = chainStore.osmosis;
    const { isMobile } = useWindowSize();

    const [
      account,
      counterpartyAccount,
      amountConfig,
      inTransit,
      _transfer,
      customCounterpartyConfig,
    ] = useIbcTransfer(props);
    const [isEditingWithdrawAddr, setIsEditingWithdrawAddr] = useState(false);
    const [wasCustomWithdrawAddrEntered, setCustomWithdrawAddrEntered] =
      useState(false); // address is locked in for modal lifecycle if use presses enter
    const [didVerifyWithdrawRisk, setDidVerifyWithdrawRisk] = useState(false);
    const isCustomWithdrawValid =
      customCounterpartyConfig?.bech32Address === "" || // if not changed, it's valid since it's from Keplr
      (customCounterpartyConfig?.isValid && wasCustomWithdrawAddrEntered);

    // Mobile only - copy to clipboard
    const [showFromCopied, setShowFromCopied] = useState(false);
    const [showToCopied, setShowToCopied] = useState(false);
    useEffect(() => {
      if (showFromCopied) {
        setTimeout(() => {
          setShowFromCopied(false);
        }, 5000);
      }
      if (showToCopied) {
        setTimeout(() => {
          setShowToCopied(false);
        }, 5000);
      }
    }, [showFromCopied, showToCopied, setShowFromCopied, setShowToCopied]);

    return (
      <ModalBase {...props}>
        <div className="text-white-high">
          <div className="mb-5 md:mb-10 flex justify-between items-center w-full">
            <h5 className="text-lg md:text-xl">
              {isWithdraw ? "Withdraw" : "Deposit"}
              {!isMobile && " IBC Asset"}
            </h5>
          </div>
          <h6 className="mb-3 md:mb-4 text-base md:text-lg">IBC Transfer</h6>
          <section className="flex flex-col items-center">
            <div className="w-full flex-1 p-3 md:p-4 border border-white-faint rounded-2xl">
              <p className="text-white-high">
                From{" "}
                {showFromCopied && (
                  <span className="text-sm text-primary-50">Copied!</span>
                )}
              </p>
              <div className="flex items-center place-content-between">
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
                    onClick={() =>
                      navigator.clipboard
                        .writeText(
                          isWithdraw
                            ? account.bech32Address
                            : counterpartyAccount.bech32Address
                        )
                        .then(() => setShowFromCopied(true))
                    }
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
            <div className="w-full flex-1 p-3 md:p-4 border border-white-faint rounded-2xl">
              <p className="text-white-high">
                To{" "}
                {showToCopied && (
                  <span className="text-sm text-primary-50">Copied!</span>
                )}
              </p>
              <div className="flex gap-2 place-content-between">
                <div className="w-full flex flex-col gap-5">
                  {isEditingWithdrawAddr && (
                    <div className="flex gap-1 md:gap-3 place-content-evenly border border-secondary-200 rounded-xl p-1 mt-2">
                      <div className="flex items-center w-[16px] shrink-0">
                        <Image
                          alt="warning"
                          src="/icons/warning.svg"
                          height={16}
                          width={16}
                        />
                      </div>
                      <p className="text-xs md:text-sm my-auto">
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
                    <div className="flex items-center place-content-between">
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
                          onClick={() =>
                            navigator.clipboard
                              .writeText(
                                isWithdraw
                                  ? wasCustomWithdrawAddrEntered &&
                                    customCounterpartyConfig
                                    ? customCounterpartyConfig.bech32Address
                                    : counterpartyAccount.bech32Address
                                  : account.bech32Address
                              )
                              .then(() => setShowToCopied(true))
                          }
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
                        <span className="caption text-xs md:text-sm ml-1 md:ml-2">
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
                  onClick: () => amountConfig.setFraction(1),
                },
              ]}
            />
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
                  !account.isReadyToSendTx ||
                  !counterpartyAccount.isReadyToSendTx ||
                  amountConfig.error != undefined ||
                  inTransit ||
                  !isCustomWithdrawValid
                }
                loading={inTransit}
                onClick={() => {
                  // TODO: do transfer from fn from hoook
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
  });
