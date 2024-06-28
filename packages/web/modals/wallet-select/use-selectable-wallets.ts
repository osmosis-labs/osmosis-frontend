import { useMemo } from "react";
import { Connector } from "wagmi";

import { AvailableCosmosWallets } from "~/config/generated/cosmos-kit-wallet-list";
import { CosmosWalletRegistry } from "~/config/wallet-registry";
import { useConnectEvmWallet } from "~/hooks/evm-wallet";

export const WagmiWalletConnectType = "walletConnect";
export const WagmiMetamaskSdkType = "metaMask";

export const useSelectableWallets = ({
  isMobile,
  includedWallets,
}: {
  isMobile: boolean;
  includedWallets: ("cosmos" | "evm")[];
}) => {
  const { connectors } = useConnectEvmWallet();

  const evmWallets = useMemo(() => {
    if (!includedWallets.includes("evm")) return [];

    return (
      connectors
        .reduce((acc, wallet) => {
          const walletToAdd = { ...wallet, walletType: "evm" as const };

          if (wallet.name === "MetaMask") {
            walletToAdd.icon = "/logos/metamask.svg";
          }

          if (wallet.type === WagmiMetamaskSdkType) {
            walletToAdd.name = walletToAdd.name + " (Mobile)";
          }

          if (wallet.name === "WalletConnect") {
            walletToAdd.icon = "/logos/walletconnect.svg";
          }

          if (wallet.name === "Coinbase Wallet") {
            walletToAdd.icon = "/logos/coinbase.svg";
          }

          return [...acc, walletToAdd];
        }, [] as (Connector & { walletType: "evm" })[])
        // type === "injected" should come first
        .sort((a, b) => {
          if (a.type === "injected" && b.type !== "injected") return -1;
          if (a.type !== "injected" && b.type === "injected") return 1;
          return 0;
        })
    );
  }, [connectors, includedWallets]);

  const cosmosWallets = useMemo(() => {
    if (!includedWallets.includes("cosmos")) return [];
    return (
      CosmosWalletRegistry
        // If mobile, filter out browser wallets
        .reduce((acc, wallet, _index, array) => {
          if (isMobile) {
            /**
             * If an extension wallet is found in mobile, this means that we are inside an app browser.
             * Therefore, we should only show that compatible extension wallet.
             * */
            if (acc.length > 0 && acc[0].name.endsWith("-extension")) {
              return acc;
            }

            const _window = window as Record<string, any>;
            const mobileWebModeName = "mobile-web";

            /**
             * If on mobile and `leap` is in `window`, it means that the user enters
             * the frontend from Leap's app in app browser. So, there is no need
             * to use wallet connect, as it resembles the extension's usage.
             */
            if (
              _window?.cdc_wallet?.cosmos &&
              _window?.cdc_wallet?.cosmos.mode === mobileWebModeName
            ) {
              return array
                .filter(
                  (wallet) =>
                    wallet.name === AvailableCosmosWallets.CryptocomWallet
                )
                .map((wallet) => ({ ...wallet, mobileDisabled: false }));
            }

            /**
             * If on mobile and `leap` is in `window`, it means that the user enters
             * the frontend from Leap's app in app browser. So, there is no need
             * to use wallet connect, as it resembles the extension's usage.
             */
            if (_window?.leap && _window?.leap?.mode === mobileWebModeName) {
              return array
                .filter((wallet) => wallet.name === AvailableCosmosWallets.Leap)
                .map((wallet) => ({ ...wallet, mobileDisabled: false }));
            }

            /**
             * If on mobile and `keplr` is in `window`, it means that the user enters
             * the frontend from Keplr's app in app browser. So, there is no need
             * to use wallet connect, as it resembles the extension's usage.
             */
            if (_window?.keplr && _window?.keplr?.mode === mobileWebModeName) {
              return array
                .filter(
                  (wallet) => wallet.name === AvailableCosmosWallets.Keplr
                )
                .map((wallet) => ({ ...wallet, mobileDisabled: false }));
            }

            /**
             * If user is in a normal mobile browser, show only wallet connect
             */
            return wallet.name.endsWith("mobile") ? [...acc, wallet] : acc;
          }

          return [...acc, wallet];
        }, [] as (typeof CosmosWalletRegistry)[number][])
        .map((wallet) => ({
          ...wallet,
          walletType: "cosmos" as const,
        }))
    );
  }, [includedWallets, isMobile]);

  return { evmWallets, cosmosWallets };
};
