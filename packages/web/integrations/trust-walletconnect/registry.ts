import { OS, Wallet } from "@cosmos-kit/core";

export const trustMobileInfo: Wallet = {
  name: "trust-mobile",
  prettyName: "Trust Mobile",
  logo: "/wallets/trust.png",
  mode: "wallet-connect",
  mobileDisabled: false,
  rejectMessage: {
    source: "Request rejected",
  },
  downloads: [
    {
      device: "mobile",
      os: "android",
      link: "https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp&pli=1",
    },
    {
      device: "mobile",
      os: "ios",
      link: "https://apps.apple.com/app/apple-store/id1288339409?mt=8",
    },
    {
      link: "https://trustwallet.com/download/apk",
    },
  ],
  connectEventNamesOnWindow: ["trust_keystorechange"],
  walletconnect: {
    name: "Trust",
    projectId:
      "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0",
    encoding: "base64",
    mobile: {
      native: {
        ios: "trustwallet:",
        android: "intent:",
      },
    },
    formatNativeUrl: (
      appUrl: string,
      wcUri: string,
      os: OS | undefined,
      _name: string
    ): string => {
      const plainAppUrl = appUrl.replaceAll("/", "").replaceAll(":", "");
      const encodedWcUrl = encodeURIComponent(wcUri);
      switch (os) {
        case "ios":
          return `${plainAppUrl}://wcV2?${encodedWcUrl}`;
        case "android":
          return `${plainAppUrl}://wcV2?${encodedWcUrl}#Intent;package=com.chainapsis.trust;scheme=trustwallet;end;`;
        default:
          return `${plainAppUrl}://wcV2?${encodedWcUrl}`;
      }
    },
  },
};
