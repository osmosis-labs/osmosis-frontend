import {
  isCosmosAddressValid,
  isEvmAddressValid,
  isNil,
} from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { Connector } from "wagmi";

import { Icon } from "~/components/assets";
import { ChainLogo } from "~/components/assets/chain-logo";
import { SearchBox, TextareaBox } from "~/components/input";
import {
  Screen,
  ScreenGoBackButton,
  ScreenManager,
} from "~/components/screen-manager";
import { Button, GoBackButton } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { SwitchingNetworkState } from "~/components/wallet-states/switching-network-state";
import { EventName } from "~/config";
import { EthereumChainIds } from "~/config/wagmi";
import { useAmplitudeAnalytics, useTranslation, useWindowSize } from "~/hooks";
import {
  useDisconnectEvmWallet,
  useEvmWalletAccount,
  useSwitchEvmChain,
} from "~/hooks/evm-wallet";
import { ModalBase, ModalBaseProps } from "~/modals";
import { EvmWalletState } from "~/modals/wallet-select/evm-wallet-state";
import { useConnectWallet } from "~/modals/wallet-select/use-connect-wallet";
import { useSelectableWallets } from "~/modals/wallet-select/use-selectable-wallets";
import { BridgeChainWithDisplayInfo } from "~/server/api/routers/bridge-transfer";
import { useStore } from "~/stores";

interface BridgeWalletSelectProps {
  direction: "deposit" | "withdraw";
  toChain: BridgeChainWithDisplayInfo;
  fromChain: BridgeChainWithDisplayInfo;
  cosmosChain?: Extract<BridgeChainWithDisplayInfo, { chainType: "cosmos" }>;
  evmChain?: Extract<BridgeChainWithDisplayInfo, { chainType: "evm" }>;
  onSelectChain: (chain: BridgeChainWithDisplayInfo) => void;
  initialManualAddress: string | undefined;
  onConfirmManualAddress: ((address: string) => void) | undefined;
}

export const BridgeWalletSelectModal: FunctionComponent<
  BridgeWalletSelectProps & ModalBaseProps
> = (props) => {
  const { t } = useTranslation();
  const [removeMinHeight, setRemoveMinHeight] = useState(false);

  return (
    <ModalBase
      title={
        <div className="md:subtitle1 mx-auto text-h6 font-h6">
          {props.direction === "deposit"
            ? t("transfer.selectDepositWallet", {
                network: props.fromChain.prettyName,
              })
            : t("transfer.selectWithdrawWallet", {
                network: props.toChain.prettyName,
              })}
        </div>
      }
      className={classNames("!max-w-lg", { "min-h-[50vh]": !removeMinHeight })}
      {...props}
    >
      <BridgeWalletSelectScreens
        {...props}
        onClose={props.onRequestClose}
        setRemoveMinHeight={setRemoveMinHeight}
      />
    </ModalBase>
  );
};

enum WalletSelectScreens {
  WalletSelect = "wallet-select",
  SendToAnotherAddress = "send-to-another-address",
}

export const BridgeWalletSelectScreens: FunctionComponent<
  BridgeWalletSelectProps & {
    onClose: () => void;
    setRemoveMinHeight?: (nextValue: boolean) => void;
  }
> = observer(
  ({
    direction,
    cosmosChain,
    evmChain,
    onClose,
    onSelectChain,
    fromChain,
    toChain,
    initialManualAddress,
    onConfirmManualAddress,
    setRemoveMinHeight,
  }) => {
    const { accountStore } = useStore();
    const { t } = useTranslation();
    const { isMobile } = useWindowSize();
    const { logEvent } = useAmplitudeAnalytics();

    const cosmosAccount = cosmosChain
      ? accountStore.getWallet(accountStore.osmosisChainId)
      : undefined;

    const [search, setSearch] = useState("");
    const [isManaging, setIsManaging] = useState(false);
    const [isSwitchingChain, setIsSwitchingChain] = useState(false);

    const {
      connector: evmConnector,
      isConnected: isEvmWalletConnected,
      chainId: currentEvmChainId,
    } = useEvmWalletAccount();
    const { switchChainAsync, reset: resetSwitchEvmChainState } =
      useSwitchEvmChain();

    const { disconnect: disconnectEvmWallet } = useDisconnectEvmWallet();

    const {
      onConnect: onConnectWallet,
      wagmi: {
        variables: connectingWagmiVariables,
        status: connectingWagmiStatus,
        error: connectingWagmiError,
        reset: resetEvmConnecting,
      },
    } = useConnectWallet({
      walletOptions: [
        ...(cosmosChain?.chainId
          ? [{ walletType: "cosmos" as const, chainId: cosmosChain.chainId }]
          : []),
        ...(evmChain?.chainId
          ? [
              {
                walletType: "evm" as const,
                chainId: evmChain.chainId as EthereumChainIds,
              },
            ]
          : []),
      ],
      onConnect: () => {
        onSelectChain(evmChain!);
        onClose();
      },
    });
    const { evmWallets } = useSelectableWallets({
      includedWallets: ["evm"],
      isMobile,
    });

    useEffect(() => {
      // Adjust modal height when connecting to a wallet or switching chain to prevent misalignment.
      if (
        !isNil(connectingWagmiVariables?.connector) ||
        (isEvmWalletConnected && isSwitchingChain)
      ) {
        return setRemoveMinHeight?.(true);
      }
      setRemoveMinHeight?.(false);
    }, [
      connectingWagmiVariables?.connector,
      isEvmWalletConnected,
      isSwitchingChain,
      setRemoveMinHeight,
    ]);

    if (!isNil(connectingWagmiVariables?.connector)) {
      return (
        <div className="pt-12">
          <GoBackButton
            onClick={() => {
              resetEvmConnecting();
            }}
            className="absolute left-8 top-6 md:left-4 md:top-7"
          />
          <EvmWalletState
            onRequestClose={onClose}
            connector={connectingWagmiVariables.connector as Connector}
            status={connectingWagmiStatus}
            error={connectingWagmiError}
            onConnect={onConnectWallet}
          />
        </div>
      );
    }

    if (isEvmWalletConnected && isSwitchingChain) {
      return (
        <div className="flex items-center justify-center pt-12">
          <GoBackButton
            onClick={() => {
              resetSwitchEvmChainState();
            }}
            className="absolute top-6 left-8 md:left-4 md:top-7"
          />
          <SwitchingNetworkState
            walletLogo={evmConnector?.icon}
            walletName={evmConnector?.name}
          />
        </div>
      );
    }

    const showEvmWallets = !isNil(evmChain) && !isNil(evmWallets);
    const transferWithSameWallet = fromChain.chainType === toChain.chainType;

    return (
      <ScreenManager defaultScreen={WalletSelectScreens.WalletSelect}>
        {({ setCurrentScreen }) => (
          <>
            <Screen screenName={WalletSelectScreens.SendToAnotherAddress}>
              <ScreenGoBackButton
                className="absolute top-6 left-8 md:left-4 md:top-7"
                onClick={() => {
                  setCurrentScreen(WalletSelectScreens.WalletSelect);
                }}
              />
              <SendToAnotherAddressForm
                onConfirm={(address) => {
                  onConfirmManualAddress?.(address);
                  onClose();
                }}
                toChain={toChain}
                initialManualAddress={initialManualAddress}
              />
            </Screen>

            <Screen screenName={WalletSelectScreens.WalletSelect}>
              <section className="flex flex-col gap-8 py-8 md:gap-4 md:py-4">
                <div className="flex h-full w-full flex-col gap-4 overflow-y-scroll">
                  {showEvmWallets && (
                    <SearchBox
                      className="!w-full"
                      size={isMobile ? "small" : "medium"}
                      placeholder={t("walletSelect.searchWallets")}
                      onInput={(nextValue) => {
                        setSearch(nextValue);
                      }}
                      currentValue={search}
                      autoFocus={!isMobile}
                    />
                  )}

                  {isEvmWalletConnected && (
                    <div className="flex w-full flex-col gap-2 md:gap-1">
                      <div className="flex w-full items-center justify-between px-3 md:px-0">
                        <p className="body1 md:body2 text-osmoverse-200">
                          {t("walletSelect.yourConnectedWallets")}
                        </p>
                        {isEvmWalletConnected && !isNil(cosmosAccount) && (
                          <Button
                            variant="link"
                            onClick={() => setIsManaging(!isManaging)}
                            className="!h-fit !px-0 !py-0 text-wosmongton-200"
                          >
                            {isManaging
                              ? t("walletSelect.done")
                              : t("walletSelect.manage")}
                          </Button>
                        )}
                      </div>

                      {/** Conditional wallet buttons */}
                      <div className="flex flex-col">
                        {(isEvmWalletConnected || !isNil(cosmosAccount)) && (
                          <div className="flex w-full flex-col">
                            {!isNil(cosmosAccount) && !isNil(cosmosChain) && (
                              <WalletButton
                                onClick={() => {
                                  onSelectChain(cosmosChain);
                                  onClose();
                                }}
                                name={
                                  isManaging
                                    ? cosmosAccount.walletInfo.prettyName
                                    : t(
                                        transferWithSameWallet
                                          ? "transfer.transferWithNoun"
                                          : "transfer.transferFrom",
                                        {
                                          noun:
                                            cosmosAccount?.walletInfo
                                              .prettyName ?? "",
                                        }
                                      )
                                }
                                icon={cosmosAccount.walletInfo.logo}
                                suffix={
                                  isManaging ? (
                                    <p className="body2 text-osmoverse-400">
                                      {t("walletSelect.primaryWallet")}
                                    </p>
                                  ) : undefined
                                }
                              />
                            )}
                            {isEvmWalletConnected && !isNil(evmChain) && (
                              <WalletButton
                                onClick={async () => {
                                  const shouldSwitchChain =
                                    isEvmWalletConnected &&
                                    currentEvmChainId !== evmChain.chainId;

                                  if (shouldSwitchChain) {
                                    try {
                                      setIsSwitchingChain(true);
                                      await switchChainAsync({
                                        chainId:
                                          evmChain.chainId as EthereumChainIds,
                                      });
                                    } catch {
                                      setIsSwitchingChain(false);
                                      return;
                                    }
                                  }

                                  onSelectChain(evmChain);
                                  onClose();
                                }}
                                name={
                                  isManaging ? (
                                    evmConnector?.name
                                  ) : (
                                    <>
                                      {" "}
                                      {t("transfer.transferFrom", {
                                        noun: evmConnector?.name ?? "",
                                      })}
                                    </>
                                  )
                                }
                                icon={evmConnector?.icon}
                                suffix={
                                  isManaging ? (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        disconnectEvmWallet();
                                      }}
                                    >
                                      {t("walletSelect.disconnect")}
                                    </Button>
                                  ) : undefined
                                }
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {showEvmWallets && (
                    <div className="flex h-full w-full flex-col gap-2 overflow-y-scroll md:gap-1">
                      <p className="body1 md:body2 px-3 text-osmoverse-200 md:px-0">
                        {t("walletSelect.otherWallets")}
                      </p>
                      <div className="flex flex-col">
                        {direction === "withdraw" && (
                          <WalletButton
                            onClick={() => {
                              setCurrentScreen(
                                WalletSelectScreens.SendToAnotherAddress
                              );
                            }}
                            name={t("transfer.sendToAnotherAddress")}
                            icon={
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-osmoverse-700">
                                <Icon
                                  id="wallet"
                                  className="text-osmoverse-400"
                                />
                              </div>
                            }
                            suffix={
                              <Icon
                                id="chevron-right"
                                className="text-osmoverse-400"
                                width={10}
                                height={17}
                              />
                            }
                          />
                        )}
                        {evmWallets
                          .filter((wallet) => {
                            if (wallet.id === evmConnector?.id) return false; // Don't show connected wallet
                            if (!search) return true;
                            return wallet.name
                              .toLowerCase()
                              .includes(search.toLowerCase());
                          })
                          .map((wallet) => (
                            <WalletButton
                              key={wallet.id}
                              onClick={() => {
                                onConnectWallet({
                                  walletType: "evm",
                                  wallet,
                                  chainId: evmChain.chainId as EthereumChainIds,
                                });
                                logEvent([
                                  EventName.DepositWithdraw.walletSelected,
                                  { walletName: wallet.name },
                                ]);
                              }}
                              name={wallet.name}
                              icon={wallet.icon}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </Screen>
          </>
        )}
      </ScreenManager>
    );
  }
);

const WalletButton: React.FC<{
  onClick: () => void;
  icon: ReactNode | undefined;
  name: ReactNode;
  suffix?: ReactNode;
}> = ({ onClick, icon, name, suffix }) => (
  <div
    className={classNames(
      "flex w-full cursor-pointer place-content-between items-center gap-2 rounded-xl px-3 transition-colors hover:bg-osmoverse-700 active:bg-osmoverse-700/50 md:px-0",
      "col-span-2 py-3 font-normal",
      "disabled:opacity-70"
    )}
    onClick={onClick}
  >
    <button className="subtitle1 flex items-center gap-3">
      {typeof icon === "string" ? (
        <img src={icon} width={40} height={40} alt="Wallet logo" />
      ) : (
        icon
      )}
      <span>{name}</span>
    </button>

    {suffix}
  </div>
);

interface SendToAnotherAddressFormProps {
  initialManualAddress?: string;
  onConfirm: ((address: string) => void) | undefined;
  toChain: BridgeChainWithDisplayInfo;
}

const SendToAnotherAddressForm: FunctionComponent<
  SendToAnotherAddressFormProps
> = ({ initialManualAddress, onConfirm, toChain }) => {
  const { t } = useTranslation();
  const [isInvalidAddress, setIsInvalidAddress] = useState(false);
  const [address, setAddress] = useState(initialManualAddress ?? "");
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  const handleConfirm = () => {
    if (isAcknowledged) {
      onConfirm?.(address);
    }
  };

  return (
    <section className="flex flex-col gap-4 pt-8">
      <div className="flex gap-2 rounded-2xl bg-osmoverse-900 p-4">
        <Icon
          id="alert-triangle"
          className="flex-shrink-0 text-rust-400"
          width={24}
          height={24}
        />
        <p className="body2 text-osmoverse-300">
          {t("transfer.verifyAddressWarning")}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <label
          className="body2 text-osmoverse-300"
          htmlFor="withdraw-address-textarea"
        >
          {t("transfer.recipientAddress", { chain: toChain.prettyName })}
        </label>
        <TextareaBox
          id="withdraw-address-textarea"
          currentValue={address}
          onInput={(nextValue) => {
            const isValid =
              toChain.chainType === "cosmos"
                ? isCosmosAddressValid({
                    address: nextValue,
                    bech32Prefix: toChain.bech32Prefix,
                  })
                : toChain.chainType === "evm" &&
                  isEvmAddressValid({ address: nextValue });

            if (!nextValue) setIsInvalidAddress(false);
            else setIsInvalidAddress(!isValid);

            setAddress(nextValue);
          }}
          placeholder={t("transfer.enterAddress")}
          className="w-full"
          classes={{
            textarea: isInvalidAddress ? "text-rust-200" : undefined,
          }}
          trailingSymbol={
            <ChainLogo
              color={toChain.color}
              logoUri={toChain.logoUri}
              prettyName={toChain.prettyName}
            />
          }
          rows={2}
        />
        {isInvalidAddress && (
          <p className="body2 text-rust-400">
            {t("transfer.invalidAddress", { chain: toChain.prettyName })}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Checkbox
          checked={isAcknowledged}
          onClick={() => setIsAcknowledged(!isAcknowledged)}
        />
        <p
          className="body1 cursor-pointer select-none text-osmoverse-300"
          onClick={() => setIsAcknowledged(!isAcknowledged)}
        >
          {t("transfer.acknowledgement")}
        </p>
      </div>
      <Button
        onClick={handleConfirm}
        disabled={!isAcknowledged || isInvalidAddress || !address}
        className="w-full"
      >
        {t("transfer.done")}
      </Button>
    </section>
  );
};
