import { BridgeTransactionDirection } from "@osmosis-labs/types";
import classNames from "classnames";
import React, { FunctionComponent, useMemo } from "react";

import { ChainLogo } from "~/components/assets/chain-logo";
import { SearchBox } from "~/components/input";
import { SwitchingNetworkState } from "~/components/wallet-states/switching-network-state";
import { EthereumChainIds } from "~/config/wagmi";
import { useFilteredData, useWindowSize } from "~/hooks";
import { useEvmWalletAccount, useSwitchEvmChain } from "~/hooks/evm-wallet";
import { useTranslation } from "~/hooks/language";
import { ModalBase, ModalBaseProps } from "~/modals";
import { BridgeChainWithDisplayInfo } from "~/server/api/routers/bridge-transfer";

import { SupportedChain } from "./use-bridges-supported-assets";

interface BridgeNetworkSelectModalProps extends ModalBaseProps {
  direction: BridgeTransactionDirection;
  toChain: BridgeChainWithDisplayInfo;
  chains: SupportedChain[];
  onSelectChain: (chain: BridgeChainWithDisplayInfo) => void;
  onConfirmManualAddress: ((address: string) => void) | undefined;
  initialManualAddress: string | undefined;
}

export const BridgeNetworkSelectModal: FunctionComponent<
  BridgeNetworkSelectModalProps
> = ({
  direction,
  chains,
  onSelectChain,
  toChain,
  onConfirmManualAddress,
  initialManualAddress,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { isMobile } = useWindowSize();

  const {
    isConnected: isEvmWalletConnected,
    chainId: currentEvmWalletChainId,
    connector,
  } = useEvmWalletAccount();
  const { switchChainAsync: switchEvmChain, isLoading: isSwitchingEvmChain } =
    useSwitchEvmChain();

  const selectableChains = useMemo(
    () => chains.filter((chain) => chain.chainId !== toChain.chainId),
    [chains, toChain]
  );

  const [_query, setQuery, filteredChains] = useFilteredData(selectableChains, [
    "prettyName",
  ]);

  return (
    <ModalBase
      title={
        <div className="md:subtitle1 mx-auto text-h6 font-h6">
          {t("transfer.bridgeNetworkSelect.title")}
        </div>
      }
      className="relative !max-w-[30rem]"
      {...modalProps}
      onAfterClose={() => {
        setQuery("");
      }}
    >
      <div className="animate-[fadeIn_0.25s]">
        {isEvmWalletConnected && isSwitchingEvmChain && (
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
            hidden: isSwitchingEvmChain,
          })}
        >
          <SearchBox
            onInput={setQuery}
            className="my-4 flex-shrink-0 md:w-full"
            placeholder={t("transfer.bridgeNetworkSelect.searchPlaceholder")}
            size={isMobile ? "small" : "full"}
            autoFocus
          />
          <div className="flex flex-col gap-1">
            {filteredChains.map((chain) => {
              const shouldSwitchEvmChain =
                isEvmWalletConnected &&
                chain.chainType === "evm" &&
                currentEvmWalletChainId !== chain.chainId;
              return (
                <button
                  key={chain.chainId}
                  className="flex items-center justify-between rounded-2xl p-4 transition-colors duration-200 hover:bg-osmoverse-700/50 md:py-2 md:px-0"
                  onClick={async () => {
                    if (shouldSwitchEvmChain) {
                      await switchEvmChain({
                        chainId: chain.chainId as EthereumChainIds,
                      }).catch((e) => {
                        console.error("Failed to switch EVM chain", e);
                      });
                    }

                    onSelectChain(chain);
                  }}
                >
                  <div className="flex items-center gap-4 md:gap-3">
                    <ChainLogo
                      prettyName={chain.prettyName}
                      logoUri={chain.logoUri}
                      color={chain.color}
                      size="lg"
                    />

                    <span className="subtitle1 md:body2">
                      {chain.prettyName}
                    </span>
                  </div>
                  {shouldSwitchEvmChain && (
                    <span className="body1 md:body2 text-wosmongton-300">
                      {t("transfer.connect")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </ModalBase>
  );
};
