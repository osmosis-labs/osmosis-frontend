import { BridgeChain } from "@osmosis-labs/bridge";
import { BridgeTransactionDirection } from "@osmosis-labs/types";
import { isNil } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { ReactNode, useState } from "react";
import { Connector } from "wagmi";

import { SearchBox } from "~/components/input";
import { Button } from "~/components/ui/button";
import { SwitchingNetworkState } from "~/components/wallet-states/switching-network-state";
import { EthereumChainIds } from "~/config/wagmi";
import {
  useDisconnectEvmWallet,
  useEvmWalletAccount,
  useSwitchEvmChain,
} from "~/hooks/evm-wallet";
import { ModalBase, ModalBaseProps } from "~/modals";
import { EvmWalletState } from "~/modals/wallet-select/evm-wallet-state";
import { useConnectWallet } from "~/modals/wallet-select/use-connect-wallet";
import { useSelectableWallets } from "~/modals/wallet-select/use-selectable-wallets";
import { useStore } from "~/stores";

interface BridgeWalletSelectProps extends ModalBaseProps {
  direction: BridgeTransactionDirection;
  cosmosChain?: Extract<BridgeChain, { chainType: "cosmos" }>;
  evmChain?: Extract<BridgeChain, { chainType: "evm" }>;
  onSelectChain: (chain: BridgeChain) => void;
}

export const BridgeWalletSelectModal = observer(
  (props: BridgeWalletSelectProps) => {
    const { direction, cosmosChain, evmChain, onSelectChain, ...modalProps } =
      props;

    return (
      <ModalBase
        title={
          direction === "deposit"
            ? "Select deposit wallet"
            : "Select withdraw wallet"
        }
        className="!max-w-[450px]"
        {...modalProps}
      >
        <BridgeWalletSelectScreen
          direction={direction}
          cosmosChain={cosmosChain}
          evmChain={evmChain}
          onClose={modalProps.onRequestClose}
          onSelectChain={onSelectChain}
        />
      </ModalBase>
    );
  }
);

export const BridgeWalletSelectScreen = ({
  cosmosChain,
  evmChain,
  onClose,
  onSelectChain,
}: Pick<
  BridgeWalletSelectProps,
  "cosmosChain" | "evmChain" | "direction" | "onSelectChain"
> & {
  onClose: () => void;
}) => {
  const { accountStore } = useStore();
  const cosmosAccount = cosmosChain
    ? accountStore.getWallet(cosmosChain.chainId)
    : undefined;

  const [search, setSearch] = useState("");
  const [isManaging, setIsManaging] = useState(false);
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);

  const {
    connector: evmConnector,
    isConnected: isEvmWalletConnected,
    chainId: currentEvmChainId,
  } = useEvmWalletAccount();
  const { switchChainAsync } = useSwitchEvmChain();

  const { disconnect: disconnectEvmWallet } = useDisconnectEvmWallet();

  const {
    onConnect: onConnectWallet,
    wagmi: {
      variables: connectingWagmiVariables,
      status: connectingWagmiStatus,
      error: connectingWagmiError,
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
    isMobile: false,
  });

  if (!isNil(connectingWagmiVariables?.connector)) {
    return (
      <div className="pt-12">
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
        <SwitchingNetworkState
          walletLogo={evmConnector?.icon}
          walletName={evmConnector?.name}
        />
      </div>
    );
  }

  const showEvmWallets = !isNil(evmChain) && !isNil(evmWallets);

  return (
    <section className="flex flex-col gap-8 py-8">
      <div className="flex w-full flex-col gap-4">
        {showEvmWallets && (
          <SearchBox
            className="!w-full"
            size="medium"
            placeholder="Search wallets"
            onInput={(nextValue) => {
              setSearch(nextValue);
            }}
            currentValue={search}
          />
        )}

        {(isEvmWalletConnected || !isNil(cosmosAccount)) && (
          <div className="flex w-full flex-col gap-2">
            <div className="flex w-full items-center justify-between px-3">
              <p className="body1 text-osmoverse-200">Your connected wallets</p>
              <Button
                variant="link"
                onClick={() => setIsManaging(!isManaging)}
                className="!h-fit !px-0 !py-0 text-wosmongton-200"
              >
                {isManaging ? "Done" : "Manage"}
              </Button>
            </div>

            <>
              {!isNil(cosmosAccount) && !isNil(cosmosChain) && (
                <WalletButton
                  onClick={() => {
                    onSelectChain(cosmosChain);
                    onClose();
                  }}
                  name={
                    isManaging ? (
                      cosmosAccount.walletInfo.prettyName
                    ) : (
                      <>Transfer from {cosmosAccount?.walletInfo.prettyName}</>
                    )
                  }
                  icon={cosmosAccount.walletInfo.logo}
                  suffix={
                    isManaging ? (
                      <p className="body2 text-osmoverse-400">Primary wallet</p>
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
                          chainId: evmChain.chainId as EthereumChainIds,
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
                      <>Transfer from {evmConnector?.name ?? ""}</>
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
                        Disconnect
                      </Button>
                    ) : undefined
                  }
                />
              )}
            </>
          </div>
        )}

        {showEvmWallets && (
          <div className="flex w-full flex-col gap-2">
            <p className="body1 px-3 text-osmoverse-200">Other wallets</p>
            <div className="flex flex-col sm:flex-row sm:overflow-x-auto">
              {evmWallets
                .filter((wallet) => {
                  if (wallet.id === evmConnector?.id) return false; // Don't show connected wallet
                  if (!search) return true;
                  return wallet.name
                    .toLowerCase()
                    .includes(search.toLowerCase());
                })
                .map((wallet) => {
                  return (
                    <WalletButton
                      key={wallet.id}
                      onClick={() =>
                        onConnectWallet({
                          walletType: "evm",
                          wallet,
                          chainId: evmChain.chainId as EthereumChainIds,
                        })
                      }
                      name={wallet.name}
                      icon={wallet.icon}
                    />
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const WalletButton: React.FC<{
  onClick: () => void;
  icon: string | undefined;
  name: ReactNode;
  suffix?: ReactNode;
}> = ({ onClick, icon, name, suffix }) => {
  return (
    <div
      className={classNames(
        "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 transition-colors hover:bg-osmoverse-700 active:bg-osmoverse-700/50",
        "col-span-2 py-3 font-normal",
        "sm:w-fit sm:flex-col",
        "disabled:opacity-70"
      )}
      onClick={onClick}
    >
      <button className="subtitle1 flex items-center gap-3">
        {typeof icon === "string" && (
          <img src={icon} width={40} height={40} alt="Wallet logo" />
        )}
        <span>{name}</span>
      </button>

      {suffix}
    </div>
  );
};
