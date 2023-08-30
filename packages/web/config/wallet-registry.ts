/* eslint-disable import/no-extraneous-dependencies */
import { RegistryWallet } from "@osmosis-labs/stores";

import { AvailableChainIds } from "~/config/generated/chain-infos";
import { CosmosKitWalletList } from "~/config/generated/cosmos-kit-wallet-list";

export const WalletRegistry: RegistryWallet[] = [
  {
    ...CosmosKitWalletList["keplr-extension"],
    mobileDisabled: false,
    logo: "/wallets/keplr.svg",
    lazyInstall: () =>
      import("@cosmos-kit/keplr-extension").then((m) => m.KeplrExtensionWallet),
    windowPropertyName: "keplr",
    stakeUrl: "https://wallet.keplr.app/chains/osmosis?tab=staking",
    governanceUrl: "https://wallet.keplr.app/chains/osmosis?tab=governance",
    features: ["sign-arbitrary"],
  },
  {
    ...CosmosKitWalletList["keplr-mobile"],
    logo: "/wallets/keplr.svg",
    lazyInstall: () =>
      import("~/integrations/keplr-walletconnect").then(
        (m) => m.KeplrMobileWallet
      ),
    supportsChain: async (chainId) => {
      const keplrMobileAvailableChains: AvailableChainIds[] = [
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

      return keplrMobileAvailableChains.includes(chainId as AvailableChainIds);
    },
    stakeUrl: "https://wallet.keplr.app/chains/osmosis?tab=staking",
    governanceUrl: "https://wallet.keplr.app/chains/osmosis?tab=governance",
    features: ["sign-arbitrary"],
  },
  {
    ...CosmosKitWalletList["leap-extension"],
    logo: "/wallets/leap.svg",
    mobileDisabled: false,
    lazyInstall: () =>
      import("@cosmos-kit/leap-extension").then((m) => m.LeapExtensionWallet),
    windowPropertyName: "leap",
    stakeUrl: "https://cosmos.leapwallet.io/staking",
    governanceUrl: "https://cosmos.leapwallet.io/gov",
    features: ["sign-arbitrary"],
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
    features: ["sign-arbitrary"],
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
  },
  // {
  //   ...CosmosKitWalletList["okxwallet-extension"],
  //   logo: "/wallets/okx.png",
  //   lazyInstall: () =>
  //     import("@cosmos-kit/okxwallet-extension").then(
  //       (m) => m.OkxwalletExtensionWallet
  //     ),
  //   windowPropertyName: "okxwallet",
  //   async supportsChain(chainId, retryCount = 0) {
  //     if (typeof window === "undefined") return true;

  //     const okxWallet = (window as any)?.okxwallet?.keplr as {
  //       getKey: (chainId: string) => Promise<boolean>;
  //     };

  //     if (!okxWallet) return true;

  //     try {
  //       await okxWallet.getKey(chainId);
  //       return true;
  //     } catch (e) {
  //       const error = e as { code: number; message: string };

  //       // Check for chain not supported error
  //       if (
  //         error.code === -32603 &&
  //         error.message.includes("There is no chain info")
  //       ) {
  //         return false;
  //       }

  //       // Retry if the wallet is already processing
  //       if (
  //         error.code === -32002 &&
  //         error.message.includes("Already processing") &&
  //         retryCount < 5
  //       ) {
  //         /**
  //          * Simple exponential backoff mechanism where the delay doubles
  //          * with each retry. Here, we have a base delay of 100 milliseconds.
  //          * So, the first retry will wait for 200 ms,
  //          * the second for 400 ms, and so on.
  //          */
  //         await new Promise((resolve) =>
  //           setTimeout(resolve, Math.pow(2, retryCount) * 100)
  //         );
  //         // @ts-ignore
  //         return this.supportsChain(chainId, retryCount + 1);
  //       }

  //       return false;
  //     }
  //   },
  //   matchError: (error) => {
  //     if (typeof error !== "string") return error;

  //     if (
  //       error.includes(
  //         "Already processing wallet_requestIdentities. Please wait."
  //       )
  //     ) {
  //       return new WalletConnectionInProgressError();
  //     }

  //     return error;
  //   },
  // },
];
