import { Menu } from "@headlessui/react";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { CoinPretty, PricePretty, RatePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { ReactNode } from "react";
import { useRef, useState } from "react";
import { useClickAway } from "react-use";

import { BridgeAnimation } from "~/components/animation/bridge";
import { Icon } from "~/components/assets";
import { GradientView } from "~/components/assets/gradient-view";
import { Button } from "~/components/buttons";
import IconButton from "~/components/buttons/icon-button";
import { SwitchWalletButton } from "~/components/buttons/switch-wallet";
import { CheckBox, MenuDropdown, MenuToggle } from "~/components/control";
import { InputBox } from "~/components/input";
import SkeletonLoader from "~/components/skeleton-loader";
import { Tooltip } from "~/components/tooltip";
import { Disableable, InputProps } from "~/components/types";
import { useTranslation } from "~/hooks";
import { useWindowSize } from "~/hooks";
import { truncateEthAddress } from "~/integrations/ethereum/metamask-utils";
import { WalletDisplay } from "~/integrations/wallets";
import { useStore } from "~/stores";
import { formatICNSName, truncateString } from "~/utils/string";

type PathSource = "counterpartyAccount" | "account";

export type BaseBridgeProviderOption = {
  id: string;
  logo: string;
  name: string;
};

type ClassKeys = "expectedOutputValue" | "priceImpactValue";

export type TransferProps<
  BridgeProviderOption extends BaseBridgeProviderOption
> = {
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
  classes?: Partial<Record<ClassKeys, string>>;
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
  transferFee?: CoinPretty | string;
  transferFeeFiat?: PricePretty;
  gasCost?: CoinPretty | string;
  gasCostFiat?: PricePretty;
  waitTime: string;
  expectedOutput?: CoinPretty | string;
  expectedOutputFiat?: PricePretty;
  priceImpact?: RatePretty | string;
  bridgeProviders?: BridgeProviderOption[];
  selectedBridgeProvidersId?: string;
  onSelectBridgeProvider?: (id: BridgeProviderOption) => void;
  isLoadingDetails?: boolean;
} & InputProps<string> &
  Disableable;

/** Presentation component for prompting the bridging of arbitrary assets, with an extension for editing withdraw address. */
export const Transfer = observer(
  <BridgeProviderOption extends BaseBridgeProviderOption>({
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
    transferFeeFiat,
    gasCost,
    gasCostFiat,
    waitTime,
    disabled = false,
    bridgeProviders,
    selectedBridgeProvidersId,
    onSelectBridgeProvider,
    isLoadingDetails,
    expectedOutput,
    expectedOutputFiat,
    priceImpact,
    classes,
  }: TransferProps<BridgeProviderOption>) => {
    const { queriesExternalStore } = useStore();
    const { isMobile } = useWindowSize();
    const { t } = useTranslation();

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

    const overlayedIconSize = isMobile
      ? { height: 36, width: 36 }
      : { height: 45, width: 45 };
    const longFromName = from.networkName.length > 7;
    const longToName = to.networkName.length > 7;

    const selectedProvider = bridgeProviders?.find(
      (provider) => provider.id === selectedBridgeProvidersId
    );
    const filteredBridgeProviders = bridgeProviders?.filter(
      (provider) => provider.id !== selectedBridgeProvidersId
    );

    let displayFromAddress: ReactNode | undefined;
    if (!from.address.startsWith("0x") || from.address.length === 0) {
      if (isOsmosisAccountLoaded) {
        displayFromAddress =
          fromAddressIcnsName ??
          Bech32Address.shortenAddress(from.address, maxFromChars);
      } else {
        displayFromAddress = <i>{t("connectWallet")}</i>;
      }
    } else {
      displayFromAddress = truncateEthAddress(from.address);
    }

    let displayToAddress: ReactNode | undefined;
    if (!isEditingWithdrawAddr && !disabled) {
      if (!to.address.startsWith("0x") || to.address.length === 0) {
        if (isOsmosisAccountLoaded) {
          displayToAddress = (
            <span title={toAddressToDisplay}>
              {toAddressIcnsName ??
                Bech32Address.shortenAddress(toAddressToDisplay, maxToChars)}
            </span>
          );
        } else {
          displayToAddress = <i>{t("connectWallet")}</i>;
        }
      } else {
        displayToAddress = truncateEthAddress(to.address);
      }
    }

    return (
      <div className="flex flex-col gap-11 overflow-x-auto pt-8 md:gap-4">
        {toggleUseWrappedConfig && (
          <div className="mx-auto w-fit ">
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

        <div
          className={classNames(
            "body1 relative flex gap-4 text-osmoverse-400 transition-opacity duration-300 md:gap-2"
          )}
        >
          <BridgeAnimation />

          {/* From */}
          <div
            className={classNames(
              "z-10 flex w-full flex-col gap-12 transition-width",
              !isEditingWithdrawAddr && "flex pl-6 sm:pl-0",
              {
                "w-1/4 text-osmoverse-400/30": isEditingWithdrawAddr,
              }
            )}
          >
            {/* Network*/}
            <div className="flex flex-col items-center gap-4 text-center">
              <span
                className={classNames(
                  "whitespace-nowrap text-osmoverse-100 transition-opacity duration-300",
                  longFromName || longToName
                    ? isMobile
                      ? "caption"
                      : "subtitle1"
                    : "md:subtitle2",
                  longFromName
                    ? "left-[90px] md:-left-[4px]"
                    : "left-[122px] md:left-[10px]"
                )}
              >
                {t("assets.transfer.from")}{" "}
                {truncateString(from.networkName, 22)}
              </span>

              {from.iconUrl && (
                <div
                  className="transition-opacity duration-300"
                  style={overlayedIconSize}
                >
                  <Image
                    alt="token icon"
                    src={from.iconUrl}
                    {...overlayedIconSize}
                  />
                </div>
              )}
            </div>

            {/* Address */}
            <div
              className={classNames(
                "flex h-full w-full rounded-2xl border border-white-faint p-4 text-center md:p-2"
              )}
            >
              {!(isMobile && isEditingWithdrawAddr) && !disabled && (
                <div
                  className="md:caption mx-auto flex flex-wrap items-center justify-center gap-2"
                  title={from.address}
                >
                  {displayFromAddress}
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
          </div>

          {/* Provider select */}
          {filteredBridgeProviders && selectedProvider && (
            <div
              className="absolute left-1/2 flex -translate-x-[33%] transform place-content-between items-center"
              title={t("assets.ibcTransfer.provider")}
            >
              {filteredBridgeProviders?.length === 0 ? (
                <p className="subtitle-2 flex flex-col items-center gap-4">
                  <span className="rounded-lg bg-osmoverse-700 px-2 text-osmoverse-200">
                    {selectedProvider.name}
                  </span>
                  <Image
                    src={selectedProvider.logo}
                    alt={`${selectedProvider.name} logo`}
                    {...overlayedIconSize}
                  />
                </p>
              ) : (
                <Menu>
                  {({ open }) => (
                    <div className="relative">
                      <Menu.Button className="flex flex-col items-center gap-4">
                        <div className="subtitle-2 flex items-center gap-1.5 rounded-lg bg-osmoverse-700 px-2 text-osmoverse-200">
                          {selectedProvider.name}
                          <Icon
                            className="flex shrink-0 items-center"
                            id={open ? "chevron-up" : "chevron-down"}
                            height={10}
                            width={10}
                          />
                        </div>
                        <Image
                          src={selectedProvider.logo}
                          alt={`${selectedProvider.name} logo`}
                          {...overlayedIconSize}
                        />
                      </Menu.Button>

                      <Menu.Items className="absolute top-1/3 -right-px mb-2 flex w-max select-none flex-col overflow-hidden rounded-xl border border-osmoverse-700 bg-osmoverse-700">
                        {filteredBridgeProviders.map((provider, index) => (
                          <Menu.Item key={provider.id}>
                            {({ active }) => (
                              <button
                                onClick={() =>
                                  onSelectBridgeProvider?.(provider)
                                }
                                className={classNames(
                                  "flex cursor-pointer items-center gap-2 py-1 pl-2  pr-4 transition-colors",
                                  {
                                    "bg-osmoverse-600": active,
                                    "rounded-b-xlinset":
                                      index ===
                                      filteredBridgeProviders.length - 1,
                                  }
                                )}
                              >
                                <div className="flex flex-shrink-0">
                                  <Image
                                    src={provider.logo}
                                    alt={`${provider.name} logo`}
                                    width={16}
                                    height={16}
                                  />
                                </div>
                                {provider.name}
                              </button>
                            )}
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    </div>
                  )}
                </Menu>
              )}
            </div>
          )}

          {/* To */}
          <div
            className={classNames(
              "z-10 flex w-full flex-col gap-12 transition-width",
              isEditingWithdrawAddr ? "p-[7px]" : "flex pr-7 md:pr-9 sm:pr-0",
              {
                "w-3/4": isEditingWithdrawAddr,
              }
            )}
          >
            {/* Network */}
            <div className="flex flex-col items-center gap-4 text-center">
              <span
                className={classNames(
                  "w-fit whitespace-nowrap text-osmoverse-100 transition-opacity duration-300",
                  longFromName || longToName
                    ? isMobile
                      ? "caption"
                      : "subtitle1"
                    : "md:subtitle2",
                  "left-[405px] md:left-[210px]"
                )}
              >
                {t("assets.transfer.to")} {truncateString(to.networkName, 22)}
              </span>
              {to.iconUrl && (
                <div
                  className="transition-opacity duration-300"
                  style={overlayedIconSize}
                >
                  <Image
                    alt="token icon"
                    src={to.iconUrl}
                    {...overlayedIconSize}
                  />
                </div>
              )}
            </div>

            {/* Address */}
            <div
              className={classNames(
                "flex h-full w-full rounded-2xl border border-white-faint py-1 text-center"
              )}
            >
              <div className="md:caption mx-auto flex flex-nowrap items-center justify-center gap-2 sm:flex-wrap">
                {displayToAddress}
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
                  {availableBalance?.trim(true).maxDecimals(6).toString()}
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
            {expectedOutput && (
              <div
                className={
                  "flex place-content-between items-center text-subtitle1 font-subtitle1 text-osmoverse-100"
                }
              >
                <span className="flex items-center gap-1">
                  <span>{t("assets.transfer.expectedOutput")}</span>{" "}
                  <Tooltip content={t("assets.transfer.expectedOutputInfo")}>
                    <Icon width={16} height={16} id="info" />
                  </Tooltip>
                </span>
                <SkeletonLoader
                  className={classNames(
                    "min-w-[8rem] text-right",
                    classes?.expectedOutputValue
                  )}
                  isLoaded={!isLoadingDetails}
                >
                  <span>
                    {typeof expectedOutput === "string"
                      ? expectedOutput
                      : expectedOutput!.trim(true).toString()}{" "}
                  </span>{" "}
                  <span>
                    {expectedOutputFiat
                      ? `(${expectedOutputFiat.toString()})`
                      : undefined}
                  </span>
                </SkeletonLoader>
              </div>
            )}

            <div className="flex place-content-between items-center">
              <span>{t("assets.ibcTransfer.estimatedTime")}</span>
              <SkeletonLoader
                className="min-w-[4rem] text-right"
                isLoaded={!isLoadingDetails}
              >
                <span>{waitTime}</span>
              </SkeletonLoader>
            </div>

            {transferFee && (
              <div className="flex place-content-between items-center">
                <span>{t("assets.transfer.transferFee")}</span>
                <SkeletonLoader
                  className="min-w-[8rem] text-right"
                  isLoaded={!isLoadingDetails}
                >
                  <span>
                    {typeof transferFee === "string"
                      ? transferFee
                      : transferFee!.trim(true).toString()}{" "}
                    {transferFeeFiat &&
                      !gasCostFiat &&
                      `(${transferFeeFiat.toString()})`}
                  </span>{" "}
                  <span>
                    {gasCost && (
                      <>
                        +{" "}
                        <span>
                          {typeof gasCost === "string"
                            ? gasCost
                            : gasCost!.trim(true).toString()}{" "}
                        </span>
                      </>
                    )}
                    {transferFeeFiat && gasCostFiat
                      ? `(${transferFeeFiat
                          .add(gasCostFiat.toDec())
                          .toString()})`
                      : undefined}
                  </span>
                </SkeletonLoader>
              </div>
            )}

            {priceImpact && (
              <div className="flex place-content-between items-center">
                <span>{t("assets.transfer.priceImpact")}</span>
                <SkeletonLoader
                  className={classNames(
                    "min-w-[8rem] text-right",
                    classes?.priceImpactValue
                  )}
                  isLoaded={!isLoadingDetails}
                >
                  <span>
                    {typeof priceImpact === "string"
                      ? priceImpact
                      : priceImpact!.maxDecimals(4).toString()}{" "}
                  </span>{" "}
                </SkeletonLoader>
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
                    borderStyles="border-superfluid"
                    backgroundStyles="bg-superfluid"
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
