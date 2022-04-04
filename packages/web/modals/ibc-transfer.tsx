import Image from "next/image";
import { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { WalletStatus } from "@keplr-wallet/stores";
import { ModalBase, ModalBaseProps } from ".";
import { useStore } from "../stores";
import { IbcTransfer, useIbcTransfer } from "../hooks/use-ibc-transfer";
import { Button } from "../components/buttons";
import { InputBox } from "../components/input";
import { CheckBox } from "../components/control";

export const IbcTransferModal: FunctionComponent<ModalBaseProps & IbcTransfer> =
  observer((props) => {
    const { currency, counterpartyChainId, isWithdraw } = props;
    const { chainStore, queriesStore } = useStore();
    const { chainId } = chainStore.osmosis;

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

    return (
      <ModalBase {...props}>
        <div className="text-white-high">
          <div className="mb-5 md:mb-10 flex justify-between items-center w-full">
            <h5 className="text-lg md:text-xl">
              {isWithdraw ? "Withdraw" : "Deposit"} IBC Asset
            </h5>
          </div>
          <h6 className="mb-3 md:mb-4 text-base md:text-lg">IBC Transfer</h6>
          <section className="flex flex-col items-center">
            <div className="w-full flex-1 p-3 md:p-4 border border-white-faint rounded-2xl">
              <p className="text-white-high">From</p>
              <p className="text-white-disabled truncate overflow-ellipsis">
                {isWithdraw
                  ? account.bech32Address
                  : counterpartyAccount.bech32Address}
              </p>
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
              <p className="text-white-high">To</p>
              <div className="flex gap-2 place-content-between">
                <div className="w-full flex flex-col gap-2">
                  {isEditingWithdrawAddr && (
                    <div className="flex gap-3 place-content-evenly border border-secondary-200 rounded-xl p-1 mt-2">
                      <Image
                        alt="warning"
                        src="/icons/warning.svg"
                        height={16}
                        width={16}
                      />
                      <p className="text-sm my-auto">
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
                    <p className="text-white-disabled truncate overflow-ellipsis">
                      {isWithdraw
                        ? wasCustomWithdrawAddrEntered &&
                          customCounterpartyConfig
                          ? customCounterpartyConfig.bech32Address
                          : counterpartyAccount.bech32Address
                        : account.bech32Address}
                    </p>
                  )}
                  <div className="flex place-content-end">
                    {isEditingWithdrawAddr && (
                      <CheckBox
                        className="mt-0.5 after:!bg-transparent after:!border-2 after:!border-white-full"
                        isOn={didVerifyWithdrawRisk}
                        onToggle={() => {
                          setDidVerifyWithdrawRisk(!didVerifyWithdrawRisk);
                        }}
                      >
                        <span className="caption ml-2">
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
                      className="h-6 text-caption"
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
              className="text-h6"
              inputClassName="text-right"
              style="no-border"
              currentValue={amountConfig.amount}
              onInput={(value) => {
                const floatVal = parseFloat(value);
                if (!isNaN(floatVal)) {
                  let newVal = floatVal.toString();
                  // parseFloat removes trailing "."
                  if (value[value.length - 1] === ".") {
                    newVal = newVal + ".";
                  }
                  amountConfig.setAmount(newVal);
                } else if (value === "") {
                  amountConfig.setAmount("");
                }
              }}
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
