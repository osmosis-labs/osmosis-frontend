/* eslint-disable import/no-extraneous-dependencies */
import type { Wallet } from "@cosmos-kit/core";

export const WalletRegistry: (Wallet & { lazyInstall: Function })[] = [
  {
    name: "keplr-extension",
    logo: "/wallets/keplr.svg",
    prettyName: "Keplr",
    mode: "extension",
    mobileDisabled: true,
    rejectMessage: { source: "Request rejected" },
    connectEventNamesOnWindow: ["keplr_keystorechange"],
    downloads: [
      {
        device: "desktop",
        browser: "chrome",
        link: "https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en",
      },
      {
        device: "desktop",
        browser: "firefox",
        link: "https://addons.mozilla.org/en-US/firefox/addon/keplr/",
      },
      { link: "https://www.keplr.app/download" },
    ],
    lazyInstall: () =>
      import("@cosmos-kit/keplr-extension").then((m) => m.KeplrExtensionWallet),
  },
  {
    name: "keplr-mobile",
    prettyName: "Keplr Mobile",
    logo: "/wallets/keplr.svg",
    mode: "wallet-connect",
    mobileDisabled: false,
    rejectMessage: { source: "Request rejected" },
    downloads: [
      {
        device: "mobile",
        os: "android",
        link: "https://play.google.com/store/apps/details?id=com.chainapsis.keplr&hl=en&gl=US&pli=1",
      },
      {
        device: "mobile",
        os: "ios",
        link: "https://apps.apple.com/us/app/keplr-wallet/id1567851089",
      },
      { link: "https://www.keplr.app/download" },
    ],
    connectEventNamesOnWindow: ["keplr_keystorechange"],
    walletconnect: {
      name: "Keplr",
      projectId:
        "6adb6082c909901b9e7189af3a4a0223102cd6f8d5c39e39f3d49acb92b578bb",
      encoding: "base64",
      mobile: { native: "keplrwallet:" },
    },
    lazyInstall: () =>
      import("@cosmos-kit/keplr-mobile").then((m) => m.KeplrMobileWallet),
  },
  {
    name: "leap-extension",
    logo: "/wallets/leap.png",
    prettyName: "Leap",
    mode: "extension",
    mobileDisabled: true,
    rejectMessage: { source: "Request rejected" },
    connectEventNamesOnWindow: ["leap_keystorechange"],
    downloads: [
      {
        device: "desktop",
        browser: "chrome",
        link: "https://chrome.google.com/webstore/detail/leap-cosmos-wallet/fcfcfllfndlomdhbehjjcoimbgofdncg",
      },
      {
        link: "https://chrome.google.com/webstore/detail/leap-cosmos-wallet/fcfcfllfndlomdhbehjjcoimbgofdncg",
      },
    ],
    lazyInstall: () =>
      import("@cosmos-kit/leap-extension").then((m) => m.LeapExtensionWallet),
  },
  {
    name: "cosmostation-extension",
    logo: "/wallets/cosmostation.png",
    prettyName: "Cosmostation",
    mode: "extension",
    downloads: [
      {
        device: "desktop",
        browser: "chrome",
        link: "https://chrome.google.com/webstore/detail/cosmostation/fpkhgmpbidmiogeglndfbkegfdlnajnf?hl=en",
      },
      { link: "https://cosmostation.io/wallet/#extension" },
    ],
    mobileDisabled: true,
    rejectMessage: {
      source:
        "The requested account and/or method has not been authorized by the user.",
    },
    rejectCode: 4001,
    connectEventNamesOnClient: ["accountChanged"],
    lazyInstall: () =>
      import("@cosmos-kit/cosmostation-extension").then(
        (m) => m.CosmostationExtensionWallet
      ),
  },
  {
    name: "cosmostation-mobile",
    prettyName: "Cosmostation Mobile",
    logo: "/wallets/cosmostation.png",
    mode: "wallet-connect",
    downloads: [
      {
        device: "mobile",
        os: "android",
        link: "https://play.google.com/store/apps/details?id=wannabit.io.cosmostaion",
      },
      {
        device: "mobile",
        os: "ios",
        link: "https://apps.apple.com/kr/app/cosmostation/id1459830339",
      },
      { link: "https://cosmostation.io/wallet/#extension" },
    ],
    mobileDisabled: false,
    walletconnect: {
      name: "Cosmostation",
      projectId:
        "feb6ff1fb426db18110f5a80c7adbde846d0a7e96b2bc53af4b73aaf32552bea",
    },
    lazyInstall: () =>
      import("@cosmos-kit/cosmostation-mobile").then(
        (m) => m.CosmostationMobileWallet
      ),
  },
  {
    name: "frontier-extension",
    logo: "/wallets/frontier.png",
    prettyName: "Frontier",
    mode: "extension",
    mobileDisabled: true,
    rejectMessage: { source: "Request rejected" },
    downloads: [
      {
        device: "desktop",
        browser: "chrome",
        link: "https://chrome.google.com/webstore/detail/frontier-wallet/kppfdiipphfccemcignhifpjkapfbihd",
      },
      {
        link: "https://chrome.google.com/webstore/detail/frontier-wallet/kppfdiipphfccemcignhifpjkapfbihd",
      },
    ],
    lazyInstall: () =>
      import("@cosmos-kit/frontier-extension").then(
        (m) => m.FrontierExtensionWallet
      ),
  },
  {
    name: "terrastation-extension",
    logo: "/wallets/terrastation.svg",
    prettyName: "Terra Station",
    mode: "extension",
    mobileDisabled: true,
    connectEventNamesOnWindow: [],
    downloads: [
      {
        device: "desktop",
        browser: "chrome",
        link: "https://chrome.google.com/webstore/detail/station-wallet/aiifbnbfobpmeekipheeijimdpnlpgpp",
      },
      {
        device: "desktop",
        browser: "firefox",
        link: "https://addons.mozilla.org/en-US/firefox/addon/terra-station-wallet/",
      },
    ],
    lazyInstall: () =>
      import("@cosmos-kit/terrastation-extension").then(
        (m) => m.TerrastationExtensionWallet
      ),
  },
  {
    name: "trust-mobile",
    prettyName: "Trust Mobile",
    logo: "/wallets/trust.png",
    mode: "wallet-connect",
    mobileDisabled: false,
    rejectMessage: { source: "Request rejected" },
    downloads: [
      {
        device: "mobile",
        os: "android",
        link: "https://play.google.com/store/apps/details?id=com.chainapsis.trust&hl=en&gl=US&pli=1",
      },
      {
        device: "mobile",
        os: "ios",
        link: "https://apps.apple.com/us/app/trust-wallet/id1567851089",
      },
      { link: "https://www.trust.app/download" },
    ],
    connectEventNamesOnWindow: ["trust_keystorechange"],
    walletconnect: {
      name: "Trust Wallet",
      projectId:
        "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0",
    },
    lazyInstall: () =>
      import("@cosmos-kit/trust-mobile").then((m) => m.TrustMobileWallet),
  },
  {
    name: "xdefi-extension",
    logo: "/wallets/xdefi.png",
    prettyName: "XDEFI",
    mode: "extension",
    mobileDisabled: true,
    rejectMessage: { source: "Request rejected" },
    downloads: [
      {
        device: "desktop",
        browser: "chrome",
        link: "https://chrome.google.com/webstore/detail/xdefi-wallet/hmeobnfnfcmdkdcmlblgagmfpfboieaf",
      },
      {
        link: "https://chrome.google.com/webstore/detail/xdefi-wallet/hmeobnfnfcmdkdcmlblgagmfpfboieaf",
      },
    ],
    lazyInstall: () =>
      import("@cosmos-kit/xdefi-extension").then((m) => m.XDEFIExtensionWallet),
  },
  {
    name: "omni-mobile",
    prettyName: "Omni Mobile",
    logo: "/wallets/omni.webp",
    mode: "wallet-connect",
    mobileDisabled: false,
    rejectMessage: { source: "Request rejected" },
    downloads: [
      {
        device: "mobile",
        os: "android",
        link: "https://play.google.com/store/apps/details?id=com.chainapsis.omni&hl=en&gl=US&pli=1",
      },
      {
        device: "mobile",
        os: "ios",
        link: "https://apps.apple.com/us/app/omni-wallet/id1567851089",
      },
      { link: "https://www.omni.app/download" },
    ],
    connectEventNamesOnWindow: ["omni_keystorechange"],
    walletconnect: {
      name: "Omni",
      projectId:
        "afbd95522f4041c71dd4f1a065f971fd32372865b416f95a0b1db759ae33f2a7",
    },
    lazyInstall: () =>
      import("@cosmos-kit/omni-mobile").then((m) => m.OmniMobileWallet),
  },
];
