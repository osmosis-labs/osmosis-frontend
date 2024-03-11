import { Bech32Address } from "@keplr-wallet/cosmos";
import { CoinPretty, PricePretty, RatePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent } from "react";
import { ReactNode } from "react";
import { useRef, useState } from "react";
import { useClickAway } from "react-use";

import { Icon } from "~/components/assets";
import { GradientView } from "~/components/assets/gradient-view";
import { Button } from "~/components/buttons";
import IconButton from "~/components/buttons/icon-button";
import { SwitchWalletButton } from "~/components/buttons/switch-wallet";
import { BridgeFromToNetwork } from "~/components/complex/bridge-from-to-network";
import { MenuDropdown, MenuToggle } from "~/components/control";
import { InputBox } from "~/components/input";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { Tooltip } from "~/components/tooltip";
import { Disableable, InputProps } from "~/components/types";
import { Checkbox } from "~/components/ui/checkbox";
import { useTranslation } from "~/hooks";
import { useWindowSize } from "~/hooks";
import { truncateEthAddress } from "~/integrations/ethereum/metamask-utils";
import { WalletDisplay } from "~/integrations/wallets";
import { useStore } from "~/stores";
import { formatICNSName } from "~/utils/string";

type PathSource = "counterpartyAccount" | "account";

export type BaseBridgeProviderOption = {
  id: string;
  logo: string;
  name: string;
};

interface ChangeAddressConfig {
  customAddress: string;
  isValid: boolean;
  setCustomAddress: (bech32Address: string) => void;
  didAckWithdrawRisk: boolean;
  setDidAckWithdrawRisk: (did: boolean) => void;
  inputPlaceholder?: string;
}
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
  addWithdrawAddrConfig?: ChangeAddressConfig;
  editWithdrawAddrConfig?: ChangeAddressConfig;
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
    addWithdrawAddrConfig,
  }: TransferProps<BridgeProviderOption>) => {
    const { queriesExternalStore } = useStore();
    const { isMobile } = useWindowSize();
    const { t } = useTranslation();

    const [isEditingWithdrawAddr, setIsEditingWithdrawAddr] = useState(false);
    const [isAddingWithdrawAddr, setIsAddingWithdrawAddr] = useState(false);
    const [isOptionsDropdownOpen, setIsOptionsDropdownOpen] = useState(false);

    const dropdownContainerRef = useRef<HTMLDivElement>(null);
    useClickAway(dropdownContainerRef, () => setIsOptionsDropdownOpen(false));

    const maxFromChars =
      isEditingWithdrawAddr || isAddingWithdrawAddr
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
      editWithdrawAddrConfig ||
      addWithdrawAddrConfig
        ? isMobile
          ? 13
          : 18
        : isMobile
        ? 14
        : 24;

    let toAddressToDisplay: string;
    if (editWithdrawAddrConfig && editWithdrawAddrConfig.customAddress !== "") {
      toAddressToDisplay = editWithdrawAddrConfig.customAddress;
    } else if (
      addWithdrawAddrConfig &&
      addWithdrawAddrConfig.customAddress !== ""
    ) {
      toAddressToDisplay = addWithdrawAddrConfig.customAddress;
    } else {
      toAddressToDisplay = to.address;
    }

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

    const isAddButtonVisible =
      isWithdraw && addWithdrawAddrConfig && !disabled && !isAddingWithdrawAddr;

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
    if (!isEditingWithdrawAddr && !disabled && !isAddingWithdrawAddr) {
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
      <div
        className={classNames("flex flex-col gap-11 overflow-x-auto md:gap-4", {
          "pt-2": toggleUseWrappedConfig,
          "pt-8": !toggleUseWrappedConfig,
        })}
      >
        {toggleUseWrappedConfig && (
          <div className="mx-auto w-fit">
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

        <div className="body1 relative flex w-full flex-col gap-12 text-osmoverse-400 transition-opacity duration-300">
          <BridgeFromToNetwork
            transferPath={[from, to]}
            bridgeProviders={bridgeProviders}
            onSelectBridgeProvider={onSelectBridgeProvider}
            selectedBridgeProvidersId={selectedBridgeProvidersId}
          />
          <div className="z-10 flex w-full gap-4 pr-7 pl-6 text-center md:pr-9 sm:pr-0 sm:pl-0">
            {/* From Address */}
            <div
              className={classNames(
                "md flex w-full rounded-2xl border border-white-faint py-2.5 text-center transition-width",
                {
                  "w-1/4 text-osmoverse-400/30": isEditingWithdrawAddr,
                  hidden: isAddingWithdrawAddr,
                }
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

            {/* To Address */}
            <div
              className={classNames(
                "flex w-full rounded-2xl border border-white-faint py-2.5 text-center transition-width",
                {
                  "w-3/4": isEditingWithdrawAddr,
                }
              )}
            >
              <div
                className={classNames(
                  "md:caption mx-auto flex flex-nowrap items-center justify-center gap-2 sm:flex-wrap",
                  {
                    "w-full px-3": isAddingWithdrawAddr,
                  }
                )}
              >
                {displayToAddress}
                <div
                  className={classNames(
                    "flex items-center gap-2",
                    (isEditingWithdrawAddr || isAddingWithdrawAddr) &&
                      "w-full flex-col"
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
                      {isAddButtonVisible && (
                        <Button
                          mode="amount"
                          onClick={() => {
                            setIsAddingWithdrawAddr(true);
                            addWithdrawAddrConfig.setCustomAddress(to.address);
                          }}
                        >
                          {addWithdrawAddrConfig.customAddress !== ""
                            ? t("assets.ibcTransfer.buttonEdit")
                            : t("assets.ibcTransfer.buttonAdd")}
                        </Button>
                      )}
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

                  <CustomAddressInputBox
                    isVisible={isEditingWithdrawAddr}
                    disabled={disabled}
                    onClickEnter={() => setIsEditingWithdrawAddr(false)}
                    addressConfig={editWithdrawAddrConfig}
                  />
                  <CustomAddressInputBox
                    isVisible={isAddingWithdrawAddr}
                    disabled={disabled}
                    onClickEnter={() => setIsAddingWithdrawAddr(false)}
                    addressConfig={addWithdrawAddrConfig}
                  />
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
                <span className="inline">
                  {t("assets.transfer.expectedOutput")}
                  <Tooltip
                    content={t("assets.transfer.expectedOutputInfo")}
                    className="!inline"
                  >
                    <Icon
                      className="-mt-1 ml-1 inline"
                      width={16}
                      height={16}
                      id="info"
                    />
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

          <AckWithdrawCustomAddressRisk
            addressConfig={editWithdrawAddrConfig}
          />
          <AckWithdrawCustomAddressRisk addressConfig={addWithdrawAddrConfig} />
        </div>
      </div>
    );
  }
);

const AckWithdrawCustomAddressRisk: FunctionComponent<{
  addressConfig?: ChangeAddressConfig;
}> = ({ addressConfig }) => {
  const { t } = useTranslation();

  if (!addressConfig || addressConfig.customAddress === "") return null;

  return (
    <GradientView className="body2 md:caption flex flex-col gap-2 bg-osmoverse-800 text-center">
      <span>{t("assets.ibcTransfer.warningLossFunds")}</span>
      <div className="mx-auto flex">
        <Checkbox
          id="verify"
          checked={addressConfig.didAckWithdrawRisk}
          variant="secondary"
          onClick={() =>
            addressConfig.setDidAckWithdrawRisk(
              !addressConfig.didAckWithdrawRisk
            )
          }
        />
        <label className="ml-2 items-center" htmlFor="verify">
          {t("assets.ibcTransfer.checkboxVerify")}
        </label>
      </div>
    </GradientView>
  );
};

const CustomAddressInputBox: FunctionComponent<{
  isVisible: boolean;
  disabled: boolean;
  onClickEnter: () => void;
  addressConfig?: ChangeAddressConfig;
}> = ({ addressConfig, isVisible, onClickEnter, disabled }) => {
  const { t } = useTranslation();

  if (!isVisible || !addressConfig) return null;

  return (
    <InputBox
      className="w-full"
      style="no-border"
      currentValue={addressConfig.customAddress}
      disabled={disabled}
      onInput={(value) => {
        addressConfig.setDidAckWithdrawRisk(false);
        addressConfig.setCustomAddress(value);
      }}
      placeholder={addressConfig.inputPlaceholder}
      autoFocus
      labelButtons={[
        {
          label: t("assets.ibcTransfer.buttonEnter"),
          className:
            "bg-wosmongton-100 hover:bg-wosmongton-100 border-0 rounded-md",
          onClick: onClickEnter,
          disabled: !addressConfig.isValid,
        },
      ]}
    />
  );
};
