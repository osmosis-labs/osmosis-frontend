import { Bech32Address } from "@keplr-wallet/cosmos";
import { CoinPretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent, useRef, useState } from "react";
import { useTranslation } from "react-multi-lang";
import { useClickAway } from "react-use";

import { Icon } from "~/components/assets";
import { GradientView } from "~/components/assets/gradient-view";
import { useWindowSize } from "~/hooks";
import { formatICNSName } from "~/utils/string";

import { truncateEthAddress } from "~/integrations/ethereum/metamask-utils";
import { WalletDisplay } from "~/integrations/wallets";
import { useStore } from "~/stores";
import { BridgeAnimation } from "../animation/bridge";
import { Button } from "../buttons";
import IconButton from "../buttons/icon-button";
import { SwitchWalletButton } from "../buttons/switch-wallet";
import { CheckBox, MenuDropdown, MenuToggle } from "../control";
import { InputBox } from "../input";
import { Disableable, InputProps } from "../types";

type PathSource = "counterpartyAccount" | "account";

export type TransferProps = {
  isWithdraw: boolean;
  /** If there is a bridge it is assumed there is a nonKeplr wallet and the switch button will be shown. */
  transferPath: [
    {
      address: string;
      networkName: string;
      source: PathSource;
      iconUrl?: string;
    },
    {
      address: string;
      networkName: string;
      source: PathSource;
      iconUrl?: string;
    }
  ];
  selectedWalletDisplay?: WalletDisplay;
  isOsmosisAccountLoaded: boolean;
  onRequestSwitchWallet?: (source: PathSource) => void;
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
  toggleUseWrappedConfig?: {
    isUsingWrapped: boolean;
    setIsUsingWrapped: (isUsingWrapped: boolean) => void;
    nativeDenom: string;
    wrapDenom: string;
    disabled?: boolean;
  };
  /** Required, can be hardcoded estimate. */
  transferFee?: CoinPretty;
  gasCost?: CoinPretty;
  waitTime: string;
} & InputProps<string> &
  Disableable;

/** Presentation component for prompting the bridging of arbitrary assets, with an extension for editing withdraw address. */
export const Transfer: FunctionComponent<TransferProps> = observer(
  ({
    isWithdraw,
    transferPath: [from, to],
    selectedWalletDisplay,
    isOsmosisAccountLoaded,
    onRequestSwitchWallet,
    availableBalance,
    currentValue,
    onInput,
    editWithdrawAddrConfig,
    warningMessage,
    toggleIsMax,
    toggleUseWrappedConfig,
    transferFee,
    gasCost,
    waitTime,
    disabled = false,
  }) => {
    const { queriesExternalStore } = useStore();
    const { isMobile } = useWindowSize();
    const t = useTranslation();

    const [isEditingWithdrawAddr, setIsEditingWithdrawAddr] = useState(false);
    const [isOptionsDropdownOpen, setIsOptionsDropdownOpen] = useState(false);

    const dropdownContainerRef = useRef<HTMLDivElement>(null);
    useClickAway(dropdownContainerRef, () => setIsOptionsDropdownOpen(false));

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

    const isSwitchWalletVisibleForTo =
      to.address.length > 0 &&
      !to.address.startsWith("osmo") &&
      !isEditingWithdrawAddr &&
      selectedWalletDisplay;

    const isEditButtonVisible =
      isWithdraw &&
      editWithdrawAddrConfig &&
      !disabled &&
      !isEditingWithdrawAddr;

    return (
      <div className="flex flex-col gap-11 overflow-x-auto md:gap-4">
        {toggleUseWrappedConfig && (
          <div className="mx-auto w-fit pt-[10px]">
            <MenuToggle
              options={[
                {
                  id: toggleUseWrappedConfig.nativeDenom,
                  display: toggleUseWrappedConfig.nativeDenom,
                },
                {
                  id: toggleUseWrappedConfig.wrapDenom,
                  display: toggleUseWrappedConfig.wrapDenom,
                },
              ]}
              onSelect={(id) => {
                toggleUseWrappedConfig.setIsUsingWrapped(
                  id === toggleUseWrappedConfig.wrapDenom
                );
              }}
              selectedOptionId={
                toggleUseWrappedConfig.isUsingWrapped
                  ? toggleUseWrappedConfig.wrapDenom
                  : toggleUseWrappedConfig.nativeDenom
              }
              disabled={toggleUseWrappedConfig.disabled}
            />
          </div>
        )}
        <BridgeAnimation
          className={`mx-auto ${
            toggleUseWrappedConfig ? "mt-0" : "mt-6 -mb-4"
          }`}
          transferPath={[from, to]}
        />
        <div
          className={classNames(
            "body1 flex gap-4 text-osmoverse-400 transition-opacity duration-300 md:gap-2"
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
            {!(isMobile && isEditingWithdrawAddr) && !disabled && (
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
                  !from.address.startsWith("osmo") &&
                  selectedWalletDisplay && (
                    <SwitchWalletButton
                      selectedWalletIconUrl={selectedWalletDisplay.iconUrl}
                      onClick={() => onRequestSwitchWallet?.(from.source)}
                      disabled={disabled}
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
            <div className="md:caption mx-auto flex flex-nowrap items-center  justify-center gap-2 sm:flex-wrap">
              {!isEditingWithdrawAddr &&
                !disabled &&
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
              <div
                className={classNames(
                  "flex items-center gap-2",
                  isEditingWithdrawAddr && "w-full flex-col"
                )}
              >
                {/* To avoid overflowing, display menu dropdown when edit and switch wallet are visible. */}
                {isEditButtonVisible && isSwitchWalletVisibleForTo ? (
                  <div
                    ref={dropdownContainerRef}
                    className="hover:pointer-cursor relative"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <IconButton
                      icon={<Icon id="more-menu" className="h-6 w-6" />}
                      aria-label="Menu"
                      onClick={() =>
                        setIsOptionsDropdownOpen(!isOptionsDropdownOpen)
                      }
                      mode="unstyled"
                    />
                    <MenuDropdown
                      className="top-full right-0"
                      isOpen={isOptionsDropdownOpen}
                      options={[
                        {
                          id: "switch-wallet",
                          display: (
                            <div className="flex gap-2 whitespace-nowrap">
                              <div className="mt-[2px] h-[16px] w-[16px]">
                                <Image
                                  src={selectedWalletDisplay!.iconUrl}
                                  width={16}
                                  height={16}
                                  alt="wallet icon"
                                />
                              </div>
                              <p>Switch wallet</p>
                            </div>
                          ),
                        },
                        {
                          id: "edit-address",
                          display: "Edit address",
                        },
                      ]}
                      onSelect={(id) => {
                        setIsOptionsDropdownOpen(false);

                        if (id === "switch-wallet") {
                          onRequestSwitchWallet?.(to.source);
                        }

                        if (id === "edit-address") {
                          setIsEditingWithdrawAddr(true);
                          editWithdrawAddrConfig.setCustomAddress(to.address);
                        }
                      }}
                      isFloating
                    />
                  </div>
                ) : (
                  <>
                    {isSwitchWalletVisibleForTo ? (
                      <SwitchWalletButton
                        selectedWalletIconUrl={selectedWalletDisplay!.iconUrl}
                        onClick={() => onRequestSwitchWallet?.(to.source)}
                        disabled={disabled}
                      />
                    ) : undefined}
                    {isEditButtonVisible && (
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
                  </>
                )}
                {isEditingWithdrawAddr && editWithdrawAddrConfig && (
                  <InputBox
                    className="w-full"
                    style="no-border"
                    currentValue={editWithdrawAddrConfig.customAddress}
                    disabled={disabled}
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
        </div>
        <div
          className={classNames(
            "flex flex-col gap-4 transition-opacity duration-300",
            { "opacity-30": disabled }
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
                <span>
                  {transferFee!.trim(true).toString()}
                  {gasCost && ` + ${gasCost.trim(true).toString()}`}
                </span>
              </div>
            )}
            <div className="flex place-content-between items-center">
              <span>{t("assets.ibcTransfer.estimatedTime")}</span>
              <span>{waitTime}</span>
            </div>
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
                    className="after:h-6 after:w-6 after:rounded-[10px] after:!border-superfluid checked:after:bg-superfluid"
                    checkClassName="rounded-[10px]"
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
