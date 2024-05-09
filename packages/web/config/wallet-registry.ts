/* eslint-disable import/no-extraneous-dependencies */
import { DownloadInfo } from "@cosmos-kit/core";
import {
  RegistryWallet,
  WalletConnectionInProgressError,
} from "@osmosis-labs/stores";

import { MainnetChainIds } from "./generated/chain-list";
import { CosmosKitWalletList } from "./generated/cosmos-kit-wallet-list";

export const WalletRegistry: RegistryWallet[] = [
  {
    ...CosmosKitWalletList["trust-extension"],
    logo: "/wallets/trust.png",
    lazyInstall: () =>
      import("@cosmos-kit/trust-extension").then((m) => m.TrustExtensionWallet),
    windowPropertyName: "trustwallet",
    async supportsChain(chainId) {
      const trustAvailableChains: MainnetChainIds[] = [
        "cosmoshub-4",
        "osmosis-1",
        "stride-1",
        "neutron-1",
        "axelar-dojo-1",
        "laozi-mainnet",
        "columbus-5",
        "phoenix-1",
        "evmos_9001-2",
        "injective-1",
        "stargaze-1",
        "crypto-org-chain-mainnet-1",
        "kava_2222-10",
      ];
      return trustAvailableChains.includes(chainId as MainnetChainIds);
    },
    stakeUrl: "https://trustwallet.com/staking",
    governanceUrl: "https://governance.trustwallet.com/",
    features: [],
    downloads: [
      {
        icon: "/wallets/trust.png",
        link: "https://trustwallet.com/download",
      },
    ] as DownloadInfo[],
    mode: "extension", // Add mode property with correct value
  },
  {
    ...CosmosKitWalletList["trust-mobile"],
    logo: "/wallets/trust.png",
    mobileDisabled: false,
    lazyInstall: () =>
      import("~/integrations/trust-walletconnect").then(
        (m) => m.TrustMobileWallet
      ),
    supportsChain: async (chainId) => {
      const trustMobileAvailableChains: MainnetChainIds[] = [
        "akashnet-2",
        "mantle-1",
        "axelar-dojo-1",
        "cosmoshub-4",
        "emoney-3",
        "evmos_9001-2",
        "injective-1",
        "irishub-1",
        "juno-1",
        "kava_2222-10",
        "likecoin-mainnet-2",
        "mars-1",
        "neutron-1",
        "osmosis-1",
        "secret-4",
        "pacific-1",
        "sentinelhub-2",
        "stargaze-1",
        "iov-mainnet-ibc",
        "stride-1",
        "phoenix-1",
      ];

      return trustMobileAvailableChains.includes(chainId as MainnetChainIds);
    },
    stakeUrl: "https://trustwallet.com/staking",
    governanceUrl: "https://governance.trustwallet.com/",
    features: [],
    mode: "wallet-connect",
  },
  {
    ...CosmosKitWalletList["keplr-extension"],
    mobileDisabled: false,
    logo: "/wallets/keplr.svg",
    lazyInstall: () =>
      import("@cosmos-kit/keplr-extension").then((m) => m.KeplrExtensionWallet),
    windowPropertyName: "keplr",
    stakeUrl: "https://wallet.keplr.app/chains/osmosis?tab=staking",
    governanceUrl: "https://wallet.keplr.app/chains/osmosis?tab=governance",
    features: ["notifications"],
    mode: "extension",
  },
  {
    ...CosmosKitWalletList["keplr-mobile"],
    logo: "/wallets/keplr.svg",
    lazyInstall: () =>
      import("~/integrations/keplr-walletconnect").then(
        (m) => m.KeplrMobileWallet
      ),
    supportsChain: async (chainId) => {
      const keplrMobileAvailableChains: MainnetChainIds[] = [
        "cosmoshub-4",
        "osmosis-1",
        "secret-4",
        "regen-1",
        "juno-1",
        "stargaze-1",
        "core-1", // Persistence,
        "axelar-dojo-1",
        "sommelier-3",
        "umee-1",
        "agoric-3",
        "gravity-bridge-3",
        "evmos_9001-2",
        "crypto-org-chain-mainnet-1",
        "stride-1",
        "injective-1",
        "mars-1",
        "columbus-5", // Terra Classic
        "quasar-1",
        "quicksilver-2",
        "omniflixhub-1",
        "kyve-1",
        "neutron-1",
        "gitopia",
        "likecoin-mainnet-2",
        "akashnet-2",
      ];

      return keplrMobileAvailableChains.includes(chainId as MainnetChainIds);
    },
    stakeUrl: "https://wallet.keplr.app/chains/osmosis?tab=staking",
    governanceUrl: "https://wallet.keplr.app/chains/osmosis?tab=governance",
    features: [],
    mode: "wallet-connect",
  },
  {
    ...CosmosKitWalletList["leap-extension"],
    logo: "/wallets/leap.svg",
    mobileDisabled: false,
    lazyInstall: () =>
      import("@cosmos-kit/leap-extension").then((m) => m.LeapExtensionWallet),
    windowPropertyName: "leap",
    stakeUrl: "https://cosmos.leapwallet.io/transact/stake/plain?chain=osmosis",
    governanceUrl: "https://cosmos.leapwallet.io/portfolio/gov?chain=osmosis",
    features: ["notifications"],
    mode: "extension",
  },
  {
    ...CosmosKitWalletList["leap-cosmos-mobile"],
    logo: "/wallets/leap.svg",
    lazyInstall: () =>
      import("@cosmos-kit/leap-mobile").then((m) => m.LeapMobileWallet),
    supportsChain: async (chainId) => {
      const leapMobileAvailableChains: MainnetChainIds[] = [
        "agoric-3",
        "akashnet-2",
        "archway-1",
        "mantle-1",
        "axelar-dojo-1",
        "laozi-mainnet",
        "bitsong-2b",
        "bitcanna-1",
        "canto_7700-1",
        "carbon-1",
        "celestia",
        "cheqd-mainnet-1",
        "chihuahua-1",
        "comdex-1",
        "centauri-1",
        "coreum-mainnet-1",
        "cosmoshub-4",
        "crescent-1",
        "cudos-1",
        "mainnet-3",
        "desmos-mainnet",
        "dydx-mainnet-1",
        "emoney-3",
        "empowerchain-1",
        "evmos_9001-2",
        "fetchhub-4",
        "gravity-bridge-3",
        "gitopia",
        "injective-1",
        "irishub-1",
        "ixo-5",
        "jackal-1",
        "juno-1",
        "kava_2222-10",
        "kichain-2",
        "kaiyo-1",
        "kyve-1",
        "likecoin-mainnet-2",
        "mars-1",
        "migaloo-1",
        "neutron-1",
        "noble-1",
        "pirin-1",
        "nomic-stakenet-3",
        "omniflixhub-1",
        "onomy-mainnet-1",
        "osmosis-1",
        "passage-2",
        "core-1",
        "planq_7070-2",
        "pio-mainnet-1",
        "quasar-1",
        "quicksilver-2",
        "secret-4",
        "pacific-1",
        "sentinelhub-2",
        "sgenet-1",
        "sifchain-1",
        "sommelier-3",
        "stargaze-1",
        "iov-mainnet-ibc",
        "stride-1",
        "teritori-1",
        "phoenix-1",
        "umee-1",
        "dimension_37-1",
      ];
      return leapMobileAvailableChains.includes(chainId as MainnetChainIds);
    },

    stakeUrl: "https://cosmos.leapwallet.io/transact/stake/plain?chain=osmosis",
    governanceUrl: "https://cosmos.leapwallet.io/portfolio/gov?chain=osmosis",
    features: [],
    mode: "wallet-connect",
  },
  {
    ...CosmosKitWalletList["cosmostation-extension"],
    logo: "/wallets/cosmostation.png",
    lazyInstall: () =>
      import("@cosmos-kit/cosmostation-extension").then(
        (m) => m.CosmostationExtensionWallet
      ),
    windowPropertyName: "cosmostation",
    stakeUrl: "https://wallet.cosmostation.io/osmosis/delegate",
    governanceUrl: "https://cosmos.leapwallet.io/gov",
    features: ["notifications"],
    mode: "extension",
  },
  {
    ...CosmosKitWalletList["xdefi-extension"],
    logo: "/wallets/xdefi.png",
    lazyInstall: () =>
      import("@cosmos-kit/xdefi-extension").then((m) => m.XDEFIExtensionWallet),
    windowPropertyName: "xfi",
    async supportsChain(chainId) {
      if (typeof window === "undefined") return true;

      const xfiWallet = (window as any)?.xfi?.keplr as {
        getKey: (chainId: string) => Promise<boolean>;
      };

      if (!xfiWallet) return true;

      return xfiWallet
        .getKey(chainId)
        .then(() => true)
        .catch(() => false);
    },
    features: [],
    mode: "extension",
  },
  {
    ...CosmosKitWalletList["station-extension"],
    mobileDisabled: true,
    logo: "/wallets/station.svg",
    lazyInstall: () =>
      import("@cosmos-kit/station-extension").then(
        (m) => m.StationExtensionWallet
      ),
    windowPropertyName: "station",
    supportsChain: async (chainId) => {
      if (typeof window === "undefined") return true;

      const stationWallet = (window as any)?.station?.keplr as {
        getChainInfosWithoutEndpoints: () => Promise<{ chainId: string }[]>;
      };

      if (!stationWallet) return true;

      const chainInfos = await stationWallet.getChainInfosWithoutEndpoints();
      return chainInfos.some((info) => info.chainId === chainId);
    },
    signOptions: {
      preferNoSetFee: true,
    },
    features: [],
    mode: "extension",
  },
  {
    ...CosmosKitWalletList["okxwallet-extension"],
    logo: "/wallets/okx.png",
    lazyInstall: () =>
      import("@cosmos-kit/okxwallet-extension").then(
        (m) => m.OkxwalletExtensionWallet
      ),
    windowPropertyName: "okxwallet",
    async supportsChain(chainId, retryCount = 0) {
      if (typeof window === "undefined") return true;

      const okxWallet = (window as any)?.okxwallet?.keplr as {
        getKey: (chainId: string) => Promise<boolean>;
      };

      if (!okxWallet) return true;

      try {
        await okxWallet.getKey(chainId);
        return true;
      } catch (e) {
        const error = e as { code: number; message: string };

        // Check for chain not supported error
        if (
          error.code === -32603 &&
          error.message.includes("There is no chain info")
        ) {
          return false;
        }

        // Retry if the wallet is already processing
        if (
          error.code === -32002 &&
          error.message.includes("Already processing") &&
          retryCount < 5
        ) {
          /**
           * Simple exponential backoff mechanism where the delay doubles
           * with each retry. Here, we have a base delay of 100 milliseconds.
           * So, the first retry will wait for 200 ms,
           * the second for 400 ms, and so on.
           */
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 100)
          );
          // @ts-ignore
          return this.supportsChain(chainId, retryCount + 1);
        }

        return false;
      }
    },
    matchError: (error) => {
      if (typeof error !== "string") return error;

      if (
        error.includes(
          "Already processing wallet_requestIdentities. Please wait."
        )
      ) {
        return new WalletConnectionInProgressError();
      }

      return error;
    },
    signOptions: {
      preferNoSetFee: true,
    },
    features: [],
    mode: "extension",
  },
];
