import Image from "next/image";
import { FunctionComponent, useState, useEffect } from "react";
import { CoinPretty } from "@keplr-wallet/unit";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useWindowSize } from "../../hooks";
import { Disableable, InputProps } from "../types";
import { Button } from "../buttons";
import { InputBox } from "../input";
import { CheckBox } from "../control";
import { Error } from "../alert";

// WIP, waiting for finalization on new transfer modal design

/** Standard display for prompting the bridging of arbitrary assets. */
export const Transfer: FunctionComponent<
  {
    isWithdraw: boolean;
    /** If there is a bridge it is assumed there is a nonKeplr wallet and the switch button will be shown. */
    transferPath: [
      { address: string; networkName: string; iconUrl?: string },
      { bridgeName: string; bridgeIconUrl?: string } | undefined,
      { address: string; networkName: string; iconUrl?: string }
    ];
    availableBalance?: CoinPretty;
    transferFee?: CoinPretty;
    withdrawAddressConfig?: {
      customAddress: string;
      isValid: boolean;
      setCustomAddress: (bech32Address: string) => void;
    };
    errorMessage?: string;
    toggleIsMax: () => void;
  } & InputProps<string> &
    Disableable
> = ({
  isWithdraw,
  transferPath: [from, _bridge, to],
  availableBalance,
  currentValue,
  onInput,
  withdrawAddressConfig,
  errorMessage,
  toggleIsMax,
  disabled,
}) => {
  const { isMobile } = useWindowSize();

  const [isEditingWithdrawAddr, setIsEditingWithdrawAddr] = useState(false);
  const [didVerifyWithdrawRisk, setDidVerifyWithdrawRisk] = useState(false);

  // Mobile only - brief copy to clipboard notification
  const [showCopied, setShowCopied] = useState(false);
  useEffect(() => {
    if (showCopied) {
      setTimeout(() => {
        setShowCopied(false);
      }, 5000);
    }
  }, [showCopied, setShowCopied]);

  return (
    <div className="text-white-high">
      <div className="relative md:mb-5 mb-10 flex items-center w-full">
        <h5 className="md:text-lg text-xl">
          {isWithdraw ? "Withdraw" : "Deposit"}
        </h5>
        {showCopied && (
          <span className="absolute inset-[45%] -top-0 w-fit h-fit rounded-full px-1.5 subtitle2 border-2 border-primary-200 bg-primary-200/60">
            Copied!
          </span>
        )}
      </div>
      <section className="flex flex-col items-center">
        <div className="w-full flex-1 md:p-3 p-4 border border-white-faint rounded-2xl">
          <p className="text-white-high">From</p>
          <div
            className="flex items-center gap-3"
            onClick={() => {
              if (isMobile) {
                navigator.clipboard
                  .writeText(from.address)
                  .then(() => setShowCopied(true));
              }
            }}
          >
            <p className="text-white-disabled truncate overflow-ellipsis">
              {Bech32Address.shortenAddress(from.address, isMobile ? 20 : 100)}
            </p>
            {isMobile && (
              <Image alt="copy" src="/icons/copy.svg" height={20} width={20} />
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
              {withdrawAddressConfig && isEditingWithdrawAddr && (
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
                    Warning: Withdrawing to central exchange address will result
                    in loss of funds.
                  </p>
                </div>
              )}
              {withdrawAddressConfig && isEditingWithdrawAddr ? (
                <InputBox
                  className="w-full"
                  style="no-border"
                  currentValue={withdrawAddressConfig.customAddress || ""}
                  disabled={disabled}
                  onInput={(value) => {
                    setDidVerifyWithdrawRisk(false);
                    withdrawAddressConfig.setCustomAddress(value);
                  }}
                  labelButtons={[
                    {
                      label: "Enter",
                      onClick: () => {
                        setIsEditingWithdrawAddr(false);
                      },
                      disabled:
                        !withdrawAddressConfig.isValid ||
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
                        .writeText(from.address)
                        .then(() => setShowCopied(true));
                    }
                  }}
                >
                  <p className="text-white-disabled truncate overflow-ellipsis">
                    {Bech32Address.shortenAddress(
                      to.address,
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
              {withdrawAddressConfig && isEditingWithdrawAddr && (
                <div className="flex items-center place-content-end">
                  <CheckBox
                    className="after:!bg-transparent after:!border-2 after:!border-white-full"
                    checkClassName="flex items-center"
                    isOn={didVerifyWithdrawRisk}
                    onToggle={() => {
                      setDidVerifyWithdrawRisk(!didVerifyWithdrawRisk);
                    }}
                  >
                    <span className="caption md:text-xs text-sm md:ml-1 ml-2">
                      I verify I am not sending to an exchange address.
                    </span>
                  </CheckBox>
                </div>
              )}
            </div>
            {withdrawAddressConfig && !isEditingWithdrawAddr && (
              <Button
                className="h-6 !w-fit text-caption"
                size="xs"
                color="primary"
                type="outline"
                disabled={disabled}
                onClick={() => {
                  setIsEditingWithdrawAddr(true);
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
        {availableBalance && (
          <p className="md:text-sm text-base mb-2">
            Available balance:{" "}
            <span className="text-primary-50">
              {availableBalance
                .upperCase(true)
                .trim(true)
                .maxDecimals(6)
                .toString()}
            </span>
          </p>
        )}
        <InputBox
          type="number"
          className="text-h6"
          inputClassName="text-right"
          style="no-border"
          currentValue={currentValue}
          disabled={disabled}
          onInput={onInput}
          labelButtons={[
            {
              label: "MAX",
              disabled: availableBalance?.toDec().isZero(),
              onClick: () => toggleIsMax(),
            },
          ]}
        />
      </div>
      <div className="flex items-center md:mt-1 mt-2">
        {errorMessage && <Error className="mx-auto" message={errorMessage} />}
      </div>
    </div>
  );
};
