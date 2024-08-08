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
  direction: "deposit" | "withdraw";
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
  const [isSwitchingEvmChain, setIsSwitchingEvmChain] = React.useState(false);

  const {
    isConnected: isEvmWalletConnected,
    chainId: currentEvmWalletChainId,
    connector,
  } = useEvmWalletAccount();
  const { switchChainAsync: switchEvmChain } = useSwitchEvmChain();

  const selectableChains = useMemo(
    () => chains.filter((chain) => chain.chainId !== toChain.chainId),
    [chains, toChain]
  );

  const [_query, setQuery, filteredChains] = useFilteredData(selectableChains, [
    "chainId",
    "prettyName",
  ]);

  const showSwitchingNetworkState = isEvmWalletConnected && isSwitchingEvmChain;

  return (
    <ModalBase
      title={
        <div className="md:subtitle1 mx-auto text-h6 font-h6">
          {t("transfer.bridgeNetworkSelect.title")}
        </div>
      }
      className={classNames("!max-w-lg", {
        "min-h-[80vh]": !showSwitchingNetworkState,
      })}
      {...modalProps}
      onAfterClose={() => {
        setQuery("");
        setIsSwitchingEvmChain(false); // Avoid small flicker after changing evm chain and closing the modal
      }}
    >
      <div className="animate-[fadeIn_0.25s]">
        {showSwitchingNetworkState && (
          <div className="flex items-center justify-center pt-12">
            <SwitchingNetworkState
              walletLogo={connector?.icon}
              walletName={connector?.name}
            />
          </div>
        )}

        <div
          className={classNames("py-4", {
            // Hide it to not unmount the function
            hidden: isSwitchingEvmChain,
          })}
        >
          <SearchBox
            onInput={setQuery}
            className="my-4 flex-shrink-0 md:w-full"
            placeholder={t("transfer.bridgeNetworkSelect.searchPlaceholder")}
            size={isMobile ? "small" : "full"}
            autoFocus={!isMobile}
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
                      setIsSwitchingEvmChain(true);
                      await switchEvmChain({
                        chainId: chain.chainId as EthereumChainIds,
                      }).catch((e) => {
                        setIsSwitchingEvmChain(false);
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
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </ModalBase>
  );
};
