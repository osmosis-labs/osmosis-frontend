import { FunctionComponent, useState, useEffect } from "react";
import classNames from "classnames";
import { CoinPretty } from "@keplr-wallet/unit";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { WalletDisplay } from "../../integrations/wallets";
import { truncateEthAddress } from "../../integrations/ethereum/metamask-utils";
import { useMatomoAnalytics, useWindowSize } from "../../hooks";
import { AssetsPageEvents } from "../../config";
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
  isOsmosisAccountLoaded: boolean;
  onRequestSwitchWallet?: () => void;
  availableBalance?: CoinPretty;
  editWithdrawAddrConfig?: {
    customAddress: string;
    isValid: boolean;
    setCustomAddress: (bech32Address: string) => void;
    didAckWithdrawRisk: boolean;
    setDidAckWithdrawRisk: (did: boolean) => void;
  };
  warningMessage?: string;
  toggleIsMax: () => void;
  transferFee?: CoinPretty;
  /** Required, can be hardcoded estimate. */
  waitTime: string;
  disablePanel?: boolean;
} & InputProps<string> &
  Disableable;

/** Presentation component for prompting the bridging of arbitrary assets, with an extension for editing withdraw address. */
export const Transfer: FunctionComponent<TransferProps> = ({
  isWithdraw,
  transferPath: [from, bridge, to],
  selectedWalletDisplay,
  isOsmosisAccountLoaded,
  onRequestSwitchWallet,
  availableBalance,
  currentValue,
  onInput,
  editWithdrawAddrConfig,
  warningMessage,
  toggleIsMax,
  transferFee,
  waitTime,
  disablePanel = false,
}) => {
  const { isMobile } = useWindowSize();
  const { trackEvent } = useMatomoAnalytics();

  const [isEditingWithdrawAddr, setIsEditingWithdrawAddr] = useState(false);

  // Mobile only - brief copy to clipboard notification
  const [showCopied, setShowCopied] = useState(false);
  useEffect(() => {
    if (showCopied) {
      setTimeout(() => {
        setShowCopied(false);
      }, 5000);
    }
  }, [showCopied, setShowCopied]);

  const panelDisabled = disablePanel || bridge?.isLoading || false;

  const maxFromChars = isEditingWithdrawAddr
    ? 12 // can't be on mobile
    : !from.address.startsWith("osmo") && selectedWalletDisplay
    ? isMobile
      ? 10
      : 18 // more space for switch wallet button
    : isMobile
    ? 14
    : 24;
  const maxToChars =
    (!to.address.startsWith("osmo") && selectedWalletDisplay) || // make room for btns
    editWithdrawAddrConfig
      ? isMobile
        ? 10
        : 18
      : isMobile
      ? 14
      : 24;

  return (
    <div className="flex flex-col gap-11 overflow-x-auto">
      <BridgeAnimation
        className={`mx-auto ${bridge ? "mt-4 -mb-2 md:-mb-6" : "mt-6 -mb-4"}`}
        transferPath={[from, bridge, to]}
      />
      <div
        className={classNames(
          "flex gap-4 body1 text-iconDefault transition-opacity duration-300",
          { "opacity-30": panelDisabled }
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
          {!(isMobile && isEditingWithdrawAddr) && !panelDisabled && (
            <div className="flex flex-wrap justify-center items-center gap-2 mx-auto md:caption">
              {!from.address.startsWith("0x") || from.address.length === 0 ? (
                isOsmosisAccountLoaded ? (
                  Bech32Address.shortenAddress(from.address, maxFromChars)
                ) : (
                  <i>Connect Wallet</i>
                )
              ) : (
                truncateEthAddress(from.address)
              )}
              {from.address.length > 0 &&
                !from.address.startsWith("osmo") &&
                selectedWalletDisplay && (
                  <SwitchWalletButton
                    selectedWalletIconUrl={selectedWalletDisplay.iconUrl}
                    onClick={() => onRequestSwitchWallet?.()}
                    disabled={panelDisabled}
                  />
                )}
            </div>
          )}
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
          <div className="flex flex-wrap justify-center items-center gap-2 mx-auto md:caption">
            {!isEditingWithdrawAddr &&
              !panelDisabled &&
              (!to.address.startsWith("0x") || to.address.length === 0 ? (
                isOsmosisAccountLoaded ? (
                  Bech32Address.shortenAddress(
                    editWithdrawAddrConfig &&
                      editWithdrawAddrConfig.customAddress !== ""
                      ? editWithdrawAddrConfig.customAddress
                      : to.address,
                    maxToChars
                  )
                ) : (
                  <i>Connect Wallet</i>
                )
              ) : (
                truncateEthAddress(to.address)
              ))}
            {to.address.length > 0 &&
            !to.address.startsWith("osmo") &&
            selectedWalletDisplay ? (
              <SwitchWalletButton
                selectedWalletIconUrl={selectedWalletDisplay.iconUrl}
                onClick={() => onRequestSwitchWallet?.()}
                disabled={panelDisabled}
              />
            ) : undefined}
            {isWithdraw &&
              editWithdrawAddrConfig &&
              !panelDisabled &&
              !isEditingWithdrawAddr && (
                <Button
                  className="border border-primary-50 hover:border-primary-50/60 text-primary-50 hover:text-primary-50/60"
                  type="outline"
                  onClick={() => {
                    setIsEditingWithdrawAddr(true);
                    trackEvent(AssetsPageEvents.editWithdrawAddress);
                    editWithdrawAddrConfig.setCustomAddress(to.address);
                  }}
                >
                  Edit
                </Button>
              )}
            {isEditingWithdrawAddr && editWithdrawAddrConfig && (
              <InputBox
                className="w-full"
                style="no-border"
                currentValue={editWithdrawAddrConfig.customAddress}
                disabled={panelDisabled}
                onInput={(value) => {
                  editWithdrawAddrConfig.setDidAckWithdrawRisk(false);
                  editWithdrawAddrConfig.setCustomAddress(value);
                }}
                labelButtons={[
                  {
                    label: "Enter",
                    className:
                      "bg-primary-50 hover:bg-primary-50 border-0 rounded-md",
                    onClick: () => setIsEditingWithdrawAddr(false),
                    disabled: !editWithdrawAddrConfig.isValid,
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
          { "opacity-30": panelDisabled }
        )}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline place-content-between">
            {isMobile ? (
              <span className="subtitle1">Select Amount</span>
            ) : (
              <h6>Select Amount</h6>
            )}
            <div
              className={classNames(
                "text-xs text-white-high caption transition-opacity",
                availableBalance && availableBalance.isReady
                  ? "opacity-100"
                  : "opacity-0"
              )}
            >
              Available{!isMobile && ` on ${from.networkName}`}:{" "}
              <button
                className="text-primary-50 cursor-pointer disabled:cursor-default"
                disabled={availableBalance?.toDec().isZero()}
                onClick={() => {
                  trackEvent(
                    isWithdraw
                      ? AssetsPageEvents.withdrawMaxAmount
                      : AssetsPageEvents.depositMaxAmount
                  );
                  toggleIsMax();
                }}
              >
                {availableBalance?.trim(true).toString()}
              </button>
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
        {warningMessage && (
          <GradientView
            className="text-center"
            gradientClassName="bg-superfluid"
            bgClassName="bg-surface"
          >
            <span className="body2 md:caption">{warningMessage}</span>
          </GradientView>
        )}
        {editWithdrawAddrConfig && editWithdrawAddrConfig.customAddress !== "" && (
          <GradientView className="flex flex-col gap-2 body2 md:caption text-center bg-surface">
            <span>
              Withdrawing to a centralized exchange can result in lost funds.
            </span>
            <div className="mx-auto">
              <CheckBox
                isOn={editWithdrawAddrConfig.didAckWithdrawRisk}
                className="after:!border-superfluid checked:after:bg-superfluid after:rounded-[10px] after:h-6 after:w-6 -top-0.5"
                checkClassName="-top-0.5 h-6 w-6 bg-superfluid rounded-[10px]"
                checkMarkClassName="top-[1px] left-[0.5px] h-6 w-6"
                checkMarkIconUrl="/icons/check-mark-surface.svg"
                onToggle={() =>
                  editWithdrawAddrConfig.setDidAckWithdrawRisk(
                    !editWithdrawAddrConfig.didAckWithdrawRisk
                  )
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
