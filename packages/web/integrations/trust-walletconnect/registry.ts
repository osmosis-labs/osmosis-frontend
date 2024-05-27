import type { Wallet } from "@cosmos-kit/core";

export const trustMobileInfo: Wallet = {
  name: "trust-mobile",
  prettyName: "Trust Mobile",
  logo: "https://ia804606.us.archive.org/28/items/github.com-trustwallet-assets_-_2022-01-03_21-15-20/cover.jpg",
  mode: "wallet-connect",
  mobileDisabled: false,
  rejectMessage: {
    source: "Request rejected",
  },
  downloads: [
    {
      device: "mobile",
      os: "android",
      link: "https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp",
    },
    {
      device: "mobile",
      os: "ios",
      link: "https://apps.apple.com/us/app/trust-crypto-bitcoin-wallet/id1288339409?mt=8",
    },
    {
      link: "https://trustwallet.com/download",
    },
  ],
  connectEventNamesOnWindow: ["trust_keystorechange"],
  walletconnect: {
    name: "Trust Wallet",
    projectId:
      "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0",
  },
};
