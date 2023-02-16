import { Bech32Address } from "@keplr-wallet/cosmos";
import { CoinPretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { useWindowSize } from "../../hooks";
import { truncateEthAddress } from "../../integrations/ethereum/metamask-utils";
import { WalletDisplay } from "../../integrations/wallets";
import { useStore } from "../../stores";
import { formatICNSName } from "../../utils/string";
import { BridgeAnimation } from "../animation/bridge";
import { GradientView } from "../assets/gradient-view";
import { Button } from "../buttons";
import { SwitchWalletButton } from "../buttons/switch-wallet";
import { CheckBox, Switch } from "../control";
import { InputBox } from "../input";
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
  /** Required, can be hardcoded estimate. */
  transferFee?: CoinPretty;
  /** Toggle to allow user to specify use of wrapped token if a native equivalent token is being transferred. */
  toggleUseWrapped?: {
    useWrapped: boolean;
    toggleUseWrapped: () => void;
    wrappedTokenDenom: string;
  };
  waitTime: string;
  disablePanel?: boolean;
} & InputProps<string> &
  Disableable;

/** Presentation component for prompting the bridging of arbitrary assets, with an extension for editing withdraw address. */
export const Transfer: FunctionComponent<TransferProps> = observer(
  ({
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
    toggleUseWrapped,
    waitTime,
    disablePanel = false,
  }) => {
    const { queriesExternalStore } = useStore();
    const { isMobile } = useWindowSize();
    const t = useTranslation();

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
      ? 13 // can't be on mobile
      : !from.address.startsWith("osmo") && selectedWalletDisplay
      ? isMobile
        ? 13
        : 18 // more space for switch wallet button
      : isMobile
      ? 14
      : 24;
    const maxToChars =
      (!to.address.startsWith("osmo") && selectedWalletDisplay) || // make room for btns
      editWithdrawAddrConfig
        ? isMobile
          ? 13
          : 18
        : isMobile
        ? 14
        : 24;

    const toAddressToDisplay =
      editWithdrawAddrConfig && editWithdrawAddrConfig.customAddress !== ""
        ? editWithdrawAddrConfig.customAddress
        : to.address;

    const toAddressIcnsName = formatICNSName(
      queriesExternalStore.queryICNSNames.getQueryContract(toAddressToDisplay)
        ?.primaryName
    );
    const fromAddressIcnsName = formatICNSName(
      queriesExternalStore.queryICNSNames.getQueryContract(from.address)
        ?.primaryName
    );

    return (
      <div className="flex flex-col gap-11 overflow-x-auto">
        <BridgeAnimation
          className={`mx-auto ${bridge ? "mt-4 -mb-2 md:-mb-6" : "mt-6 -mb-4"}`}
          transferPath={[from, bridge, to]}
        />
        <div
          className={classNames(
            "body1 flex gap-4 text-osmoverse-400 transition-opacity duration-300 md:gap-2",
            { "opacity-30": panelDisabled }
          )}
        >
          <div
            className={classNames(
              "flex w-full rounded-2xl border border-white-faint p-4 text-center transition-width md:p-2",
              {
                "w-1/4": isEditingWithdrawAddr,
                "text-osmoverse-400/30": isEditingWithdrawAddr,
              }
            )}
          >
            {!(isMobile && isEditingWithdrawAddr) && !panelDisabled && (
              <div
                className="md:caption mx-auto flex flex-wrap items-center justify-center gap-2"
                title={from.address}
              >
                {!from.address.startsWith("0x") || from.address.length === 0 ? (
                  isOsmosisAccountLoaded ? (
                    fromAddressIcnsName ??
                    Bech32Address.shortenAddress(from.address, maxFromChars)
                  ) : (
                    <i>{t("connectWallet")}</i>
                  )
                ) : (
                  truncateEthAddress(from.address)
                )}
                {from.address.length > 0 &&
                  !from.address.includes("osmo") &&
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
              "w-full rounded-2xl border border-white-faint text-center transition-width",
              isEditingWithdrawAddr ? "p-[7px]" : "flex p-4 md:p-2",
              {
                "w-3/4": isEditingWithdrawAddr,
              }
            )}
          >
            <div className="md:caption mx-auto flex flex-wrap items-center justify-center gap-2">
              {!isEditingWithdrawAddr &&
                !panelDisabled &&
                (!to.address.startsWith("0x") || to.address.length === 0 ? (
                  isOsmosisAccountLoaded ? (
                    <span title={toAddressToDisplay}>
                      {toAddressIcnsName ??
                        Bech32Address.shortenAddress(
                          toAddressToDisplay,
                          maxToChars
                        )}
                    </span>
                  ) : (
                    <i>{t("connectWallet")}</i>
                  )
                ) : (
                  truncateEthAddress(to.address)
                ))}
              {to.address.length > 0 &&
              !to.address.includes("osmo") &&
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
                    mode="amount"
                    onClick={() => {
                      setIsEditingWithdrawAddr(true);
                      editWithdrawAddrConfig.setCustomAddress(to.address);
                    }}
                  >
                    {t("assets.ibcTransfer.buttonEdit")}
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
                      label: t("assets.ibcTransfer.buttonEnter"),
                      className:
                        "bg-wosmongton-100 hover:bg-wosmongton-100 border-0 rounded-md",
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
            <div className="flex place-content-between items-baseline">
              {isMobile ? (
                <span className="subtitle1">
                  {t("assets.ibcTransfer.selectAmount")}
                </span>
              ) : (
                <h6>{t("assets.ibcTransfer.selectAmount")}</h6>
              )}
              <div
                className={classNames(
                  "caption text-xs text-white-high transition-opacity",
                  availableBalance ? "opacity-100" : "opacity-0"
                )}
              >
                {isMobile
                  ? t("assets.transfer.availableMobile")
                  : t("assets.transfer.availableOn", {
                      network: from.networkName,
                    })}{" "}
                <button
                  className="cursor-pointer text-wosmongton-100 disabled:cursor-default"
                  disabled={availableBalance?.toDec().isZero()}
                  onClick={() => {
                    toggleIsMax();
                  }}
                >
                  {availableBalance?.trim(true).toString()}
                </button>
              </div>
            </div>
            <InputBox
              type="number"
              className="p-3 text-h6"
              inputClassName="text-right"
              currentValue={currentValue}
              onInput={onInput}
            />
          </div>
          <div className="caption my-2 flex flex-col gap-2.5 rounded-lg border border-white-faint p-2.5 text-wireframes-lightGrey">
            {transferFee && (
              <div className="flex place-content-between items-center">
                <span>{t("assets.transfer.transferFee")}</span>
                <span>{transferFee!.trim(true).toString()}</span>
              </div>
            )}
            <div className="flex place-content-between items-center">
              <span>{t("assets.ibcTransfer.estimatedTime")}</span>
              <span>{waitTime}</span>
            </div>
            {toggleUseWrapped && (
              <div className="flex place-content-between items-center">
                <span>
                  {t(
                    isWithdraw
                      ? "assets.transfer.withdrawAs"
                      : "assets.transfer.depositAs",
                    { denom: toggleUseWrapped.wrappedTokenDenom }
                  )}
                </span>
                <Switch
                  isOn={toggleUseWrapped.useWrapped}
                  onToggle={toggleUseWrapped.toggleUseWrapped}
                />
              </div>
            )}
          </div>
          {warningMessage && (
            <GradientView
              className="text-center"
              gradientClassName="bg-superfluid"
              bgClassName="bg-osmoverse-900"
            >
              <span className="body2 md:caption">{warningMessage}</span>
            </GradientView>
          )}
          {editWithdrawAddrConfig &&
            editWithdrawAddrConfig.customAddress !== "" && (
              <GradientView className="body2 md:caption flex flex-col gap-2 bg-osmoverse-800 text-center">
                <span>{t("assets.ibcTransfer.warningLossFunds")}</span>
                <div className="mx-auto">
                  <CheckBox
                    isOn={editWithdrawAddrConfig.didAckWithdrawRisk}
                    className="-top-0.5 after:h-6 after:w-6 after:rounded-[10px] after:!border-superfluid checked:after:bg-superfluid"
                    checkClassName="-top-1 -left-0.5 h-6 w-6 bg-superfluid rounded-[10px]"
                    checkMarkClassName="top-[1px] -left-[0.5px] h-6 w-6"
                    checkMarkIconUrl="/icons/check-mark-dark.svg"
                    onToggle={() =>
                      editWithdrawAddrConfig.setDidAckWithdrawRisk(
                        !editWithdrawAddrConfig.didAckWithdrawRisk
                      )
                    }
                  >
                    {t("assets.ibcTransfer.checkboxVerify")}
                  </CheckBox>
                </div>
              </GradientView>
            )}
        </div>
      </div>
    );
  }
);
