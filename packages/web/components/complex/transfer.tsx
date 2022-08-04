import { FunctionComponent, useState, useEffect } from "react";
import classNames from "classnames";
import { CoinPretty } from "@keplr-wallet/unit";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useWindowSize } from "../../hooks";
import { Disableable, InputProps, LoadingProps } from "../types";
import { Button } from "../buttons";
import { SwitchWalletButton } from "../buttons/switch-wallet";
import { InputBox } from "../input";
import { WalletDisplay } from "../../integrations/wallets";
import { CheckBox } from "../control";

/** Standard display for prompting the bridging of arbitrary assets. */
export const Transfer: FunctionComponent<
  {
    isWithdraw: boolean;
    /** If there is a bridge it is assumed there is a nonKeplr wallet and the switch button will be shown. */
    transferPath: [
      { address: string; networkName: string; iconUrl?: string },
      (
        | ({ bridgeName: string; bridgeIconUrl?: string } & LoadingProps)
        | undefined
      ),
      { address: string; networkName: string; iconUrl?: string }
    ];
    selectedWalletDisplay?: WalletDisplay;
    onRequestSwitchWallet?: () => void;
    availableBalance?: CoinPretty;
    withdrawAddressConfig?: {
      customAddress: string;
      isValid: boolean;
      setCustomAddress: (bech32Address: string) => void;
    };
    toggleIsMax: () => void;
    transferFee?: CoinPretty;
    /** Required, can be hardcoded estimate. */
    waitTime: string;
  } & InputProps<string> &
    Disableable
> = ({
  isWithdraw,
  transferPath: [from, _bridge, to],
  selectedWalletDisplay,
  onRequestSwitchWallet,
  availableBalance,
  currentValue,
  onInput,
  withdrawAddressConfig,
  toggleIsMax,
  transferFee,
  waitTime,
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
    <div className="flex flex-col gap-11">
      {/* TODO: add animated bridge graphic */}
      <div className="flex gap-4 body1 text-iconDefault">
        <div
          className={classNames(
            "flex w-full text-center border border-white-faint rounded-2xl p-4 transition-width",
            {
              "w-1/4": isEditingWithdrawAddr,
              "text-iconDefault/30": isEditingWithdrawAddr,
            }
          )}
        >
          <div className="flex gap-2 mx-auto">
            {Bech32Address.shortenAddress(
              from.address,
              isEditingWithdrawAddr
                ? 12
                : !from.address.startsWith("osmo") && selectedWalletDisplay
                ? 18
                : 24
            )}
            {!from.address.startsWith("osmo") && selectedWalletDisplay && (
              <SwitchWalletButton
                selectedWalletIconUrl={selectedWalletDisplay.iconUrl}
                onClick={() => onRequestSwitchWallet?.()}
              />
            )}
          </div>
        </div>
        <div
          className={classNames(
            "w-full text-center border border-white-faint rounded-2xl transition-width",
            isEditingWithdrawAddr ? "p-[7px]" : "flex p-4",
            {
              "w-3/4": isEditingWithdrawAddr,
            }
          )}
        >
          <div className="flex gap-2 mx-auto">
            {!isEditingWithdrawAddr &&
              Bech32Address.shortenAddress(
                to.address,
                !to.address.startsWith("osmo") && selectedWalletDisplay
                  ? 18
                  : 24
              )}
            {!to.address.startsWith("osmo") && selectedWalletDisplay && (
              <SwitchWalletButton
                selectedWalletIconUrl={selectedWalletDisplay.iconUrl}
                onClick={() => onRequestSwitchWallet?.()}
              />
            )}
            {isWithdraw && withdrawAddressConfig && !isEditingWithdrawAddr && (
              <Button
                className="border border-primary-50 hover:border-primary-50/60 text-primary-50 hover:text-primary-50/60"
                type="outline"
                onClick={() => setIsEditingWithdrawAddr(true)}
              >
                Edit
              </Button>
            )}
            {isEditingWithdrawAddr && (
              <InputBox
                className="w-full"
                style="no-border"
                currentValue={withdrawAddressConfig!.customAddress}
                onInput={(value) => {
                  setDidVerifyWithdrawRisk(false);
                  withdrawAddressConfig!.setCustomAddress(value);
                }}
                labelButtons={[
                  {
                    label: "Enter",
                    className:
                      "bg-primary-50 hover:bg-primary-50/60 border-0 rounded-md",
                    onClick: () => setIsEditingWithdrawAddr(false),
                    disabled: !withdrawAddressConfig!.isValid,
                  },
                ]}
              />
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline place-content-between">
            <h6>Select Amount</h6>
            <div className="text-xs text-white-high caption">
              Available on {from.networkName}:{" "}
              <span
                className="text-primary-50 cursor-pointer"
                onClick={() => toggleIsMax()}
              >
                {availableBalance?.trim(true).toString() || ""}
              </span>
            </div>
          </div>
          <InputBox
            type="number"
            className="text-h6 p-3"
            inputClassName="text-right"
            currentValue={currentValue}
            onInput={onInput}
          />
        </div>
        {
          <div className="flex flex-col gap-2.5 p-2.5 my-2 caption text-wireframes-lightGrey border border-white-faint rounded-lg">
            {transferFee && (
              <div className="flex items-center place-content-between">
                <span>Transfer Fee</span>
                <span>{transferFee!.trim(true).toString()}</span>
              </div>
            )}
            <div className="flex items-center place-content-between">
              <span>Estimated Time</span>
              <span>{waitTime}</span>
            </div>
          </div>
        }
      </div>
    </div>
  );
};
