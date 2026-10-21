import { ChainWalletBase, WalletRepo, WalletStatus } from "@cosmos-kit/core";
import type { CosmosRegistryWallet } from "@osmosis-labs/tx";
import {
  CosmosKitAccountsLocalStorageKey,
  CosmosKitWalletLocalStorageKey,
} from "@osmosis-labs/tx";
import { noop } from "@osmosis-labs/utils";
import { useState } from "react";
import { Connector } from "wagmi";

import { OsmosisChainInfo } from "~/config/chain";
import { EthereumChainIds } from "~/config/wagmi";
import { CosmosWalletRegistry } from "~/config/wallet-registry";
import { useConnectEvmWallet } from "~/hooks/evm-wallet";
import { CreateOneClickSessionError } from "~/hooks/mutations/one-click-trading";
import { useWallet } from "~/hooks/use-wallet";
import { WalletSelectOption } from "~/hooks/use-wallet-select";
import { WagmiWalletConnectType } from "~/modals/wallet-select/use-selectable-wallets";
import { useStore } from "~/stores";

export type OnConnectWallet = (
  params:
    | {
        walletType: "cosmos";
        wallet: CosmosRegistryWallet | ChainWalletBase | undefined;
      }
    | {
        walletType: "evm";
        wallet: Connector;
        chainId?: EthereumChainIds;
      }
) => Promise<void>;

export const useConnectWallet = ({
  onRequestClose,
  walletOptions,
  onConnect: onConnectProp,
  onConnecting,
  onCreate1CTSession,
  isOneClickEnabled,
}: {
  onConnect?: (params: { walletType: "evm" | "cosmos" }) => void;
  onConnecting?: () => void;
  walletOptions: WalletSelectOption[];
  onRequestClose?: () => void;

  isOneClickEnabled?: boolean;
  onCreate1CTSession?: () => Promise<void>;
}) => {
  const { walletRuntime } = useStore();

  const { connectAsync: connectEvmWallet, ...connectEvmWalletUtils } =
    useConnectEvmWallet();

  const [lazyWalletInfo, setLazyWalletInfo] =
    useState<(typeof CosmosWalletRegistry)[number]>();

  const cosmosOption = walletOptions.find(
    (option): option is Extract<WalletSelectOption, { walletType: "cosmos" }> =>
      option.walletType === "cosmos"
  );

  const cosmosChainId = cosmosOption?.chainId;
  const snapshot = useWallet(cosmosChainId);
  const rootWalletRepo = cosmosChainId
    ? walletRuntime.getWalletRepo(cosmosChainId)
    : undefined;
  const current = cosmosOption ? snapshot.wallet : undefined;
  const cosmosChainName = rootWalletRepo?.chainRecord.chain?.chain_name!;

  const onConnectCosmosWallet = async ({
    wallet,
    walletRepo: walletRepoParam,
  }: {
    wallet: CosmosRegistryWallet | ChainWalletBase;
    walletRepo: WalletRepo;
  }) => {
    if (current) {
      await current?.disconnect(true);
    }

    const handleConnectError = (e: Error) => {
      console.error("Error while connecting to wallet. Details: ", e);
      localStorage.removeItem(CosmosKitWalletLocalStorageKey);
      localStorage.removeItem(CosmosKitAccountsLocalStorageKey);
    };

    if (!("lazyInstall" in wallet)) {
      wallet
        .connect(false)
        .then(() => {
          onConnectProp?.({
            walletType: "cosmos",
          });
        })
        .catch(handleConnectError);
      return;
    }

    const isWalletInstalled = rootWalletRepo?.wallets.some(
      ({ walletName }) => walletName === wallet.name
    );

    let walletRepo: WalletRepo;

    // if wallet is not installed, install it
    if (!isWalletInstalled && "lazyInstall" in wallet) {
      setLazyWalletInfo(wallet);
      onConnecting?.();

      // wallet is now walletInfo
      const walletInfo = wallet;
      const WalletClass = await wallet.lazyInstall();

      const walletManager = await walletRuntime.installWallet(
        new WalletClass(walletInfo)
      );
      await walletRuntime.mount().catch(handleConnectError);
      setLazyWalletInfo(undefined);

      walletRepo = walletManager.getWalletRepo(cosmosChainName!);
    } else {
      walletRepo = walletRepoParam;
    }

    const isOsmosisConnection = OsmosisChainInfo.chainName === cosmosChainName!;
    const osmosisWalletRepo = walletRuntime.getWalletRepo(
      OsmosisChainInfo.chainName
    );

    if (
      !isOsmosisConnection &&
      osmosisWalletRepo.walletStatus !== WalletStatus.Connected
    ) {
      await osmosisWalletRepo
        .connect(wallet.name, false)
        .catch(handleConnectError);
    }

    return walletRepo
      .connect(wallet.name, false)
      .then(async () => {
        onConnectProp?.({
          walletType: "cosmos",
        });

        if (isOneClickEnabled && onCreate1CTSession) {
          try {
            await onCreate1CTSession();
          } catch (e) {
            const error = e as CreateOneClickSessionError | Error;

            if (error instanceof Error) {
              throw new CreateOneClickSessionError(error.message);
            }

            throw e;
          }
        }
      })
      .catch((e: Error | unknown) => {
        if (e instanceof CreateOneClickSessionError) throw e;
        handleConnectError(
          e instanceof Error ? e : new Error("Unknown error.")
        );
      });
  };

  const onConnectWagmiWallet = async ({
    wallet,
    chainId,
  }: {
    wallet: Connector;
    chainId: EthereumChainIds | undefined;
  }) => {
    // Close modal to show WalletConnect QR code modal
    if (wallet.type === WagmiWalletConnectType) {
      onRequestClose?.();
    }

    await connectEvmWallet(
      { connector: wallet, chainId: chainId },
      {
        onSuccess: () => {
          onConnectProp?.({ walletType: "evm" });
        },
        onError: (e) => {
          console.error("Error while connecting to wallet. Details: ", e);
        },
      }
    );
  };

  const onConnect: OnConnectWallet = async (param) => {
    if (!param.wallet) return;

    if (param.walletType === "cosmos" && rootWalletRepo) {
      return onConnectCosmosWallet({
        wallet: param.wallet,
        walletRepo: rootWalletRepo,
      });
    }

    if (param.walletType === "evm") {
      return onConnectWagmiWallet({
        wallet: param.wallet,
        chainId: param.chainId,
      }).catch(noop);
    }
  };

  return {
    wagmi: connectEvmWalletUtils,
    cosmos: {
      lazyWalletInfo,
      walletRepo: rootWalletRepo,
      wallet: current,
      walletStatus: cosmosOption ? snapshot.walletStatus : undefined,
    },
    onConnect,
  };
};
