import type { BridgeChain } from "@osmosis-labs/bridge";
import { BridgeTransactionDirection } from "@osmosis-labs/types";
import classNames from "classnames";
import React, { useMemo, useState } from "react";

import { BridgeWalletSelectScreen } from "~/components/bridge/immersive/bridge-wallet-select-modal";
import { SearchBox } from "~/components/input";
import {
  Screen,
  ScreenGoBackButton,
  ScreenManager,
} from "~/components/screen-manager";
import { SwitchingNetworkState } from "~/components/wallet-states/switching-network-state";
import { EthereumChainIds } from "~/config/wagmi";
import { useEvmWalletAccount, useSwitchEvmChain } from "~/hooks/evm-wallet";
import { useTranslation } from "~/hooks/language";
import { ModalBase, ModalBaseProps } from "~/modals";

enum Screens {
  Main = "main",
  SelectWallet = "select-wallet",
}
interface BridgeNetworkSelectModalProps extends ModalBaseProps {
  direction: BridgeTransactionDirection;
  chains: {
    prettyName: string;
    chainId: BridgeChain["chainId"];
    chainType: BridgeChain["chainType"];
  }[];
  onSelectChain: (chain: BridgeChain) => void;
}

export const BridgeNetworkSelectModal = ({
  direction,
  chains,
  onSelectChain,
  ...modalProps
}: BridgeNetworkSelectModalProps) => {
  const { t } = useTranslation();

  const [isSwitchingChain, setIsSwitchingChain] = useState(false);

  const [connectingToEvmChain, setConnectingToEvmChain] =
    useState<Extract<BridgeChain, { chainType: "evm" }>>();

  const {
    isConnected: isEvmWalletConnected,
    chainId: currentEvmChainId,
    connector,
  } = useEvmWalletAccount();
  const { switchChainAsync } = useSwitchEvmChain();

  const [query, setQuery] = useState("");

  const filteredChains = useMemo(() => {
    return chains.filter(({ prettyName }) =>
      prettyName.toLowerCase().includes(query.toLowerCase())
    );
  }, [chains, query]);

  return (
    <ScreenManager defaultScreen={Screens.Main}>
      {({ currentScreen, setCurrentScreen }) => (
        <>
          <ModalBase
            title={
              currentScreen === Screens.SelectWallet
                ? `Select ${
                    direction === "deposit" ? "deposit" : "withdraw"
                  } wallet`
                : t("transfer.bridgeNetworkSelect.title")
            }
            className="relative !max-w-[30rem]"
            {...modalProps}
            onAfterClose={() => {
              setQuery("");
              setCurrentScreen(Screens.Main);
            }}
          >
            <Screen screenName={Screens.SelectWallet}>
              <div className="animate-[fadeIn_0.25s]">
                <ScreenGoBackButton
                  className="absolute top-7 left-4"
                  onClick={() => {
                    setConnectingToEvmChain(undefined);
                  }}
                />
                <BridgeWalletSelectScreen
                  onClose={() => {
                    modalProps.onRequestClose();
                  }}
                  direction={direction}
                  onSelectChain={(chain) => {
                    onSelectChain(chain);
                  }}
                  evmChain={connectingToEvmChain}
                />
              </div>
            </Screen>

            <Screen screenName={Screens.Main}>
              <div className="animate-[fadeIn_0.25s]">
                {isEvmWalletConnected && isSwitchingChain && (
                  <div className="flex items-center justify-center pt-12">
                    <SwitchingNetworkState
                      walletLogo={connector?.icon}
                      walletName={connector?.name}
                    />
                  </div>
                )}

                <div
                  className={classNames({
                    // Hide it to not unmount the function
                    hidden: isSwitchingChain,
                  })}
                >
                  <SearchBox
                    onInput={(nextValue) => {
                      setQuery(nextValue);
                    }}
                    className="my-4 flex-shrink-0"
                    placeholder={t(
                      "transfer.bridgeNetworkSelect.searchPlaceholder"
                    )}
                    size="full"
                  />
                  <div className="flex flex-col gap-1">
                    {filteredChains.map((chain) => {
                      const shouldSwitchChain =
                        isEvmWalletConnected &&
                        chain.chainType === "evm" &&
                        currentEvmChainId !== chain.chainId;
                      return (
                        <button
                          key={chain.chainId}
                          className="subtitle1 flex items-center justify-between rounded-2xl px-4 py-4 transition-colors duration-200 hover:bg-osmoverse-700/50"
                          onClick={async () => {
                            if (shouldSwitchChain) {
                              try {
                                setIsSwitchingChain(true);
                                await switchChainAsync({
                                  chainId: chain.chainId as EthereumChainIds,
                                });
                              } catch {
                                setIsSwitchingChain(false);
                                return;
                              }
                            }

                            if (
                              !isEvmWalletConnected &&
                              chain.chainType === "evm"
                            ) {
                              setConnectingToEvmChain({
                                chainId: Number(chain.chainId),
                                chainType: chain.chainType,
                                chainName: chain.prettyName,
                              });
                              setCurrentScreen(Screens.SelectWallet);
                              return;
                            }

                            onSelectChain({
                              chainId: chain.chainId,
                              chainType: chain.chainType,
                              chainName: chain.prettyName,
                            } as BridgeChain);
                          }}
                        >
                          <span>{chain.prettyName}</span>
                          {shouldSwitchChain && (
                            <span className="body1 text-wosmongton-300">
                              {t("transfer.connect")}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Screen>
          </ModalBase>
        </>
      )}
    </ScreenManager>
  );
};
