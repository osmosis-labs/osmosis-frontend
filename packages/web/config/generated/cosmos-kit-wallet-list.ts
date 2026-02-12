import { Wallet } from "@cosmos-kit/core";
export enum AvailableCosmosWallets {
  Exodus = "exodus-extension",
  Keplr = "keplr-extension",
  KeplrMobile = "keplr-mobile",
  Leap = "leap-extension",
  LeapMobile = "leap-cosmos-mobile",
  Okxwallet = "okxwallet-extension",
  Trust = "trust-extension",
  Xdefi = "xdefi-extension",
  Cosmostation = "cosmostation-extension",
  Station = "station-extension",
  Cdcwallet = "cdcwallet-extension",
}
export const CosmosKitWalletList: Record<AvailableCosmosWallets, Wallet> = {
  [AvailableCosmosWallets.Exodus]: {
    name: "exodus-extension",
    prettyName: "Exodus",
    logo: "",
    mode: "extension",
    lazyInstall: () =>
      import("@cosmos-kit/exodus-extension").then((m) => m.ExodusExtensionWallet),
    windowPropertyName: "exodus",
  },
  [AvailableCosmosWallets.Keplr]: {
    name: "keplr-extension",
    prettyName: "Keplr",
    logo: "",
    mode: "extension",
    lazyInstall: () =>
      import("@cosmos-kit/keplr-extension").then((m) => m.KeplrExtensionWallet),
    windowPropertyName: "keplr",
  },
  [AvailableCosmosWallets.KeplrMobile]: {
    name: "keplr-mobile",
    prettyName: "Keplr Wallet",
    logo: "",
    mode: "wallet-connect",
    lazyInstall: () =>
      import("@cosmos-kit/keplr-mobile").then((m) => m.KeplrMobileWallet),
  },
  [AvailableCosmosWallets.Leap]: {
    name: "leap-extension",
    prettyName: "Leap",
    logo: "",
    mode: "extension",
    lazyInstall: () =>
      import("@cosmos-kit/leap-extension").then((m) => m.LeapExtensionWallet),
    windowPropertyName: "leap",
  },
  [AvailableCosmosWallets.LeapMobile]: {
    name: "leap-cosmos-mobile",
    prettyName: "Leap",
    logo: "",
    mode: "wallet-connect",
    lazyInstall: () =>
      import("@cosmos-kit/leap-mobile").then((m) => m.LeapMobileWallet),
  },
  [AvailableCosmosWallets.Okxwallet]: {
    name: "okxwallet-extension",
    prettyName: "OKX Wallet",
    logo: "",
    mode: "extension",
    lazyInstall: () =>
      import("@cosmos-kit/okxwallet-extension").then((m) => m.OkxwalletExtensionWallet),
    windowPropertyName: "okxwallet",
  },
  [AvailableCosmosWallets.Trust]: {
    name: "trust-extension",
    prettyName: "Trust",
    logo: "",
    mode: "extension",
    lazyInstall: () =>
      import("@cosmos-kit/trust-extension").then((m) => m.TrustExtensionWallet),
    windowPropertyName: "trustwallet",
  },
  [AvailableCosmosWallets.Xdefi]: {
    name: "xdefi-extension",
    prettyName: "XDEFI",
    logo: "",
    mode: "extension",
    lazyInstall: () =>
      import("@cosmos-kit/xdefi-extension").then((m) => m.XDEFIExtensionWallet),
    windowPropertyName: "xfi",
  },
  [AvailableCosmosWallets.Cosmostation]: {
    name: "cosmostation-extension",
    prettyName: "Cosmostation",
    logo: "",
    mode: "extension",
    lazyInstall: () =>
      import("@cosmos-kit/cosmostation-extension").then((m) => m.CosmostationExtensionWallet),
    windowPropertyName: "cosmostation",
  },
  [AvailableCosmosWallets.Station]: {
    name: "station-extension",
    prettyName: "Station",
    logo: "",
    mode: "extension",
    lazyInstall: () =>
      import("@cosmos-kit/station-extension").then((m) => m.StationExtensionWallet),
    windowPropertyName: "station",
  },
  [AvailableCosmosWallets.Cdcwallet]: {
    name: "cdcwallet-extension",
    prettyName: "Crypto.com",
    logo: "",
    mode: "extension",
    lazyInstall: () =>
      import("@cosmos-kit/cdcwallet-extension").then((m) => m.CdcwalletExtensionWallet),
    windowPropertyName: "cdc_wallet",
  },
};
