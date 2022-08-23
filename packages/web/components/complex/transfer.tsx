import { FunctionComponent, useState, useEffect } from "react";
import classNames from "classnames";
import { CoinPretty } from "@keplr-wallet/unit";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { WalletDisplay } from "../../integrations/wallets";
import { BridgeAnimation } from "../animation/bridge";
import { SwitchWalletButton } from "../buttons/switch-wallet";
import { GradientView } from "../assets/gradient-view";
import { InputBox } from "../input";
import { Button } from "../buttons";
import { CheckBox } from "../control";
import { Disableable, InputProps, LoadingProps } from "../types";

export type TransferProps = {
  isWithdraw: boolean;
  /** If there is a bridge it is assumed there is a nonKeplr wallet and the switch button will be shown. */
  transferPath: [
    { address: string; networkName: string; iconUrl?: string },
    ({ bridgeName: string; bridgeIconUrl?: string } & LoadingProps) | undefined,
    { address: string; networkName: string; iconUrl?: string }
  ];
  selectedWalletDisplay?: WalletDisplay;
  onRequestSwitchWallet?: () => void;
  availableBalance?: CoinPretty;
  editWithdrawAddrConfig?: {
    customAddress: string;
    isValid: boolean;
    setCustomAddress: (bech32Address: string) => void;
  };
  toggleIsMax: () => void;
  transferFee?: CoinPretty;
  /** Required, can be hardcoded estimate. */
  waitTime: string;
} & InputProps<string> &
  Disableable;

/** Standard display for prompting the bridging of arbitrary assets. */
export const Transfer: FunctionComponent<TransferProps> = ({
  isWithdraw,
  transferPath: [from, bridge, to],
  selectedWalletDisplay,
  onRequestSwitchWallet,
  availableBalance,
  currentValue,
  onInput,
  editWithdrawAddrConfig,
  toggleIsMax,
  transferFee,
  waitTime,
}) => {
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
      <BridgeAnimation
        className={bridge ? "mt-4 -mb-2" : "mt-6 -mb-4"}
        transferPath={[from, bridge, to]}
      />
      <div
        className={classNames(
          "flex gap-4 body1 text-iconDefault transition-opacity duration-300",
          { "opacity-30": bridge?.isLoading }
        )}
      >
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
                editWithdrawAddrConfig &&
                  editWithdrawAddrConfig.customAddress !== ""
                  ? editWithdrawAddrConfig.customAddress
                  : to.address,
                (!to.address.startsWith("osmo") && selectedWalletDisplay) || // make room for btns
                  editWithdrawAddrConfig
                  ? 18
                  : 24
              )}
            {!to.address.startsWith("osmo") && selectedWalletDisplay && (
              <SwitchWalletButton
                selectedWalletIconUrl={selectedWalletDisplay.iconUrl}
                onClick={() => onRequestSwitchWallet?.()}
              />
            )}
            {isWithdraw && editWithdrawAddrConfig && !isEditingWithdrawAddr && (
              <Button
                className="border border-primary-50 hover:border-primary-50/60 text-primary-50 hover:text-primary-50/60"
                type="outline"
                onClick={() => {
                  setIsEditingWithdrawAddr(true);
                  editWithdrawAddrConfig.setCustomAddress(to.address);
                }}
              >
                Edit
              </Button>
            )}
            {isEditingWithdrawAddr && (
              <InputBox
                className="w-full"
                style="no-border"
                currentValue={editWithdrawAddrConfig!.customAddress}
                onInput={(value) => {
                  setDidVerifyWithdrawRisk(false);
                  editWithdrawAddrConfig!.setCustomAddress(value);
                }}
                labelButtons={[
                  {
                    label: "Enter",
                    className:
                      "bg-primary-50 hover:bg-primary-50 border-0 rounded-md",
                    onClick: () => setIsEditingWithdrawAddr(false),
                    disabled: !editWithdrawAddrConfig!.isValid,
                  },
                ]}
              />
            )}
          </div>
        </div>
      </div>
      <div
        className={classNames(
          "flex flex-col gap-4 transition-opacity duration-300",
          { "opacity-30": bridge?.isLoading }
        )}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline place-content-between">
            <h6>Select Amount</h6>
            {availableBalance && (
              <div className="text-xs text-white-high caption">
                Available on {from.networkName}:{" "}
                <button
                  className="text-primary-50 cursor-pointer disabled:cursor-default"
                  disabled={availableBalance.toDec().isZero()}
                  onClick={() => toggleIsMax()}
                >
                  {availableBalance.trim(true).toString()}
                </button>
              </div>
            )}
          </div>
          <InputBox
            type="number"
            className="text-h6 p-3"
            inputClassName="text-right"
            currentValue={currentValue}
            onInput={onInput}
          />
        </div>
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
        {editWithdrawAddrConfig && editWithdrawAddrConfig.customAddress !== "" && (
          <GradientView className="flex flex-col gap-2 body2 md:caption text-center bg-surface">
            <span>
              Withdrawing to a centralized exchange can result in lost funds.
            </span>
            <div className="mx-auto">
              <CheckBox
                isOn={didVerifyWithdrawRisk}
                className="after:!border-superfluid checked:after:bg-superfluid after:rounded-[10px] after:h-6 after:w-6 -top-0.5"
                checkClassName="-top-0.5 h-6 w-6 bg-superfluid rounded-[10px]"
                checkMarkClassName="top-[1px] left-[0.5px] h-6 w-6"
                checkMarkIconUrl="/icons/check-mark-surface.svg"
                onToggle={() =>
                  setDidVerifyWithdrawRisk(!didVerifyWithdrawRisk)
                }
              >
                I verify that {"I'm"} not sending to an exchange address{"."}
              </CheckBox>
            </div>
          </GradientView>
        )}
      </div>
    </div>
  );
};
